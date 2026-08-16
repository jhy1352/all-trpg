import React, { useState } from 'react';
import { rollD20WithModifier } from '../utils/dice';
import { DiceRollResult, Character } from '../types';
import { soundEngine } from '../utils/audio';
import { X, Dices, Award, AlertOctagon, Sparkles, Send } from 'lucide-react';
import { KO } from '../locales/ko';

interface DiceRollerModalProps {
  isOpen: boolean;
  onClose: () => void;
  character?: Character;
  onSendRollResult?: (result: DiceRollResult) => void;
}

export const DiceRollerModal: React.FC<DiceRollerModalProps> = ({ isOpen, onClose, character, onSendRollResult }) => {
  const [modifier, setModifier] = useState(0);
  const [targetDC, setTargetDC] = useState(10);
  const [statName, setStatName] = useState('능력 판정');
  const [lastResult, setLastResult] = useState<DiceRollResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  if (!isOpen) return null;

  const handleRoll = () => {
    setIsRolling(true);
    soundEngine.playDiceRoll();
    setTimeout(() => {
      const res = rollD20WithModifier(modifier, targetDC, statName);
      setLastResult(res);
      setIsRolling(false);
      if (res.outcome === 'miraculous_success' || res.outcome.includes('success')) {
        soundEngine.playSuccessSound();
      } else {
        soundEngine.playFailureSound();
      }
    }, 450);
  };

  const handleSendToChat = () => {
    if (lastResult && onSendRollResult) {
      onSendRollResult(lastResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-stone-900 border border-stone-700/80 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl text-stone-100 relative">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <Dices className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-amber-400">{KO.dice.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-400 font-semibold mb-1">판정 항목 명칭</label>
            <input
              type="text"
              value={statName}
              onChange={(e) => setStatName(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-400 font-semibold mb-1">{KO.dice.modifier}</label>
              <input
                type="number"
                value={modifier}
                onChange={(e) => setModifier(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-100 font-mono text-center focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-stone-400 font-semibold mb-1">{KO.dice.targetDC}</label>
              <input
                type="number"
                min={1}
                max={30}
                value={targetDC}
                onChange={(e) => setTargetDC(parseInt(e.target.value, 10) || 10)}
                className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-100 font-mono text-center focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            onClick={handleRoll}
            disabled={isRolling}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
            <span>{isRolling ? '주사위 굴리는 중...' : KO.dice.rollD20}</span>
          </button>

          {lastResult && (
            <div className="mt-4 p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2.5 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">순수 눈금:</span>
                <strong className="text-stone-100 font-mono text-base">{lastResult.rawRoll}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">보정치 적용 총합:</span>
                <strong className="text-amber-400 font-mono text-lg">{lastResult.total}</strong>
              </div>
              <div className="pt-2 border-t border-stone-800">
                <span className="text-stone-400 block mb-1">판정 결과:</span>
                <span
                  className={`font-semibold ${
                    lastResult.outcome.includes('success') ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {lastResult.description}
                </span>
              </div>

              {onSendRollResult && (
                <button
                  onClick={handleSendToChat}
                  className="w-full mt-2 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>채팅창에 결과 전송하기</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
