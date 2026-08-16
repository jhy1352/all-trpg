import React, { useState } from 'react';
import { WorldInfoState, NPC, Faction, NarrativeSeed } from '../types';
import { 
  X, Users, Shield, Compass, BookOpen, 
  Search, Eye, EyeOff, CheckCircle2, Heart,
  Flame, Skull, Award, HelpCircle
} from 'lucide-react';

interface WorldInfoModalProps {
  isOpen: boolean;
  world: WorldInfoState;
  onClose: () => void;
}

export const WorldInfoModal: React.FC<WorldInfoModalProps> = ({ isOpen, world, onClose }) => {
  const [activeTab, setActiveTab] = useState<'npcs' | 'factions' | 'seeds' | 'lore'>('npcs');
  const [searchQuery, setSearchQuery] = useState('');
  const [npcFilter, setNpcFilter] = useState<'all' | 'original' | 'canon'>('all');

  if (!isOpen) return null;

  const filteredNPCs = (world?.npcs || []).filter((npc) => {
    const matchesSearch =
      npc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      npc.affiliation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      npc.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (npcFilter === 'original') return matchesSearch && npc.isOriginalChar;
    if (npcFilter === 'canon') return matchesSearch && !npc.isOriginalChar;
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-stone-900 border border-stone-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl text-stone-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div>
            <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              세계관 정보 및 실시간 인물록
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">{world.worldName} ({world.worldGenre})</p>
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
            onClick={() => setActiveTab('npcs')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'npcs'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>등장인물 ({world.npcs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('factions')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'factions'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>세력 구도 ({world.factions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('seeds')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'seeds'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>복선 씨앗 ({world.seeds.filter((s) => s.status === 'active').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('lore')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'lore'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>세계관 개요 및 챕터</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: NPCS */}
          {activeTab === 'npcs' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-950/40 p-3 rounded-xl border border-stone-800">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="인물명 또는 소속 검색..."
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs self-end sm:self-auto">
                  <button
                    onClick={() => setNpcFilter('all')}
                    className={`px-2.5 py-1 rounded-md ${npcFilter === 'all' ? 'bg-amber-600 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'}`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => setNpcFilter('canon')}
                    className={`px-2.5 py-1 rounded-md ${npcFilter === 'canon' ? 'bg-amber-600 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'}`}
                  >
                    원작 인물
                  </button>
                  <button
                    onClick={() => setNpcFilter('original')}
                    className={`px-2.5 py-1 rounded-md ${npcFilter === 'original' ? 'bg-amber-600 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'}`}
                  >
                    오리지널(OC)
                  </button>
                </div>
              </div>

              {/* NPC Cards Grid */}
              {filteredNPCs.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs bg-stone-950/30 rounded-xl border border-stone-800/60 p-6">
                  <Users className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <span>아직 등록된 등장인물이 없습니다. 서사가 전개되면서 만나는 인물들이 실시간으로 자동 기록됩니다.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredNPCs.map((npc) => (
                    <div
                      key={npc.id}
                      className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="font-bold text-sm text-stone-100">{npc.name}</strong>
                            <span className="text-[11px] text-amber-400">{npc.title}</span>
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5">{npc.affiliation}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700 font-mono">
                            {npc.npcClass}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            npc.isOriginalChar ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/60' : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                          }`}>
                            {npc.isOriginalChar ? 'OC' : '원작'}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-stone-300">
                        <span className="text-stone-400 block mb-0.5">가치관 및 성격:</span>
                        <span>{npc.personality}</span>
                      </div>

                      <div className="text-xs p-2.5 rounded-lg bg-stone-900/80 border border-stone-800/80">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-amber-400 font-semibold block">주인공에 대한 실제 심경:</span>
                          <span className="text-[10px] text-stone-400">
                            {npc.metInStory ? '직접 대면 완료' : '조우 전 (스포일러 방지)'}
                          </span>
                        </div>
                        <span className={!npc.metInStory || npc.impressionOnPlayer.includes('미인지') ? 'text-stone-400 italic' : 'text-emerald-300 font-medium'}>
                          {!npc.metInStory ? '[미인지 상태 - 서사 내 직접 조우 전]' : npc.impressionOnPlayer}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FACTIONS */}
          {activeTab === 'factions' && (
            <div className="space-y-3">
              {world.factions.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs bg-stone-950/30 rounded-xl border border-stone-800/60 p-6">
                  <Shield className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <span>아직 등록된 세력 정보가 없습니다. 서사 진행에 따라 세력 관계도가 자동 갱신됩니다.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {world.factions.map((f, idx) => (
                    <div key={idx} className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                        <strong className="font-bold text-sm text-stone-100">{f.name}</strong>
                        <span className="text-[11px] text-amber-400">{f.alignment}</span>
                      </div>
                      <div className="text-xs text-stone-300">
                        <span className="text-stone-400">세력 영향력: </span>
                        <span>{f.influence}</span>
                      </div>
                      <div className="text-xs text-stone-300">
                        <span className="text-stone-400">주인공에 대한 태도: </span>
                        <span className="text-stone-100">{f.attitudeToPlayer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SEEDS */}
          {activeTab === 'seeds' && (
            <div className="space-y-3">
              {world.seeds.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs bg-stone-950/30 rounded-xl border border-stone-800/60 p-6">
                  <Compass className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <span>현재 활성화된 복선 씨앗이 없습니다. AI GM이 서사 중 던진 복선이 이곳에 최대 3개까지 실시간 추적됩니다.</span>
                </div>
              ) : (
                world.seeds.map((s) => (
                  <div
                    key={s.id}
                    className={`p-4 rounded-xl border transition-all ${
                      s.status === 'resolved'
                        ? 'bg-stone-950/40 border-stone-800/60 text-stone-400 line-through'
                        : 'bg-stone-950/70 border-amber-500/40 text-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-300">
                        {s.status === 'resolved' ? '✅ 회수 완료된 복선' : '🌱 활성 미회수 복선'}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">{s.text}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: LORE & CHAPTERS */}
          {activeTab === 'lore' && (
            <div className="space-y-4 text-xs">
              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                <span className="font-bold text-amber-300 block mb-1">📜 세계관 기본 설정</span>
                <p className="text-stone-300 whitespace-pre-wrap leading-relaxed">{world.worldPremise}</p>
              </div>

              <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2">
                <span className="font-bold text-amber-300 block mb-1">🗺️ 현재 챕터 및 위치</span>
                <div className="text-stone-300">
                  <strong>현재: </strong> {world.currentChapter.currentChapter} ({world.currentChapter.location})
                </div>
                <div className="text-stone-400 mt-2">
                  <span className="block mb-1">향후 예정 챕터:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {world.currentChapter.upcomingChapters.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
