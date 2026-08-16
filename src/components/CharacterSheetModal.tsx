import React, { useState } from 'react';
import { Character } from '../types';
import { calculateModifier } from '../utils/dice';
import { KO } from '../locales/ko';
import { 
  X, User, Shield, Sparkles, BookOpen, 
  Package, Award, Heart, Compass, Target,
  AlertTriangle, CheckCircle
} from 'lucide-react';

interface CharacterSheetModalProps {
  isOpen: boolean;
  character: Character;
  onClose: () => void;
  onUpdateCharacter?: (character: Character) => void;
}

export const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({ isOpen, character, onClose, onUpdateCharacter }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'meta' | 'inventory'>('stats');

  if (!isOpen || !character) return null;

  const statItems = [
    { key: 'strength', label: character.statNames?.strength || KO.stats.strength, val: character.stats.strength },
    { key: 'agility', label: character.statNames?.agility || KO.stats.agility, val: character.stats.agility },
    { key: 'vitality', label: character.statNames?.vitality || KO.stats.vitality, val: character.stats.vitality },
    { key: 'intellect', label: character.statNames?.intellect || KO.stats.intellect, val: character.stats.intellect },
    { key: 'insight', label: character.statNames?.insight || KO.stats.insight, val: character.stats.insight },
    { key: 'willpower', label: character.statNames?.willpower || KO.stats.willpower, val: character.stats.willpower },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-stone-900 border border-stone-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl text-stone-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-100">{character.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/50">
                  {character.title}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {character.gender} • {character.age}세 • {character.appearance}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/40 px-4 gap-2">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'stats'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>6대 능력치 및 평판</span>
          </button>
          <button
            onClick={() => setActiveTab('meta')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'meta'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>5대 메타요소 & 신체/결핍 상태</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'inventory'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>소장품 및 소지품 ({character.inventory.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {statItems.map(({ key, label, val }) => {
                  const mod = calculateModifier(val);
                  return (
                    <div key={key} className="bg-stone-950/60 border border-stone-800 rounded-xl p-3.5 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-stone-400 block mb-0.5">{label}</span>
                        <span className="text-xs font-bold text-amber-400">
                          보정치 {mod >= 0 ? `+${mod}` : mod}
                        </span>
                      </div>
                      <span className="text-xl font-bold text-stone-100 font-mono">{val}</span>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Reputation Card */}
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs text-stone-200">세간의 평판 및 성향</span>
                  </div>
                  <span className="text-xs text-amber-300 font-semibold">{character.reputation.title}</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  플레이어의 선택과 서사적 대가에 따라 AI GM이 평판과 성향을 실시간으로 갱신하며, 조우하는 NPC의 첫인상과 태도에 자연스럽게 반영됩니다.
                </p>
              </div>
            </div>
          )}

          {/* META TAB */}
          {activeTab === 'meta' && (
            <div className="space-y-3">
              {/* Current Goal */}
              <div className="bg-stone-950/60 border border-amber-500/40 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Target className="w-4 h-4" />
                  <span>현재 추구하는 최종 목표</span>
                </div>
                <p className="text-xs text-stone-100 font-medium leading-relaxed">{character.currentGoal}</p>
              </div>

              {/* Disabilities & Overcome Flaws Badges */}
              {(character.disabilities?.length || character.overcameFlaws?.length) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {character.disabilities && character.disabilities.length > 0 && (
                    <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>신체 결핍 및 기능 손실</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {character.disabilities.map((d, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 text-[11px] border border-rose-700/50">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {character.overcameFlaws && character.overcameFlaws.length > 0 && (
                    <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>서사적으로 극복 완료된 결핍</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {character.overcameFlaws.map((f, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 text-[11px] border border-emerald-700/50">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* 5 Meta Elements */}
              <div className="space-y-2.5">
                {[
                  { label: '1. 출신 및 배경', val: character.metaElements.background.value },
                  { label: '2. 약점 및 결핍', val: character.metaElements.flaw.value },
                  { label: '3. 신념 및 맹세', val: character.metaElements.oath.value },
                  { label: '4. 소중한 것 / 소중한 인연', val: character.metaElements.anchor.value },
                  { label: '5. 소속 세력', val: character.metaElements.faction.value },
                ].map((item, idx) => (
                  <div key={idx} className="bg-stone-950/40 border border-stone-800 rounded-xl p-3 text-xs">
                    <span className="text-stone-400 block mb-0.5 font-semibold">{item.label}</span>
                    <span className="text-stone-200 leading-relaxed">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {character.inventory.map((item, idx) => (
                  <div key={idx} className="bg-stone-950/60 border border-stone-800 rounded-xl p-3 flex items-center gap-2.5 text-xs text-stone-200">
                    <Package className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
