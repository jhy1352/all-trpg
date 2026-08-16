import React, { useState, useEffect } from 'react';
import { GameState, ChatMessage, DiceRollResult } from './types';
import { createEmptyGameState, hydrateGameStateWithDefaults } from './utils/factory';
import { parseGMResponseMetaData } from './utils/parser';
import { soundEngine } from './utils/audio';
import { CreationPhase } from './components/CreationPhase';
import { GameInterface } from './components/GameInterface';
import { WorldInfoModal } from './components/WorldInfoModal';
import { CharacterSheetModal } from './components/CharacterSheetModal';
import { DiceRollerModal } from './components/DiceRollerModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { KO } from './locales/ko';
import { 
  BookOpen, User, Dices, Cloud, 
  Volume2, VolumeX, Sparkles, AlertCircle
} from 'lucide-react';

const STORAGE_KEY = 'TRPG_ENGINE_SESSION_V1';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.world && parsed.character) {
            return hydrateGameStateWithDefaults(parsed);
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return createEmptyGameState();
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatusText, setLoadingStatusText] = useState<string>('게임마스터가 세계관 고증 및 서사를 집필하고 있습니다...');
  const [lastFailedRequest, setLastFailedRequest] = useState<{
    type: 'send' | 'start';
    payload: any;
    userContent?: string;
    diceResult?: DiceRollResult;
  } | null>(null);
  const [creationSessionKey, setCreationSessionKey] = useState<number>(Date.now());
  const [showWorldModal, setShowWorldModal] = useState(false);
  const [showCharModal, setShowCharModal] = useState(false);
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Save to localStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch {}
  }, [gameState]);

  // Handle Sound Mute Toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  // Robust Fetch With Silent Auto-Retry (Max 2 Retries)
  const fetchGMResponseWithRetry = async (payload: any, maxRetries = 2): Promise<any> => {
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for Deep Thinking

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }

        const data = await res.json();
        if (data && data.reply) {
          return data;
        }
        throw new Error('Empty response payload');
      } catch (err: any) {
        attempt++;
        if (attempt > maxRetries) {
          throw err;
        }
        setLoadingStatusText(`최상위 심층사고 AI 연결 조율 중: 무손실 자동 재연결 (${attempt}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  };

  // Complete Creation Phase and Start Game
  const handleCompleteCreation = async () => {
    const updatedState: GameState = {
      ...gameState,
      phase: 'playing',
      turnCount: 1,
    };
    setGameState(updatedState);
    soundEngine.setAtmosphericAmbient('mystic_start');

    // Trigger Initial Opening Narrative from GM
    setIsLoading(true);
    setLoadingStatusText(`📜 [${updatedState.world.worldName}]의 정사를 대조하고 서막의 장을 펼치는 중...`);

    try {
      const data = await fetchGMResponseWithRetry({
        world: updatedState.world,
        character: updatedState.character,
        messages: [],
        userMessage: `[게임 시작 선언]: ${updatedState.world.worldName} 세계관에서 ${updatedState.character.name}(${updatedState.character.title})의 서사적 서막을 열어주십시오.`,
        latestSavePackageSnapshot: undefined,
        isMetaQuery: false,
      });

      setIsLoading(false);

      if (data && data.reply) {
        const parsed = parseGMResponseMetaData(data.reply, undefined, updatedState.character);
        soundEngine.playTurnComplete();

        const initialMsg: ChatMessage = {
          id: `msg-1`,
          role: 'assistant',
          content: parsed.cleanNarrative,
          rawContent: data.reply,
          metadata: parsed.metadata,
          turnNumber: 1,
          timestamp: Date.now(),
        };

        setGameState((prev) => {
          let updatedWorld = prev.world;
          if (parsed.detectedDC) {
            const history = [...(updatedWorld.dcRecords?.dcHistory || []), parsed.detectedDC.dc];
            updatedWorld = {
              ...updatedWorld,
              dcRecords: {
                ...updatedWorld.dcRecords,
                lastDC: parsed.detectedDC.dc,
                dcHistory: history,
              },
            };
          }

          return {
            ...prev,
            world: updatedWorld,
            messages: [initialMsg],
            pendingDCRequest: parsed.detectedDC || null,
            character: parsed.updatedCharacterUpdates
              ? { ...prev.character, ...parsed.updatedCharacterUpdates }
              : prev.character,
          };
        });
      }
    } catch {
      setIsLoading(false);
      setLastFailedRequest({
        type: 'start',
        payload: {
          world: updatedState.world,
          character: updatedState.character,
          messages: [],
          userMessage: `[게임 시작 선언]: ${updatedState.world.worldName} 세계관에서 ${updatedState.character.name}(${updatedState.character.title})의 서사적 서막을 열어주십시오.`,
          latestSavePackageSnapshot: undefined,
          isMetaQuery: false,
        },
      });
    }
  };

  // Helper to detect if prompt is a meta-query / system request
  const checkIsMetaQuery = (text: string): boolean => {
    const trimmed = text.trim();
    if (trimmed.startsWith('/') || trimmed.startsWith('?') || trimmed.startsWith('[메타') || trimmed.startsWith('[시스템')) {
      return true;
    }
    if (trimmed.includes('규칙 질문') || trimmed.includes('시스템 현황') || trimmed.includes('능력치 확인 요청')) {
      return true;
    }
    return false;
  };

  // Send User Message to GM API
  const handleSendMessage = async (content: string, diceResult?: DiceRollResult) => {
    if (isLoading) return;

    const isMetaQuery = checkIsMetaQuery(content);
    const currentTurn = isMetaQuery ? gameState.turnCount : gameState.turnCount + 1;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content,
      turnNumber: currentTurn,
      timestamp: Date.now(),
      isDiceRollTurn: !!diceResult,
      diceRollResult: diceResult,
      isMetaQuery,
    };

    const nextMessages = [...gameState.messages, userMsg];
    setGameState((prev) => ({
      ...prev,
      messages: nextMessages,
      turnCount: currentTurn,
      pendingDCRequest: null, // Clear pending DC check upon reply
    }));

    setIsLoading(true);
    setLoadingStatusText(
      currentTurn % 15 === 0
        ? '🔒 [15턴 자동 무손실 세이브 패키지 동기화 및 서사 집필 중...]'
        : '게임마스터가 세계관 고증 및 서사를 집필하고 있습니다...'
    );

    try {
      const data = await fetchGMResponseWithRetry({
        world: gameState.world,
        character: gameState.character,
        messages: nextMessages,
        userMessage: content,
        latestSavePackageSnapshot: gameState.latestSavePackageSnapshot,
        isMetaQuery,
      });

      setIsLoading(false);

      if (data && data.reply) {
        const prevMeta = gameState.messages[gameState.messages.length - 1]?.metadata;
        const parsed = parseGMResponseMetaData(data.reply, prevMeta, gameState.character);
        soundEngine.playTurnComplete();

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-gm`,
          role: 'assistant',
          content: parsed.cleanNarrative,
          rawContent: data.reply,
          metadata: parsed.metadata,
          turnNumber: currentTurn,
          timestamp: Date.now(),
          autoSaveCode: data.autoSaveCode,
          isSavePackageBlock: !!parsed.savePackage,
          savePackageContent: parsed.savePackage,
        };

        setGameState((prev) => {
          let updatedWorld = prev.world;
          let updatedChar = prev.character;

          // Real-time metadata sync if present
          if (parsed.metadata) {
            // Update active seeds
            if (parsed.extractedSeeds && parsed.extractedSeeds.length > 0) {
              updatedWorld = {
                ...updatedWorld,
                seeds: parsed.extractedSeeds.map((text, i) => ({
                  id: `seed-${Date.now()}-${i}`,
                  text,
                  status: 'active',
                })),
              };
            }

            // Update DC records
            if (parsed.detectedDC) {
              const history = [...(updatedWorld.dcRecords?.dcHistory || []), parsed.detectedDC.dc];
              updatedWorld = {
                ...updatedWorld,
                dcRecords: {
                  ...updatedWorld.dcRecords,
                  lastDC: parsed.detectedDC.dc,
                  dcHistory: history,
                },
              };
            }
          }

          // Dynamic character updates if GM changed items/goal/stats/disabilities
          if (parsed.updatedCharacterUpdates) {
            updatedChar = { ...updatedChar, ...parsed.updatedCharacterUpdates };
          }

          return {
            ...prev,
            world: updatedWorld,
            character: updatedChar,
            messages: [...nextMessages, assistantMsg],
            pendingDCRequest: parsed.detectedDC || null,
            lastAutoSaveCode: data.autoSaveCode || prev.lastAutoSaveCode,
            latestSavePackageSnapshot: parsed.savePackage || prev.latestSavePackageSnapshot,
          };
        });
      }
    } catch {
      setIsLoading(false);
      setLastFailedRequest({
        type: 'send',
        payload: {
          world: gameState.world,
          character: gameState.character,
          messages: nextMessages,
          userMessage: content,
          latestSavePackageSnapshot: gameState.latestSavePackageSnapshot,
          isMetaQuery,
        },
        userContent: content,
        diceResult,
      });
    }
  };

  // Retry the Last Failed Turn seamlessly without re-typing
  const handleRetryLastAction = async () => {
    if (!lastFailedRequest || isLoading) return;
    setIsLoading(true);
    setLoadingStatusText('최상위 심층사고 AI에 서사 집필을 다시 요청하고 있습니다...');
    const req = lastFailedRequest;
    setLastFailedRequest(null);

    try {
      const data = await fetchGMResponseWithRetry(req.payload);
      setIsLoading(false);

      if (data && data.reply) {
        if (req.type === 'start') {
          const parsed = parseGMResponseMetaData(data.reply, undefined, gameState.character);
          soundEngine.playTurnComplete();
          const initialMsg: ChatMessage = {
            id: `msg-1`,
            role: 'assistant',
            content: parsed.cleanNarrative,
            rawContent: data.reply,
            metadata: parsed.metadata,
            turnNumber: 1,
            timestamp: Date.now(),
          };
          setGameState((prev) => ({
            ...prev,
            messages: [initialMsg],
            pendingDCRequest: parsed.detectedDC || null,
          }));
        } else {
          const prevMeta = gameState.messages[gameState.messages.length - 1]?.metadata;
          const parsed = parseGMResponseMetaData(data.reply, prevMeta, gameState.character);
          soundEngine.playTurnComplete();

          const assistantMsg: ChatMessage = {
            id: `msg-${Date.now()}-gm`,
            role: 'assistant',
            content: parsed.cleanNarrative,
            rawContent: data.reply,
            metadata: parsed.metadata,
            turnNumber: gameState.turnCount,
            timestamp: Date.now(),
            autoSaveCode: data.autoSaveCode,
            isSavePackageBlock: !!parsed.savePackage,
            savePackageContent: parsed.savePackage,
          };

          setGameState((prev) => ({
            ...prev,
            messages: [...prev.messages, assistantMsg],
            pendingDCRequest: parsed.detectedDC || null,
            lastAutoSaveCode: data.autoSaveCode || prev.lastAutoSaveCode,
            latestSavePackageSnapshot: parsed.savePackage || prev.latestSavePackageSnapshot,
          }));
        }
      }
    } catch {
      setIsLoading(false);
      setLastFailedRequest(req);
    }
  };

  // Reset Session Completely to New Game (Direct & Reliable, no native window.confirm blocker)
  const handleResetSession = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setGameState(createEmptyGameState());
    setCreationSessionKey(Date.now());
    setLastFailedRequest(null);
    setShowSyncModal(false);
  };

  // Load Saved Game Payload from Cloud
  const handleApplyLoadedSession = (loadedState: GameState) => {
    const hydrated = hydrateGameStateWithDefaults(loadedState);
    setGameState(hydrated);
    setLastFailedRequest(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hydrated));
    } catch {}
    setShowSyncModal(false);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-stone-900/90 border-b border-stone-800 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-amber-500/20">
            <span className="font-bold text-stone-950 text-base">TR</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-sm sm:text-base text-stone-100 tracking-wide">
                TRPG MASTER ENGINE
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                Rev 3.1 Final
              </span>
            </div>
            {gameState.phase === 'playing' && (
              <p className="text-xs text-stone-400 font-medium">
                {gameState.world.worldName} | 턴 {gameState.turnCount}
              </p>
            )}
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {gameState.phase === 'playing' && (
            <>
              <button
                onClick={() => setShowWorldModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors border border-stone-700/60 shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">세계관 & 인물록</span>
              </button>

              <button
                onClick={() => setShowCharModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors border border-stone-700/60 shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">캐릭터 시트</span>
              </button>

              <button
                onClick={() => setShowDiceModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors border border-stone-700/60 shadow-sm"
              >
                <Dices className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">주사위 롤러</span>
              </button>
            </>
          )}

          <button
            onClick={() => setShowSyncModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition-colors border border-amber-500/40 shadow-sm"
            title="클라우드 저장, 불러오기 및 세션 초기화"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">세이브 · 동기화 · 초기화</span>
            <span className="sm:hidden">동기화/초기화</span>
          </button>

          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors border border-stone-700/60"
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-3 sm:p-6 overflow-hidden">
        {gameState.phase === 'creation' ? (
          <CreationPhase
            key={creationSessionKey}
            world={gameState.world}
            character={gameState.character}
            onUpdateWorld={(w) => setGameState((prev) => ({ ...prev, world: w }))}
            onUpdateCharacter={(c) => setGameState((prev) => ({ ...prev, character: c }))}
            onComplete={handleCompleteCreation}
          />
        ) : (
          <GameInterface
            messages={gameState.messages}
            character={gameState.character}
            world={gameState.world}
            pendingDCRequest={gameState.pendingDCRequest}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            loadingStatusText={loadingStatusText}
            hasFailedTurn={!!lastFailedRequest}
            onRetry={handleRetryLastAction}
          />
        )}
      </main>

      {/* Global Modals */}
      <WorldInfoModal
        isOpen={showWorldModal}
        onClose={() => setShowWorldModal(false)}
        world={gameState.world}
      />

      <CharacterSheetModal
        isOpen={showCharModal}
        onClose={() => setShowCharModal(false)}
        character={gameState.character}
        onUpdateCharacter={(char) => setGameState((prev) => ({ ...prev, character: char }))}
      />

      <DiceRollerModal
        isOpen={showDiceModal}
        onClose={() => setShowDiceModal(false)}
        character={gameState.character}
      />

      <CloudSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        gameState={gameState}
        onRestoreState={handleApplyLoadedSession}
        onResetToNewGame={handleResetSession}
      />
    </div>
  );
};
