import React, { useState, useEffect } from 'react';
import { 
  WorldInfoState, MetaElements, Character, 
  GenreCategory, ToneAndManner, GenrePreset 
} from '../types';
import { 
  TONE_AND_MANNER_CATALOG, 
  getRandom10Presets 
} from '../data/genreAndToneData';
import { getWorldTailoredMetaPool } from '../data/metaPresetsData';
import { getRandomCharacterPresetForWorld } from '../data/characterPresetsData';
import { generateAllStatsCSPRNG, calculateModifier } from '../utils/dice';
import { 
  Globe, UserCheck, Shield, Sparkles, BookOpen, 
  Dice5, ArrowRight, CheckCircle, RotateCcw, 
  Wand2
} from 'lucide-react';

interface CreationPhaseProps {
  world: WorldInfoState;
  character: Character;
  onUpdateWorld: (world: WorldInfoState) => void;
  onUpdateCharacter: (character: Character) => void;
  onComplete: () => void;
}

export const CreationPhase: React.FC<CreationPhaseProps> = ({
  world,
  character,
  onUpdateWorld,
  onUpdateCharacter,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Phase 1 Category & Presets State
  const [genreCategory, setGenreCategory] = useState<GenreCategory>('all');
  const [displayedPresets, setDisplayedPresets] = useState<GenrePreset[]>([]);
  const [selectedGenrePresetId, setSelectedGenrePresetId] = useState<string>('');

  // Phase 1 Custom & Original IP Inputs
  const [originalIpInput, setOriginalIpInput] = useState('');
  const [customTitleInput, setCustomTitleInput] = useState('');
  const [customGenreInput, setCustomGenreInput] = useState('');
  const [customPremiseInput, setCustomPremiseInput] = useState('');

  // Phase 1 Tone and Manner State
  const [selectedTone, setSelectedTone] = useState<ToneAndManner>(() => {
    if (world.worldMode === 'original_ip') {
      return TONE_AND_MANNER_CATALOG.find(t => t.id === 'original_ip_faithful') || TONE_AND_MANNER_CATALOG[0];
    }
    return world.toneAndManner || TONE_AND_MANNER_CATALOG[0];
  });
  const [showTonePicker, setShowTonePicker] = useState(false);

  // Phase 2 Meta Elements State
  const [metaPool, setMetaPool] = useState(() => getWorldTailoredMetaPool(world));
  const [metaInputs, setMetaInputs] = useState<MetaElements>(character.metaElements);

  // Sync meta pool when world settings change
  useEffect(() => {
    const tailoredPool = getWorldTailoredMetaPool(world);
    setMetaPool(tailoredPool);
  }, [world.worldName, world.worldGenre, world.worldPremise, world.worldMode]);

  // Phase 3 Character State & Stat Mode
  const [statInputMode, setStatInputMode] = useState<'dice' | 'manual'>('dice');
  const [charName, setCharName] = useState(character.name || '무명 협객');
  const [charTitle, setCharTitle] = useState(character.title || '초출강호');
  const [charAge, setCharAge] = useState<number | string>(character.age || 20);
  const [charGender, setCharGender] = useState(character.gender || '남성');
  const [charAppearance, setCharAppearance] = useState(character.appearance || '검은 포말을 두르고 날카로운 눈빛을 지닌 청년');
  const [charBiography, setCharBiography] = useState(character.biography || '');
  const [charGoal, setCharGoal] = useState(character.currentGoal || '세상에 얽힌 진실을 밝혀내고 살아남는 것');
  const [stats, setStats] = useState(character.stats);

  // Initialize 10 Presets on Category Change or Mount
  useEffect(() => {
    refreshGenrePresets(genreCategory);
  }, [genreCategory]);

  const refreshGenrePresets = (category: GenreCategory) => {
    const presets = getRandom10Presets(category);
    setDisplayedPresets(presets);
    if (presets.length > 0) {
      setSelectedGenrePresetId(presets[0].id);
      applyGenrePresetToWorld(presets[0]);
    }
  };

  const applyGenrePresetToWorld = (preset: GenrePreset) => {
    const matchedTone = TONE_AND_MANNER_CATALOG.find(t => t.id === preset.recommendedToneId) || TONE_AND_MANNER_CATALOG[0];
    setSelectedTone(matchedTone);
    onUpdateWorld({
      ...world,
      worldMode: 'popular_genre',
      worldName: preset.name,
      worldGenre: preset.period,
      worldPremise: preset.premise,
      toneAndManner: matchedTone,
    });
  };

  const handleSelectGenrePreset = (preset: GenrePreset) => {
    setSelectedGenrePresetId(preset.id);
    applyGenrePresetToWorld(preset);
  };

  // Instant CSPRNG World-Tailored Character Random Generator (0.001s, No AI Token Waste)
  const handleRandomizeCharacter = () => {
    const preset = getRandomCharacterPresetForWorld(world);
    const newStats = generateAllStatsCSPRNG();

    setCharName(preset.name);
    setCharTitle(preset.title);
    setCharAge(preset.age);
    setCharGender(preset.gender);
    setCharAppearance(preset.appearance);
    setCharGoal(preset.goal);
    setStats(newStats);

    onUpdateCharacter({
      ...character,
      name: preset.name,
      title: preset.title,
      age: preset.age,
      gender: preset.gender,
      appearance: preset.appearance,
      currentGoal: preset.goal,
      stats: newStats,
      metaElements: metaInputs,
    });
  };

  // Switch to Phase 2
  const handleProceedToPhase2 = () => {
    if (world.worldMode === 'original_ip') {
      const ip = originalIpInput.trim() || '원작 세계관';
      onUpdateWorld({
        ...world,
        worldName: ip,
        worldGenre: '원작 정사 고증',
        worldPremise: `${ip} 원작의 정사 타임라인 및 세력 관계를 바탕으로 전개되는 서사입니다.`,
        toneAndManner: selectedTone,
      });
    } else if (world.worldMode === 'custom') {
      onUpdateWorld({
        ...world,
        worldName: customTitleInput.trim() || '오리지널 세계관',
        worldGenre: customGenreInput.trim() || '자유 장르',
        worldPremise: customPremiseInput.trim() || '플레이어가 직접 설계한 독창적인 세계관입니다.',
        toneAndManner: selectedTone,
      });
    }
    setStep(2);
  };

  // Meta 5 All-in-one Smart Recommendation
  const applyAllInOneSmartMetaSet = () => {
    const pool = getWorldTailoredMetaPool(world);
    const pick = (arr: string[] = []) => (arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : '');

    const updated: MetaElements = {
      background: { type: 'preset', value: pick(pool.background), label: '배경 설정' },
      flaw: { type: 'preset', value: pick(pool.flaw), label: '인간적 결핍' },
      oath: { type: 'preset', value: pick(pool.oath), label: '신념 및 맹세' },
      anchor: { type: 'preset', value: pick(pool.anchor), label: '소중한 것/버팀목' },
      faction: { type: 'preset', value: pick(pool.faction), label: '소속 세력' },
    };

    setMetaInputs(updated);
    onUpdateCharacter({ ...character, metaElements: updated });
  };

  const handleMetaItemChange = (key: keyof MetaElements, item: any) => {
    const next = { ...metaInputs, [key]: item };
    setMetaInputs(next);
    onUpdateCharacter({ ...character, metaElements: next });
  };

  const rerollSingleMetaItem = (fieldKey: keyof MetaElements) => {
    const pool = metaPool[fieldKey] || [];
    if (pool.length === 0) return;
    const currentVal = metaInputs[fieldKey]?.value;
    const filtered = pool.filter(p => p !== currentVal);
    const poolToPick = filtered.length > 0 ? filtered : pool;
    const nextVal = poolToPick[Math.floor(Math.random() * poolToPick.length)];

    handleMetaItemChange(fieldKey, {
      type: 'preset',
      value: nextVal,
      label: metaInputs[fieldKey]?.label || fieldKey,
    });
  };

  // Phase 3: Reroll CSPRNG Stats
  const handleRerollStats = () => {
    const newStats = generateAllStatsCSPRNG();
    setStats(newStats);
    onUpdateCharacter({
      ...character,
      stats: newStats,
    });
  };

  const handleManualStatChange = (key: keyof typeof stats, value: number) => {
    const clamped = Math.max(3, Math.min(18, value || 3));
    const nextStats = { ...stats, [key]: clamped };
    setStats(nextStats);
    onUpdateCharacter({
      ...character,
      stats: nextStats,
    });
  };

  const handleFinalSubmit = () => {
    const updatedChar: Character = {
      ...character,
      name: charName.trim() || '무명 협객',
      title: charTitle.trim() || '초출강호',
      age: charAge,
      gender: charGender,
      appearance: charAppearance.trim(),
      biography: charBiography.trim() || `${charName}의 전설이 시작되는 순간입니다.`,
      currentGoal: charGoal.trim() || '세상에 얽힌 진실을 밝혀내고 살아남는 것',
      stats,
      metaElements: metaInputs,
    };

    onUpdateCharacter(updatedChar);
    onComplete();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-20 px-1 sm:px-0">
      {/* Mobile-Optimized Slim Stepper */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-2.5 shadow-lg backdrop-blur-sm">
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
              step === 1
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'bg-stone-800/60 text-stone-300 hover:bg-stone-750'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>1. 세계관</span>
          </button>

          <button
            type="button"
            onClick={() => step >= 2 && setStep(2)}
            disabled={step < 2}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
              step === 2
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : step > 2
                ? 'bg-stone-800/60 text-stone-300 hover:bg-stone-750'
                : 'bg-stone-900/40 text-stone-600 cursor-not-allowed opacity-50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>2. 메타 설정</span>
          </button>

          <button
            type="button"
            onClick={() => step >= 3 && setStep(3)}
            disabled={step < 3}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
              step === 3
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'bg-stone-900/40 text-stone-600 cursor-not-allowed opacity-50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>3. 캐릭터</span>
          </button>
        </div>
      </div>

      {/* STEP 1: WORLD & TONE */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            {/* World Mode Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'popular_genre', label: '인기 장르 프리셋', icon: Sparkles },
                { id: 'original_ip', label: '원작 IP (고증)', icon: BookOpen },
                { id: 'custom', label: '오리지널 창작', icon: Wand2 },
              ].map((mode) => {
                const isSelected = world.worldMode === mode.id;
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      onUpdateWorld({ ...world, worldMode: mode.id as any });
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold shadow'
                        : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1 text-amber-400" />
                    <span className="text-xs">{mode.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Popular Genre Presets View */}
            {world.worldMode === 'popular_genre' && (
              <div className="space-y-3">
                {/* Horizontal Scrollable Category Filter Chips */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
                  <div className="flex items-center gap-1.5 shrink-0">
                    {[
                      { id: 'all', label: '전체' },
                      { id: 'classic_fantasy', label: '⚔️ 무협/판타지' },
                      { id: 'janime_jrpg', label: '🎌 J애니/JRPG' },
                      { id: 'scifi_cyber', label: '🚀 SF/사이버' },
                      { id: 'mystery_horror', label: '🕯️ 다크/호러' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setGenreCategory(cat.id as GenreCategory);
                          refreshGenrePresets(cat.id as GenreCategory);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                          genreCategory === cat.id
                            ? 'bg-amber-500 text-stone-950 shadow'
                            : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => refreshGenrePresets(genreCategory)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-semibold transition-all border border-stone-700 shrink-0"
                    title="10종 프리셋 새로고침"
                  >
                    <Dice5 className="w-3.5 h-3.5" />
                    <span>리롤</span>
                  </button>
                </div>

                {/* Compact Preset Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {displayedPresets.map((preset) => {
                    const isSelected = selectedGenrePresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectGenrePreset(preset)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500/50'
                            : 'border-stone-800 bg-stone-950/50 hover:border-stone-700 hover:bg-stone-900/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-stone-100 truncate">{preset.name}</h4>
                          {isSelected && <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-amber-400 font-mono mt-0.5">{preset.period}</p>
                        <p className="text-xs text-stone-300 mt-1.5 line-clamp-2 leading-relaxed">
                          {preset.premise}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Original IP Input */}
            {world.worldMode === 'original_ip' && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  원작 작품명 입력 (소설, 만화, 영화, 게임 등)
                </label>
                <input
                  type="text"
                  value={originalIpInput}
                  onChange={(e) => setOriginalIpInput(e.target.value)}
                  placeholder="예: 귀멸의 칼날, 반지의 제왕, 듄, 사조영웅전, 전생슬..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* Custom World Input */}
            {world.worldMode === 'custom' && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-300">세계관 이름</label>
                    <input
                      type="text"
                      value={customTitleInput}
                      onChange={(e) => setCustomTitleInput(e.target.value)}
                      placeholder="예: 영구동토의 증기제국"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-300">장르 / 시대</label>
                    <input
                      type="text"
                      value={customGenreInput}
                      onChange={(e) => setCustomGenreInput(e.target.value)}
                      placeholder="예: 스팀펑크, 빙하기 아포칼립스"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-300">세계관 설정 및 대립 구도</label>
                  <textarea
                    rows={3}
                    value={customPremiseInput}
                    onChange={(e) => setCustomPremiseInput(e.target.value)}
                    placeholder="세계관의 핵심 분위기, 주요 세력 간 갈등 등을 자유롭게 서술하세요."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-sm text-stone-100 focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Tone and Manner Selection Bar */}
            <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-400 block">선택된 서사 문체 (Tone & Style)</span>
                <span className="text-xs font-bold text-amber-300">{selectedTone.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTonePicker(!showTonePicker)}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700"
              >
                문체 변경
              </button>
            </div>

            {showTonePicker && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-800/60 max-h-[220px] overflow-y-auto">
                {TONE_AND_MANNER_CATALOG.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTone(t);
                      onUpdateWorld({ ...world, toneAndManner: t });
                      setShowTonePicker(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      selectedTone.id === t.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                        : 'border-stone-800 bg-stone-950/40 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="font-bold">{t.name}</div>
                    <div className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{t.description}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Proceed to Phase 2 Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleProceedToPhase2}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
              >
                <span>세계관 확정 및 메타 설정 이동</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: 5 META ELEMENTS */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
              <div>
                <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  2단계: 5대 메타 요소 설정
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  세계관: <strong className="text-stone-200">{world.worldName}</strong> | 톤: <span className="text-amber-400">{world.toneAndManner?.name}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={applyAllInOneSmartMetaSet}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
              >
                <Dice5 className="w-3.5 h-3.5" />
                <span>🎲 5대 메타 일괄 랜덤 추천</span>
              </button>
            </div>

            {/* 5 Meta Cards */}
            <div className="space-y-3">
              {[
                { key: 'background', title: '1. 배경 설정 (Background)', desc: '출신, 성장 환경 및 초기 위치' },
                { key: 'flaw', title: '2. 인간적 결핍과 약점 (Flaw)', desc: '서사 중 극복 가능한 육체/정신적 약점' },
                { key: 'oath', title: '3. 신념 및 맹세 (Oath)', desc: '절대 꺾이지 않는 주인공의 행동 원칙' },
                { key: 'anchor', title: '4. 소중한 버팀목 (Anchor)', desc: '인연, 유품 또는 궁극의 귀환 장소' },
                { key: 'faction', title: '5. 소속 세력 (Faction)', desc: '초기 귀속 조직 또는 문파' },
              ].map(({ key, title, desc }) => {
                const fieldKey = key as keyof MetaElements;
                const currentItem = metaInputs[fieldKey] || { type: 'preset', value: '', label: title };
                const pool = (metaPool[fieldKey] && metaPool[fieldKey].length > 0) 
                  ? metaPool[fieldKey] 
                  : (getWorldTailoredMetaPool(world)[fieldKey] || []);

                return (
                  <div key={key} className="p-3.5 bg-stone-950/70 border border-stone-800 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-stone-200">{title}</h3>
                        <p className="text-[11px] text-stone-400">{desc}</p>
                      </div>

                      {/* 3 Choices Pill */}
                      <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg p-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const nextVal = currentItem.value && currentItem.type === 'preset' ? currentItem.value : pool[0];
                            handleMetaItemChange(fieldKey, { type: 'preset', value: nextVal, label: title });
                          }}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            currentItem.type === 'preset' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                          }`}
                        >
                          프리셋
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMetaItemChange(fieldKey, { type: 'custom', value: currentItem.value || '', label: title })}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            currentItem.type === 'custom' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                          }`}
                        >
                          직접서술
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMetaItemChange(fieldKey, { type: 'tabula_rasa', value: '미상 / 백지 상태 (Tabula Rasa)', isTabulaRasa: true, label: title })}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            currentItem.type === 'tabula_rasa' ? 'bg-purple-600 text-white' : 'text-stone-400'
                          }`}
                        >
                          백지
                        </button>
                      </div>
                    </div>

                    {/* Preset Selection UI */}
                    {currentItem.type === 'preset' && (
                      <div className="flex items-center justify-between gap-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <span className="text-xs text-stone-100 truncate">{currentItem.value || pool[0]}</span>
                        <button
                          type="button"
                          onClick={() => rerollSingleMetaItem(fieldKey)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-semibold shrink-0"
                          title="다른 프리셋 무작위 추천"
                        >
                          <Dice5 className="w-3 h-3" />
                          <span>랜덤</span>
                        </button>
                      </div>
                    )}

                    {/* Custom Input UI */}
                    {currentItem.type === 'custom' && (
                      <input
                        type="text"
                        value={currentItem.value}
                        onChange={(e) => handleMetaItemChange(fieldKey, { type: 'custom', value: e.target.value, label: title })}
                        placeholder="자유롭게 작성하세요 (AI가 최우선 복선으로 활용합니다)"
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    )}

                    {/* Tabula Rasa UI */}
                    {currentItem.type === 'tabula_rasa' && (
                      <div className="p-2 bg-purple-950/30 border border-purple-800/40 rounded-lg text-xs text-purple-300">
                        🌱 기억상실 또는 무소속 백지 상태로 시작하여 서사 속에서 실마리가 밝혀집니다.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold hover:bg-stone-700"
              >
                이전: 세계관
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 shadow-md"
              >
                <span>캐릭터 시트 설정 이동</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CHARACTER SHEET */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  3단계: 캐릭터 정보 및 스탯
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  세계관 맞춤 기본 정보와 CSPRNG 공정 주사위 스탯을 설정합니다.
                </p>
              </div>

              {/* Instant 0.001s Random Button */}
              <button
                type="button"
                onClick={handleRandomizeCharacter}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow"
                title="세계관에 어울리는 캐릭터 정보와 스탯 즉시 무작위 생성"
              >
                <Dice5 className="w-3.5 h-3.5 text-amber-400" />
                <span>🎲 캐릭터 전체 랜덤 세팅</span>
              </button>
            </div>

            {/* Profile Inputs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-300">이름</label>
                <input
                  type="text"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-300">칭호 / 직함</label>
                <input
                  type="text"
                  value={charTitle}
                  onChange={(e) => setCharTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-300">나이</label>
                <input
                  type="number"
                  value={charAge}
                  onChange={(e) => setCharAge(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-300">성별</label>
                <select
                  value={charGender}
                  onChange={(e) => setCharGender(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            {/* Appearance & Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-300">외형 묘사</label>
                <input
                  type="text"
                  value={charAppearance}
                  onChange={(e) => setCharAppearance(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-300">초기 목표</label>
                <input
                  type="text"
                  value={charGoal}
                  onChange={(e) => setCharGoal(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Stats Board */}
            <div className="p-3.5 bg-stone-950/80 border border-stone-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                    <Dice5 className="w-3.5 h-3.5 text-amber-400" />
                    6대 기본 능력치 (Stats)
                  </h3>
                  <span className="text-[10px] text-stone-400">CSPRNG 4d6 공정 난수 굴림 방식 (3~18)</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-stone-900 border border-stone-700 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setStatInputMode('dice')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        statInputMode === 'dice' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                      }`}
                    >
                      🎲 주사위
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatInputMode('manual')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        statInputMode === 'manual' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                      }`}
                    >
                      ✏️ 직접입력
                    </button>
                  </div>

                  {statInputMode === 'dice' && (
                    <button
                      type="button"
                      onClick={handleRerollStats}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-semibold border border-stone-700"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>리롤</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 6 Stats Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { key: 'strength', label: '근력/공력', val: stats.strength },
                  { key: 'agility', label: '민첩/신법', val: stats.agility },
                  { key: 'vitality', label: '체력/기골', val: stats.vitality },
                  { key: 'intellect', label: '지략/학식', val: stats.intellect },
                  { key: 'insight', label: '통찰/안목', val: stats.insight },
                  { key: 'willpower', label: '정신/의지', val: stats.willpower },
                ].map(({ key, label, val }) => {
                  const statKey = key as keyof typeof stats;
                  const mod = calculateModifier(val);
                  return (
                    <div key={key} className="p-2 bg-stone-900 border border-stone-800 rounded-lg text-center">
                      <span className="text-[10px] text-stone-400 block truncate">{label}</span>
                      {statInputMode === 'dice' ? (
                        <div className="text-base font-bold text-stone-100 font-mono my-0.5">{val}</div>
                      ) : (
                        <input
                          type="number"
                          min={3}
                          max={18}
                          value={val}
                          onChange={(e) => handleManualStatChange(statKey, Number(e.target.value))}
                          className="w-full text-center bg-stone-950 border border-stone-700 rounded py-0.5 text-xs font-bold text-amber-400 font-mono my-0.5"
                        />
                      )}
                      <span className="text-[10px] font-bold text-amber-400 block">
                        {mod >= 0 ? `+${mod}` : mod}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Game Start Button */}
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold hover:bg-stone-700"
              >
                이전: 메타
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-sm shadow-xl shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500"
              >
                <Sparkles className="w-4 h-4" />
                <span>TRPG 서사 모험 시작</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
