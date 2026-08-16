import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { exportSessionToPackageJson, importSessionFromPackageJson } from '../utils/snapshot';
import { KO } from '../locales/ko';
import { 
  X, Cloud, Download, Upload, Copy, 
  Check, RefreshCw, AlertTriangle, Key, RotateCcw
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  gameState: GameState;
  onRestoreState: (state: GameState) => void;
  onResetToNewGame: () => void;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  gameState,
  onRestoreState,
  onResetToNewGame,
  onClose,
}) => {
  const [syncCode, setSyncCode] = useState(gameState?.lastAutoSaveCode || '');
  const [inputCode, setInputCode] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // New Game Reset Confirm Dialog
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (gameState?.lastAutoSaveCode) {
      setSyncCode(gameState.lastAutoSaveCode);
    }
  }, [gameState?.lastAutoSaveCode]);

  if (!isOpen) return null;

  // Save to Cloud via API
  const handleSaveToCloud = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/cloud-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameState, syncCode: syncCode || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.syncCode) {
        setSyncCode(data.syncCode);
        setStatusMessage({ text: `클라우드 세이브 완료! 6자리 코드: ${data.syncCode}` });
      } else {
        setStatusMessage({ text: data.error || '클라우드 저장 실패', isError: true });
      }
    } catch {
      setStatusMessage({ text: '네트워크 통신 오류가 발생했습니다.', isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  // Load from Cloud via 6-digit Code
  const handleLoadFromCloud = async () => {
    if (!inputCode.trim()) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/cloud-load/${inputCode.trim().toUpperCase()}`);
      const data = await res.json();
      if (res.ok && data.gameState) {
        onRestoreState(data.gameState);
        setStatusMessage({ text: '세션을 성공적으로 복원했습니다!' });
        setTimeout(() => onClose(), 1200);
      } else {
        setStatusMessage({ text: data.error || '세션을 찾을 수 없습니다.', isError: true });
      }
    } catch {
      setStatusMessage({ text: '복원 중 오류가 발생했습니다.', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Export JSON
  const handleCopyJson = () => {
    if (!gameState) return;
    const json = exportSessionToPackageJson(gameState, syncCode || 'DIRECT_EXPORT');
    navigator.clipboard.writeText(json);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Import JSON
  const handleImportJson = () => {
    if (!jsonText.trim()) return;
    const restored = importSessionFromPackageJson(jsonText.trim());
    if (restored) {
      onRestoreState(restored);
      setStatusMessage({ text: 'JSON 패키지로 세션을 복원했습니다!' });
      setTimeout(() => onClose(), 1200);
    } else {
      setStatusMessage({ text: '올바르지 않은 세이브 패키지 형식입니다.', isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-stone-900 border border-stone-700/80 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl text-stone-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div>
            <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-amber-500" />
              {KO.sync.title}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">{KO.sync.desc}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 ${
                statusMessage.isError
                  ? 'bg-rose-950/50 border-rose-700/60 text-rose-300'
                  : 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* 6-Digit Sync Section */}
          <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-3">
            <span className="font-bold text-amber-300 block">⚡ 6자리 동기화 코드로 클라우드 저장 및 로드</span>
            
            {/* Save Button & Generated Code */}
            <div className="flex items-center justify-between gap-3 bg-stone-900/80 p-3 rounded-lg border border-stone-800">
              <div>
                <span className="text-[11px] text-stone-400 block">{KO.sync.yourCode}</span>
                <strong className="text-sm font-mono text-amber-400">{syncCode || '아직 세이브 없음'}</strong>
              </div>
              <button
                onClick={handleSaveToCloud}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg transition-all disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>{KO.sync.saveBtn}</span>
              </button>
            </div>

            {/* Load by Code */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder={KO.sync.loadCodePlaceholder}
                className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 font-mono text-center uppercase tracking-widest focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleLoadFromCloud}
                disabled={isLoading || !inputCode.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold rounded-lg transition-all disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{KO.sync.loadBtn}</span>
              </button>
            </div>
          </div>

          {/* JSON Export/Import */}
          <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200">📜 세이브 데이터 패키지 (JSON)</span>
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1 px-3 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-md text-[11px]"
              >
                {copySuccess ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copySuccess ? '복사됨' : KO.sync.exportJson}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="복사해둔 세이브 JSON 텍스트를 여기에 붙여넣으세요..."
              className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 font-mono text-[10px] text-stone-300 focus:outline-none focus:border-amber-500"
            />
            {jsonText.trim() && (
              <button
                onClick={handleImportJson}
                className="w-full py-2 bg-amber-600/90 hover:bg-amber-500 text-stone-950 font-bold rounded-lg"
              >
                {KO.sync.importJson}
              </button>
            )}
          </div>

          {/* Session Reset Button Section */}
          <div className="border-t border-stone-800 pt-4 flex items-center justify-between">
            <div className="text-[11px] text-stone-400">
              새로운 세계관과 캐릭터로 처음부터 다시 시작합니다.
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-lg font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{KO.sync.resetGame}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-stone-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>{KO.sync.resetConfirmTitle}</span>
            </div>
            <p className="text-xs text-stone-300 mb-6 leading-relaxed">
              {KO.sync.resetConfirmDesc}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-semibold"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetToNewGame();
                  onClose();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs shadow-lg"
              >
                네, 새로 시작합니다
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
