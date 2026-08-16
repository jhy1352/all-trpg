import React, { useState, useRef, useEffect } from 'react';
import { 
  ChatMessage, Character, WorldInfoState, PendingDCRequest, DiceRollResult 
} from '../types';
import { MetadataAccordion } from './MetadataAccordion';
import { rollD20WithModifier, calculateModifier } from '../utils/dice';
import { soundEngine } from '../utils/audio';
import { 
  Send, Sparkles, Dices, ArrowRight, CheckCircle2, 
  AlertCircle, ChevronRight, User, Shield, HelpCircle,
  Volume2, VolumeX, RotateCcw, Award, Check, Zap, Lock
} from 'lucide-react';

interface GameInterfaceProps {
  messages: ChatMessage[];
  character: Character;
  world: WorldInfoState;
  pendingDCRequest?: PendingDCRequest | null;
  onSendMessage: (content: string, diceResult?: DiceRollResult) => Promise<void>;
  isLoading: boolean;
  loadingStatusText?: string;
  hasFailedTurn?: boolean;
  onRetry?: () => void;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({
  messages,
  character,
  world,
  pendingDCRequest,
  onSendMessage,
  isLoading,
  loadingStatusText,
  hasFailedTurn,
  onRetry,
}) => {
  const [inputText, setInputText] = useState('');
  const [inGameDiceResult, setInGameDiceResult] = useState<DiceRollResult | null>(null);
  const [manualDiceInput, setManualDiceInput] = useState<string>('');
  const [isManualInputMode, setIsManualInputMode] = useState<boolean>(false);
  const [isRolling, setIsRolling] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, pendingDCRequest, inGameDiceResult]);

  // Extract numbered choices from the latest GM message (if any)
  const getLatestChoices = (): string[] => {
    if (messages.length === 0) return [];
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastAssistantMsg) return [];

    const lines = lastAssistantMsg.content.split('\n');
    const choices: string[] = [];
    const choiceRegex = /^\s*(?:[1-9]\.|\([1-9]\)|\[[1-9]\]|[①-⑩])\s+(.+)$/;

    for (const line of lines) {
      const match = line.match(choiceRegex);
      if (match && match[1] && match[1].trim().length > 0) {
        choices.push(match[1].trim());
      }
    }
    return choices;
  };

  const detectedChoices = getLatestChoices();

  // Helper for outcome calculation
  const calculateOutcomeType = (rawRoll: number, diff: number) => {
    if (rawRoll === 1) return { outcome: 'critical_failure' as const, description: '치명적 대실패 (Natural 1)' };
    if (rawRoll === 20) return { outcome: 'miraculous_success' as const, description: '기적적인 대성공 (Natural 20)' };
    if (diff >= 7) return { outcome: 'major_success' as const, description: '대성공' };
    if (diff >= 4) return { outcome: 'normal_success' as const, description: '성공' };
    if (diff >= 0) return { outcome: 'narrow_success' as const, description: '아슬아슬한 성공' };
    if (diff >= -3) return { outcome: 'narrow_failure' as const, description: '아슬아슬한 실패' };
    if (diff >= -6) return { outcome: 'normal_failure' as const, description: '실패' };
    return { outcome: 'major_failure' as const, description: '대실패' };
  };

  // Handle Quick In-Narrative Dice Roll
  const handleQuickRoll = (overrideValue?: number, autoDeclareChoiceText?: string) => {
    if (!pendingDCRequest) return;
    setIsRolling(true);
    soundEngine.playDiceRoll();

    setTimeout(() => {
      // Find stat modifier
      let statVal = 10;
      const statName = pendingDCRequest.stat.toLowerCase();
      if (statName.includes('근력') || statName.includes('공력')) statVal = character.stats.strength;
      else if (statName.includes('민첩') || statName.includes('신법')) statVal = character.stats.agility;
      else if (statName.includes('체력') || statName.includes('기골')) statVal = character.stats.vitality;
      else if (statName.includes('지략') || statName.includes('학식') || statName.includes('지능')) statVal = character.stats.intellect;
      else if (statName.includes('통찰') || statName.includes('안목')) statVal = character.stats.insight;
      else if (statName.includes('정신') || statName.includes('의지')) statVal = character.stats.willpower;

      const mod = calculateModifier(statVal);
      let res: DiceRollResult;

      if (overrideValue && overrideValue >= 1 && overrideValue <= 20) {
        const rawRoll = overrideValue;
        const total = rawRoll + mod;
        const diff = total - pendingDCRequest.dc;
        const outcomeInfo = calculateOutcomeType(rawRoll, diff);
        res = {
          sides: 20,
          rawRoll,
          modifier: mod,
          total,
          targetDC: pendingDCRequest.dc,
          statName: pendingDCRequest.stat,
          outcome: outcomeInfo.outcome,
          description: outcomeInfo.description,
        };
      } else {
        res = rollD20WithModifier(mod, pendingDCRequest.dc, pendingDCRequest.stat);
      }

      setInGameDiceResult(res);
      setIsRolling(false);

      if (res.outcome === 'miraculous_success' || res.outcome.includes('success')) {
        soundEngine.playSuccessSound();
      } else {
        soundEngine.playFailureSound();
      }

      // If autoDeclareChoiceText is provided or if no choice is required, send immediately!
      if (autoDeclareChoiceText) {
        const diceText = `[주사위 판정 결과: D20=${res.rawRoll} (${res.modifier >= 0 ? `+${res.modifier}` : res.modifier}), 총합 ${res.total} vs DC ${res.targetDC} -> ${res.description}] ${autoDeclareChoiceText}`;
        onSendMessage(diceText, res);
        setInGameDiceResult(null);
        setInputText('');
      }
    }, 400);
  };

  // Submit Handler
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    let textToSend = inputText.trim();
    if (inGameDiceResult) {
      const diceHeader = `[주사위 판정 결과: D20=${inGameDiceResult.rawRoll} (${inGameDiceResult.modifier >= 0 ? `+${inGameDiceResult.modifier}` : inGameDiceResult.modifier}), 총합 ${inGameDiceResult.total} vs DC ${inGameDiceResult.targetDC} -> ${inGameDiceResult.description}]`;
      textToSend = textToSend ? `${diceHeader} ${textToSend}` : diceHeader;
    }

    if (!textToSend) return;

    onSendMessage(textToSend, inGameDiceResult || undefined);
    setInputText('');
    setInGameDiceResult(null);
  };

  // Quick Choice Click Handler
  const handleSelectChoice = (choiceText: string) => {
    if (isLoading) return;
    if (pendingDCRequest) {
      handleQuickRoll(undefined, choiceText);
    } else {
      onSendMessage(choiceText);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative h-[calc(100vh-5.5rem)] max-w-5xl mx-auto w-full bg-stone-950 border border-stone-800/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Narrative Chat Log Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-36">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {/* Turn & Speaker Header */}
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[10px] font-mono text-stone-500">
                Turn {msg.turnNumber}
              </span>
              <span
                className={`text-xs font-semibold ${
                  msg.role === 'user' ? 'text-amber-400' : 'text-stone-300'
                }`}
              >
                {msg.role === 'user' ? character.name : '게임마스터 (GM)'}
              </span>
              {msg.isDiceRollTurn && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  🎲 판정 턴
                </span>
              )}
            </div>

            {/* Bubble Container */}
            <div
              className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 text-sm transition-all shadow-md ${
                msg.role === 'user'
                  ? 'bg-amber-950/30 text-amber-100 border border-amber-700/50 rounded-tr-none'
                  : 'bg-stone-900/90 text-stone-200 border border-stone-800 rounded-tl-none font-serif tracking-normal'
              }`}
            >
              {/* If 14th Metadata is attached to this assistant turn */}
              {msg.metadata && msg.role === 'assistant' && (
                <MetadataAccordion metadata={msg.metadata} turnNumber={msg.turnNumber} />
              )}

              {/* Clean Literary Narrative Prose */}
              <div className="whitespace-pre-wrap leading-relaxed space-y-3">
                {msg.content}
              </div>

              {/* Save Package Block If Emitted */}
              {msg.isSavePackageBlock && msg.savePackageContent && (
                <div className="mt-4 p-4 rounded-xl bg-stone-950 border border-amber-500/50 text-xs font-mono">
                  <div className="text-amber-400 font-bold mb-2">📜 [무손실 세이브 데이터 패키지]</div>
                  <pre className="overflow-x-auto text-[11px] text-stone-300 whitespace-pre-wrap">
                    {msg.savePackageContent}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-stone-900/90 border border-amber-500/50 text-amber-200 text-xs w-fit animate-pulse shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
            <span>{loadingStatusText || '게임마스터가 세계관 고증 및 서사를 집필하고 있습니다...'}</span>
          </div>
        )}

        {/* Polite High-Demand 503 Delay Notice & Retry Button */}
        {!isLoading && hasFailedTurn && (
          <div className="max-w-xl p-4 rounded-2xl bg-amber-950/40 border border-amber-500/60 shadow-xl space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="font-bold text-amber-300">
                  플레이어님의 이야기를 최상의 퀄리티(심층사고 모델)로 풀어나가기 위해 약간의 지연이 발생하고 있습니다.
                </div>
                <div className="text-stone-300 leading-relaxed">
                  현재 AI 서비스 트래픽이 일시적으로 집중되었습니다. 다시 입력하실 필요 없이 아래 [서사 집필 재시도] 버튼을 누르시면 이전 입력 그대로 즉시 이어집니다.
                </div>
              </div>
            </div>
            {onRetry && (
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>서사 집필 재시도</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* One-Touch Quick Action Chips for Detected Choices */}
        {!isLoading && detectedChoices.length > 0 && (
          <div className="max-w-3xl space-y-2 pt-2 animate-fadeIn">
            <div className="text-xs font-bold text-amber-400/90 flex items-center gap-1.5 px-1">
              <Zap className="w-3.5 h-3.5" />
              <span>원터치 행동 선택지 (클릭 시 즉시 선언):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {detectedChoices.map((choice, cIdx) => (
                <button
                  key={cIdx}
                  type="button"
                  onClick={() => handleSelectChoice(choice)}
                  className="p-3 bg-stone-900/95 hover:bg-amber-950/40 border border-stone-800 hover:border-amber-500/60 rounded-xl text-left text-xs sm:text-sm text-stone-200 hover:text-amber-200 transition-all flex items-start gap-2 shadow group"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                    {cIdx + 1}
                  </span>
                  <span className="line-clamp-2 leading-snug">{choice}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* End Ref Anchor */}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Floating In-Game Quick Dice Check Panel (When GM Requests a Check) */}
      {pendingDCRequest && (
        <div className="absolute bottom-28 left-4 right-4 max-w-2xl mx-auto z-20 bg-stone-900 border-2 border-amber-500/80 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Dices className="w-5 h-5 text-amber-400 animate-bounce" />
              <span className="font-bold text-sm text-amber-300">
                인게임 판정 요구: [{pendingDCRequest.stat}] DC {pendingDCRequest.dc}
              </span>
            </div>
            <span className="text-[11px] text-stone-400">{pendingDCRequest.actionDescription}</span>
          </div>

          {!inGameDiceResult ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-stone-300 flex items-center gap-1.5">
                <span>{pendingDCRequest.requiresChoice ? '🎲 주사위를 굴린 후 행동을 선택하세요' : '⚡ 주사위를 굴리면 서사가 즉시 진행됩니다'}</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsManualInputMode(!isManualInputMode)}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-medium"
                >
                  {isManualInputMode ? '자동 굴림' : '수동 눈금 입력'}
                </button>

                {isManualInputMode ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={manualDiceInput}
                      onChange={(e) => setManualDiceInput(e.target.value)}
                      placeholder="1~20"
                      className="w-16 bg-stone-950 border border-stone-700 rounded-lg px-2 py-1.5 text-xs text-center text-stone-100"
                    />
                    <button
                      onClick={() => handleQuickRoll(parseInt(manualDiceInput, 10))}
                      disabled={!manualDiceInput}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs"
                    >
                      반영
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleQuickRoll()}
                    disabled={isRolling}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-stone-950 font-extrabold rounded-lg text-xs shadow-lg"
                  >
                    <Dices className="w-4 h-4" />
                    <span>D20 주사위 굴리기</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-stone-950/70 p-3 rounded-xl border border-stone-800">
              <div className="text-xs">
                <span className="text-stone-400">주사위 결과: </span>
                <strong className="text-amber-300 font-bold">
                  D20={inGameDiceResult.rawRoll} ({inGameDiceResult.modifier >= 0 ? `+${inGameDiceResult.modifier}` : inGameDiceResult.modifier}), 총합 {inGameDiceResult.total}
                </strong>
                <span className="ml-2 text-emerald-400 font-semibold">{inGameDiceResult.description}</span>
              </div>
              <div className="text-[11px] text-amber-400 font-medium">
                선택지나 추가 행동을 입력하고 전송하세요 ➔
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fixed Bottom Prompt Input Area (Sticky Overlay with Clean Styling) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 bg-gradient-to-t from-stone-950 via-stone-950/95 to-transparent backdrop-blur-md border-t border-stone-800/80">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder={
                isLoading 
                  ? '🔒 서사 집필 및 시스템 동기화 중입니다...'
                  : inGameDiceResult
                  ? '주사위 결과가 준비되었습니다. 행동을 입력하고 전송하세요...'
                  : '자유 프롬프트 입력창 (인물 행동 선언, 대사, 시스템 질의 등 자유 작성)...'
              }
              className="w-full bg-stone-900 border border-stone-700/80 rounded-xl px-4 py-3.5 text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-inner disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || (!inputText.trim() && !inGameDiceResult)}
            className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            <span>전송</span>
          </button>
        </form>
      </div>
    </div>
  );
};
