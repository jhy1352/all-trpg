import React, { useState, useEffect } from 'react';
import { 
  WorldInfoState, MetaElements, Character, MetaItem, 
  WorldVerificationResult, MetaRefinementResult, GenreCategory, ToneAndManner, GenrePreset 
} from '../types';
import { 
  TONE_AND_MANNER_CATALOG, 
  GENRE_PRESET_MASTER_POOL, 
  getRandom10Presets 
} from '../data/genreAndToneData';
import { getWorldTailoredMetaPool, GENRE_META_POOLS } from '../data/metaPresetsData';
import { META_ELEMENT_PRESET_POOLS } from '../types/presets';
import { generateAllStatsCSPRNG, calculateModifier } from '../utils/dice';
import { KO } from '../locales/ko';
import { 
  Globe, UserCheck, Shield, Sparkles, BookOpen, 
  Dice5, ArrowRight, CheckCircle, AlertTriangle, 
  RotateCcw, RefreshCw, X, Edit3, Check, HelpCircle,
  Sliders, Wand2, Compass, Flame, Feather, Eye, AlertCircle,
  Clock, Lock, Unlock
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

  // Cooldown timer state for infinite re-rolling (3 seconds cooldown)
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const triggerCooldown = () => setCooldown(3);

  // Phase 1 Tone and Manner State
  const [selectedTone, setSelectedTone] = useState<ToneAndManner>(() => {
    if (world.worldMode === 'original_ip') {
      return TONE_AND_MANNER_CATALOG.find(t => t.id === 'original_ip_faithful') || TONE_AND_MANNER_CATALOG[0];
    }
    return world.toneAndManner || TONE_AND_MANNER_CATALOG[0];
  });
  const [customToneDirective, setCustomToneDirective] = useState('');
  const [showTonePicker, setShowTonePicker] = useState(false);

  // AI Validation & Refinement Dialog States
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationModal, setValidationModal] = useState<{
    isOpen: boolean;
    type: 'original_ip_success' | 'original_ip_fail' | 'custom_confirm' | 'meta_confirm';
    data?: WorldVerificationResult | MetaRefinementResult;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({ isOpen: false, type: 'original_ip_success' });

  // Phase 2 Meta Elements State - Tailored dynamically to current world
  const [metaPool, setMetaPool] = useState(() => getWorldTailoredMetaPool(world));
  const [metaInputs, setMetaInputs] = useState<MetaElements>(character.metaElements);

  // Sync meta pool when world settings change or when entering Step 2
  useEffect(() => {
    const tailoredPool = getWorldTailoredMetaPool(world);
    setMetaPool(tailoredPool);
  }, [world.worldName, world.worldGenre, world.worldPremise, world.worldMode]);

  // Dynamic AI Generation Loading States
  const [isGeneratingPresets, setIsGeneratingPresets] = useState(false);
  const [isGeneratingMetaPool, setIsGeneratingMetaPool] = useState(false);
  const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);

  // Phase 3 Character State & Stat Mode (CSPRNG vs Direct Input)
  const [statInputMode, setStatInputMode] = useState<'dice' | 'manual'>('dice');
  const [charName, setCharName] = useState(character.name || '무명 협객');
  const [charTitle, setCharTitle] = useState(character.title || '초출강호');
  const [charAge, setCharAge] = useState<number | string>(character.age || 20);
  const [charGender, setCharGender] = useState(character.gender || '남성');
  const [charAppearance, setCharAppearance] = useState(character.appearance || '검은 포말을 두르고 날카로운 눈빛을 지닌 청년');
  const [charBiography, setCharBiography] = useState(character.biography || '');
  const [charGoal, setCharGoal] = useState(character.currentGoal || '가문의 억울한 누명을 벗고 진실을 밝히는 것');
  const [stats, setStats] = useState(character.stats);

  // Initialize 10 Presets on Category Change or Mount
  useEffect(() => {
    refreshGenrePresets(genreCategory, false);
  }, [genreCategory]);

  // When switching world mode, automatically adjust default tone
  useEffect(() => {
    if (world.worldMode === 'original_ip') {
      const originalTone = TONE_AND_MANNER_CATALOG.find(t => t.id === 'original_ip_faithful') || TONE_AND_MANNER_CATALOG[0];
      setSelectedTone(originalTone);
      onUpdateWorld({ ...world, toneAndManner: originalTone });
    } else {
      if (selectedTone.id === 'original_ip_faithful') {
        const defaultTone = TONE_AND_MANNER_CATALOG.find(t => t.id !== 'original_ip_faithful') || TONE_AND_MANNER_CATALOG[0];
        setSelectedTone(defaultTone);
        onUpdateWorld({ ...world, toneAndManner: defaultTone });
      }
    }
  }, [world.worldMode]);

  // Dynamic AI Infinite Presets Refresh
  const handleDynamicPresetRefresh = async (category: GenreCategory) => {
    if (isGeneratingPresets) return;
    setIsGeneratingPresets(true);
    try {
      const res = await fetch('/api/generate-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.presets) && data.presets.length > 0) {
        setDisplayedPresets(data.presets);
        setSelectedGenrePresetId(data.presets[0].id);
        applyGenrePresetToWorld(data.presets[0]);
      } else {
        refreshGenrePresets(category, false);
      }
    } catch (err) {
      console.warn('Dynamic Preset Generation failed, falling back to catalog:', err);
      refreshGenrePresets(category, false);
    } finally {
      setIsGeneratingPresets(false);
    }
  };

  // Dynamic AI Meta Pool Generation
  const handleDynamicMetaPoolRefresh = async () => {
    if (isGeneratingMetaPool) return;
    setIsGeneratingMetaPool(true);
    try {
      const res = await fetch('/api/generate-meta-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ world }),
      });
      const data = await res.json();
      if (data.success && data.pools) {
        setMetaPool(data.pools);
        const pickRandom = (arr: string[] = []) => (arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : '');
        const updatedMeta: MetaElements = {
          background: metaInputs.background.type === 'preset' ? { ...metaInputs.background, value: pickRandom(data.pools.background) } : metaInputs.background,
          flaw: metaInputs.flaw.type === 'preset' ? { ...metaInputs.flaw, value: pickRandom(data.pools.flaw) } : metaInputs.flaw,
          oath: metaInputs.oath.type === 'preset' ? { ...metaInputs.oath, value: pickRandom(data.pools.oath) } : metaInputs.oath,
          anchor: metaInputs.anchor.type === 'preset' ? { ...metaInputs.anchor, value: pickRandom(data.pools.anchor) } : metaInputs.anchor,
          faction: metaInputs.faction.type === 'preset' ? { ...metaInputs.faction, value: pickRandom(data.pools.faction) } : metaInputs.faction,
        };
        setMetaInputs(updatedMeta);
        onUpdateCharacter({ ...character, metaElements: updatedMeta });
      }
    } catch (err) {
      console.warn('Dynamic Meta Pool Generation failed:', err);
    } finally {
      setIsGeneratingMetaPool(false);
    }
  };

  // Dynamic AI Character Concept Auto-Fill
  const handleDynamicCharacterAutoFill = async () => {
    if (isGeneratingCharacter) return;
    setIsGeneratingCharacter(true);
    try {
      const res = await fetch('/api/generate-character-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ world, metaElements: metaInputs }),
      });
      const data = await res.json();
      if (data.success && data.concept) {
        const c = data.concept;
        if (c.name) setCharName(c.name);
        if (c.title) setCharTitle(c.title);
        if (c.age) setCharAge(c.age);
        if (c.gender) setCharGender(c.gender);
        if (c.appearance) setCharAppearance(c.appearance);
        if (c.currentGoal) setCharGoal(c.currentGoal);
        if (c.stats) {
          const validatedStats = {
            strength: Math.max(3, Math.min(18, c.stats.strength || 10)),
            agility: Math.max(3, Math.min(18, c.stats.agility || 10)),
            vitality: Math.max(3, Math.min(18, c.stats.vitality || 10)),
            intellect: Math.max(3, Math.min(18, c.stats.intellect || 10)),
            insight: Math.max(3, Math.min(18, c.stats.insight || 10)),
            willpower: Math.max(3, Math.min(18, c.stats.willpower || 10)),
          };
          setStats(validatedStats);
          onUpdateCharacter({
            ...character,
            name: c.name,
            title: c.title,
            age: c.age,
            gender: c.gender,
            appearance: c.appearance,
            currentGoal: c.currentGoal,
            stats: validatedStats,
            metaElements: metaInputs,
          });
        }
      }
    } catch (err) {
      console.warn('Dynamic Character Concept Generation failed:', err);
    } finally {
      setIsGeneratingCharacter(false);
    }
  };

  const refreshGenrePresets = (category: GenreCategory, applyCooldown = true) => {
    if (applyCooldown && cooldown > 0) return;
    const presets = getRandom10Presets(category);
    setDisplayedPresets(presets);
    if (presets.length > 0) {
      setSelectedGenrePresetId(presets[0].id);
      applyGenrePresetToWorld(presets[0]);
    }
    if (applyCooldown) triggerCooldown();
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

  // Phase 1: Popular Genre Selection Handler
  const handleSelectGenrePreset = (preset: GenrePreset) => {
    setSelectedGenrePresetId(preset.id);
    applyGenrePresetToWorld(preset);
  };

  // Phase 1: Tone & Manner Selection Handler
  const handleSelectTone = (tone: ToneAndManner) => {
    const updatedTone = tone.id === 'custom_tone' && customToneDirective.trim() 
      ? { ...tone, directive: customToneDirective.trim() } 
      : tone;
    setSelectedTone(updatedTone);
    onUpdateWorld({
      ...world,
      toneAndManner: updatedTone,
    });
  };

  // Phase 1: World Validation API Caller
  const handleValidateAndProceedPhase1 = async () => {
    setValidationError(null);

    if (world.worldMode === 'popular_genre') {
      const preset = displayedPresets.find((p) => p.id === selectedGenrePresetId) || displayedPresets[0];
      onUpdateWorld({
        ...world,
        worldMode: 'popular_genre',
        worldName: preset.name,
        worldGenre: preset.period,
        worldPremise: preset.premise,
        toneAndManner: selectedTone,
      });
      setStep(2);
      return;
    }

    if (world.worldMode === 'original_ip') {
      const trimmedQuery = originalIpInput.trim();
      if (!trimmedQuery) {
        setValidationError('원작 작품명을 입력해 주십시오.');
        return;
      }

      setIsValidating(true);
      try {
        const res = await fetch('/api/validate-world', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'original_ip',
            query: trimmedQuery,
          }),
        });

        const data: WorldVerificationResult = await res.json();
        setIsValidating(false);

        if (!res.ok || !data.valid) {
          setValidationModal({
            isOpen: true,
            type: 'original_ip_fail',
            data: {
              valid: false,
              recognizedTitle: data.recognizedTitle || trimmedQuery,
              summary: data.summary || '일치하는 실존 원작을 찾을 수 없습니다. 정확한 원작 작품명을 다시 입력해 주세요.',
              keyFactions: '',
              settingEra: '원작 배경',
              isMinorOrUnknown: true,
            },
            onConfirm: () => {
              const originalTone = TONE_AND_MANNER_CATALOG.find(t => t.id === 'original_ip_faithful') || TONE_AND_MANNER_CATALOG[0];
              const finalTone = {
                ...originalTone,
                name: `[📜 ${trimmedQuery}] 원작 고유 문체 충실 재현`,
                description: `[${trimmedQuery}] 원작의 정통 문체, 캐릭터 대사톤 및 세계관 고유의 용어를 충실히 재현합니다.`,
              };

              setSelectedTone(finalTone);
              onUpdateWorld({
                ...world,
                worldMode: 'original_ip',
                worldName: trimmedQuery,
                worldGenre: '원작 정사 세계관',
                worldPremise: `${trimmedQuery} 원작의 정사 타임라인과 설정을 기반으로 모험을 진행합니다.`,
                toneAndManner: finalTone,
              });
              setValidationModal({ isOpen: false, type: 'original_ip_fail' });
              setStep(2);
            },
            onCancel: () => {
              setValidationModal({ isOpen: false, type: 'original_ip_fail' });
            },
          });
          return;
        }

        // Success dialog for confirmation
        setValidationModal({
          isOpen: true,
          type: 'original_ip_success',
          data,
          onConfirm: () => {
            const originalTone = TONE_AND_MANNER_CATALOG.find(t => t.id === 'original_ip_faithful') || TONE_AND_MANNER_CATALOG[0];
            const finalTone = {
              ...originalTone,
              name: `[📜 ${data.recognizedTitle}] 원작 고유 문체 충실 재현`,
              description: `[${data.recognizedTitle}] 원작의 정통 문체, 캐릭터 대사톤 및 세계관 고유의 용어를 충실히 재현합니다.`,
            };

            setSelectedTone(finalTone);
            onUpdateWorld({
              ...world,
              worldMode: 'original_ip',
              worldName: data.recognizedTitle,
              worldGenre: data.settingEra || '원작 정사 세계관',
              worldPremise: data.summary + (data.keyFactions ? `\n[주요 세력]: ${data.keyFactions}` : ''),
              toneAndManner: finalTone,
            });
            setValidationModal({ isOpen: false, type: 'original_ip_success' });
            setStep(2);
          },
          onCancel: () => {
            setValidationModal({ isOpen: false, type: 'original_ip_success' });
          },
        });
      } catch (err: any) {
        setIsValidating(false);
        setValidationError('네트워크 연결 지연으로 원작 검증에 실패했습니다. 다시 시도해 주세요.');
      }
      return;
    }

    if (world.worldMode === 'custom') {
      if (!customTitleInput.trim() || !customPremiseInput.trim()) {
        setValidationError('세계관 이름과 기본 설정을 입력해 주십시오.');
        return;
      }

      setIsValidating(true);
      try {
        const res = await fetch('/api/validate-world', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'custom',
            title: customTitleInput,
            genre: customGenreInput || '자유 판타지',
            premise: customPremiseInput,
          }),
        });

        const data: WorldVerificationResult = await res.json();
        setIsValidating(false);

        if (!res.ok) {
          setValidationError('세계관 정제 중 오류가 발생했습니다. 다시 시도해 주세요.');
          return;
        }

        setValidationModal({
          isOpen: true,
          type: 'custom_confirm',
          data,
          onConfirm: () => {
            onUpdateWorld({
              ...world,
              worldMode: 'custom',
              worldName: data.recognizedTitle || customTitleInput,
              worldGenre: data.settingEra || customGenreInput || '창작 세계관',
              worldPremise: data.summary || customPremiseInput,
              toneAndManner: selectedTone,
            });
            setValidationModal({ isOpen: false, type: 'custom_confirm' });
            setStep(2);
          },
          onCancel: () => {
            setValidationModal({ isOpen: false, type: 'custom_confirm' });
          },
        });
      } catch (err: any) {
        setIsValidating(false);
        setValidationError('네트워크 연결 지연으로 정제에 실패했습니다. 다시 시도해 주세요.');
      }
    }
  };

  // Phase 2: Meta Elements Handlers
  const handleMetaItemChange = (field: keyof MetaElements, item: MetaItem) => {
    const updated = { ...metaInputs, [field]: item };
    setMetaInputs(updated);
    onUpdateCharacter({
      ...character,
      metaElements: updated,
    });
  };

  // Switch to Custom Input with Clean Input (No pollution from previous preset)
  const handleSwitchToCustomInput = (field: keyof MetaElements, title: string) => {
    const existingVal = metaInputs[field]?.type === 'custom' ? metaInputs[field].value : '';
    handleMetaItemChange(field, {
      type: 'custom',
      value: existingVal,
      label: title,
    });
  };

  // Phase 2: Single item re-roll with guaranteed different option
  const rerollSingleMetaItem = (field: keyof MetaElements) => {
    const pool = metaPool[field] && metaPool[field].length > 0 ? metaPool[field] : (getWorldTailoredMetaPool(world)[field] || []);
    if (!pool || pool.length === 0) return;
    const currentVal = metaInputs[field]?.value || '';
    const otherOptions = pool.filter(opt => opt !== currentVal);
    const candidatePool = otherOptions.length > 0 ? otherOptions : pool;
    const nextVal = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    
    handleMetaItemChange(field, {
      type: 'preset',
      value: nextVal,
      label: character.metaElements[field]?.label || field,
    });
  };

  // Phase 2: One-click all-in-one smart recommendation
  const applyAllInOneSmartMetaSet = () => {
    const currentPool = (metaPool.background && metaPool.background.length > 0) ? metaPool : getWorldTailoredMetaPool(world);
    const pickRandom = (arr: string[] = []) => (arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : '');
    const smartSet: MetaElements = {
      background: { type: 'preset', value: pickRandom(currentPool.background), label: '배경 설정' },
      flaw: { type: 'preset', value: pickRandom(currentPool.flaw), label: '인간적 결핍과 트라우마' },
      oath: { type: 'preset', value: pickRandom(currentPool.oath), label: '신념 및 맹세' },
      anchor: { type: 'preset', value: pickRandom(currentPool.anchor), label: '소중한 것 / 버팀목' },
      faction: { type: 'preset', value: pickRandom(currentPool.faction), label: '소속 세력' },
    };
    setMetaInputs(smartSet);
    onUpdateCharacter({
      ...character,
      metaElements: smartSet,
    });
  };

  // Phase 3: Reroll CSPRNG Stats
  const handleRerollStats = () => {
    if (cooldown > 0) return;
    const newStats = generateAllStatsCSPRNG();
    setStats(newStats);
    onUpdateCharacter({
      ...character,
      stats: newStats,
    });
    triggerCooldown();
  };

  // Phase 3: Update single stat manually
  const handleManualStatChange = (key: keyof typeof stats, value: number) => {
    const clamped = Math.max(3, Math.min(18, value || 3));
    const nextStats = { ...stats, [key]: clamped };
    setStats(nextStats);
    onUpdateCharacter({
      ...character,
      stats: nextStats,
    });
  };

  // Phase 3: Final Completion Handler
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

  // Detailed placeholders for custom inputs
  const META_PLACEHOLDERS: Record<keyof MetaElements, string> = {
    background: '예: 몰락한 명문 세가의 서자로 태어나 스승의 비급을 품고 도망친 과거',
    flaw: '예: 치명적인 내상을 입어 한쪽 맥이 막혀 있거나, 어둠에 대한 깊은 공포증 (서사 진행 중 극복 가능)',
    oath: '예: 억울하게 죽은 스승의 명예를 회복하기 전까진 결코 술을 입에 대지 않는다',
    anchor: '예: 어릴 적 헤어진 여동생이 건네준 낡은 은비녀',
    faction: '예: 무림맹의 감시를 받는 은밀한 정보조직 묵영각',
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24">
      {/* Top Creation Progress Stepper */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                step === 1
                  ? 'bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>1단계: 세계관 & 톤</span>
            </button>

            <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:block" />

            <button
              type="button"
              onClick={() => step >= 2 && setStep(2)}
              disabled={step < 2}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                step === 2
                  ? 'bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20'
                  : step > 2
                  ? 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-zinc-900 text-zinc-600 cursor-not-allowed opacity-50'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>2단계: 5대 메타 요소</span>
            </button>

            <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:block" />

            <button
              type="button"
              onClick={() => step >= 3 && setStep(3)}
              disabled={step < 3}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                step === 3
                  ? 'bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-600 cursor-not-allowed opacity-50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>3단계: 캐릭터 시트</span>
            </button>
          </div>

          <div className="text-xs text-zinc-400 font-mono hidden md:block">
            High-Fidelity TRPG Engine Rev 3.1
          </div>
        </div>
      </div>

      {/* STEP 1: WORLD ESTABLISHMENT & TONE AND MANNER */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          {/* World Mode Selector Tabs */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400" />
                Phase 1: 세계관 확립 및 톤앤매너 설정
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                모험의 무대가 될 세계관과 엔딩까지 유지될 서사의 문체(Tone & Style)를 선택하세요.
              </p>
            </div>

            {/* 3 Main World Modes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => onUpdateWorld({ ...world, worldMode: 'popular_genre' })}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  world.worldMode === 'popular_genre'
                    ? 'border-amber-500 bg-amber-500/10 text-zinc-100 shadow-md ring-1 ring-amber-500'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="font-semibold text-sm flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-amber-400" />
                    인기 장르 프리셋
                  </span>
                  {world.worldMode === 'popular_genre' && <CheckCircle className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-xs text-zinc-400 mt-1.5">
                  J애니, JRPG, 정통 무협, 다크 판타지 등 검증된 10종 추천 세계관
                </p>
              </button>

              <button
                type="button"
                onClick={() => onUpdateWorld({ ...world, worldMode: 'original_ip' })}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  world.worldMode === 'original_ip'
                    ? 'border-amber-500 bg-amber-500/10 text-zinc-100 shadow-md ring-1 ring-amber-500'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="font-semibold text-sm flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    기존 원작 IP (고증 모드)
                  </span>
                  {world.worldMode === 'original_ip' && <CheckCircle className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-xs text-zinc-400 mt-1.5">
                  귀멸의 칼날, 반지의 제왕, 듄 등 실존 원작 정사 실시간 검색 고증
                </p>
              </button>

              <button
                type="button"
                onClick={() => onUpdateWorld({ ...world, worldMode: 'custom' })}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  world.worldMode === 'custom'
                    ? 'border-amber-500 bg-amber-500/10 text-zinc-100 shadow-md ring-1 ring-amber-500'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="font-semibold text-sm flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    오리지널 세계관 창작
                  </span>
                  {world.worldMode === 'custom' && <CheckCircle className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-xs text-zinc-400 mt-1.5">
                  자신만의 독창적인 세계관을 직접 서술하고 AI가 정밀 정제
                </p>
              </button>
            </div>

            {/* MODE 1: POPULAR GENRE WITH 5 CATEGORIES & 10 PRESETS REROLL */}
            {world.worldMode === 'popular_genre' && (
              <div className="space-y-4 pt-2">
                {/* Category Filter Chips & 10-Preset Reroll Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-400 mr-1">분류 필터:</span>
                    {[
                      { id: 'all', label: '🌐 전체 추천 (황금비율)' },
                      { id: 'janime_jrpg', label: '🎌 J애니 & JRPG' },
                      { id: 'classic_fantasy', label: '⚔️ 정통 판타지 & 무협' },
                      { id: 'scifi_cyber', label: '🚀 SF & 사이버' },
                      { id: 'mystery_horror', label: '🕯️ 미스터리 & 호러' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setGenreCategory(cat.id as GenreCategory);
                          refreshGenrePresets(cat.id as GenreCategory, false);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          genreCategory === cat.id
                            ? 'bg-amber-500 text-black font-semibold shadow'
                            : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => refreshGenrePresets(genreCategory, false)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-all border border-zinc-700"
                    >
                      <Dice5 className="w-3.5 h-3.5 text-amber-400" />
                      <span>🎲 10종 리롤</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDynamicPresetRefresh(genreCategory)}
                      disabled={isGeneratingPresets}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium transition-all border border-amber-500/40 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPresets ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingPresets ? 'AI 창작 중...' : '⚡ AI 무한 창작'}</span>
                    </button>
                  </div>
                </div>

                {/* 10 Presets Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {displayedPresets.map((preset) => {
                    const isSelected = selectedGenrePresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectGenrePreset(preset)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500/50'
                            : 'border-zinc-800/90 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-zinc-100">{preset.name}</h4>
                          {isSelected && <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                        </div>
                        <p className="text-xs text-amber-400/90 font-mono mt-0.5">{preset.period}</p>
                        <p className="text-xs text-zinc-300 mt-2 line-clamp-2 leading-relaxed">
                          {preset.premise}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {preset.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-[10px] text-zinc-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MODE 2: ORIGINAL IP SEARCH INPUT */}
            {world.worldMode === 'original_ip' && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    원작 작품명 입력 (소설, 만화, 애니메이션, 게임, 영화 등)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={originalIpInput}
                      onChange={(e) => {
                        setOriginalIpInput(e.target.value);
                        setValidationError(null);
                      }}
                      placeholder="예: 전생슬, 귀멸의 칼날, 사조영웅전, 반지의 제왕, 듄, 나루토..."
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <p className="text-xs text-zinc-500">
                    💡 약칭이나 줄임말('전생슬', '귀칼', '사조' 등)도 AI가 실시간 외부 검색으로 정식 명칭과 시대, 세력을 정확히 판별합니다.
                  </p>
                </div>
              </div>
            )}

            {/* MODE 3: CUSTOM WORLD BUILDING */}
            {world.worldMode === 'custom' && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">세계관 이름</label>
                    <input
                      type="text"
                      value={customTitleInput}
                      onChange={(e) => setCustomTitleInput(e.target.value)}
                      placeholder="예: 영구동토의 증기제국"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">장르 및 시대적 배경</label>
                    <input
                      type="text"
                      value={customGenreInput}
                      onChange={(e) => setCustomGenreInput(e.target.value)}
                      placeholder="예: 스팀펑크, 빙하기 아포칼립스"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">세계관 설정 및 핵심 대립 구도 서술</label>
                  <textarea
                    rows={4}
                    value={customPremiseInput}
                    onChange={(e) => setCustomPremiseInput(e.target.value)}
                    placeholder="세계관의 핵심 분위기, 주요 세력 간의 갈등, 기술/마법 체계 등을 자유롭게 서술하세요. 거칠게 작성하시더라도 AI가 깔끔하게 정제해 드립니다."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TONE AND MANNER SELECTION SECTION */}
            <div className="pt-4 border-t border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <Feather className="w-4 h-4 text-amber-400" />
                    서사 톤앤매너 (Tone & Literary Style)
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {world.worldMode === 'original_ip'
                      ? '원작 IP 모드에서는 원작 고유의 문체와 대사톤이 1번 디폴트로 고정 연동됩니다.'
                      : '이번 세션 엔딩까지 일관되게 유지될 서사의 문체와 분위기입니다.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTonePicker(!showTonePicker)}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showTonePicker ? '카탈로그 접기' : '톤앤매너 카탈로그 보기'}</span>
                </button>
              </div>

              {/* Selected Tone Preview Card */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-zinc-100">{selectedTone.name}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${selectedTone.badgeColor || 'border-zinc-700 text-zinc-300'}`}>
                      {selectedTone.categoryLabel}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 italic">
                    {selectedTone.previewQuote}
                  </p>
                </div>
                <span className="text-xs text-amber-400 font-mono shrink-0">
                  ✓ 엔딩까지 지속 적용
                </span>
              </div>

              {/* Expanded Tone Catalog Grid */}
              {showTonePicker && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 max-h-[320px] overflow-y-auto pr-1 animate-fadeIn">
                  {TONE_AND_MANNER_CATALOG
                    .filter(t => world.worldMode === 'original_ip' || t.id !== 'original_ip_faithful')
                    .map((tone) => {
                      const isSelected = selectedTone.id === tone.id;
                      return (
                        <button
                          key={tone.id}
                          type="button"
                          onClick={() => handleSelectTone(tone)}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/50'
                              : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-zinc-200">{tone.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded border ${tone.badgeColor || ''}`}>
                              {tone.categoryLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1 italic">
                            {tone.previewQuote}
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">
                            {tone.description}
                          </p>
                        </button>
                      );
                    })}
                </div>
              )}

              {/* Custom Tone Input if selected */}
              {selectedTone.id === 'custom_tone' && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-zinc-300">직접 서술할 문체 가이드라인</label>
                  <textarea
                    rows={2}
                    value={customToneDirective}
                    onChange={(e) => {
                      setCustomToneDirective(e.target.value);
                      handleSelectTone({ ...selectedTone, directive: e.target.value });
                    }}
                    placeholder="예: 1920년대 경성 모던보이 말투와 순수 한글 어휘 위주로 서술하며, 감각적인 야경 묘사에 집중하라."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Error Notification Alert */}
            {validationError && (
              <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Step 1 Next Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleValidateAndProceedPhase1}
                disabled={isValidating}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>세계관 고증 및 검증 중...</span>
                  </>
                ) : (
                  <>
                    <span>세계관 확정 및 메타요소 단계로 이동</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: 5 META ELEMENTS (BACKGROUND, FLAW, OATH, ANCHOR, FACTION) */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  Phase 2: 5대 메타 요소 구축
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  세계관: <strong className="text-zinc-200">{world.worldName}</strong> ({world.worldGenre || '장르'}) | 톤: <span className="text-amber-400">{world.toneAndManner?.name || '정통 문체'}</span>
                </p>
              </div>

              {/* Step 2 Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={applyAllInOneSmartMetaSet}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>🎲 5대 메타요소 올인원 무작위 추천</span>
                </button>

                <button
                  type="button"
                  onClick={handleDynamicMetaPoolRefresh}
                  disabled={isGeneratingMetaPool}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-amber-400 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingMetaPool ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingMetaPool ? 'AI 메타 풀 생성 중...' : '⚡ AI 20종 메타요소 풀 확장'}</span>
                </button>
              </div>
            </div>

            {/* 5 Meta Fields Cards */}
            <div className="space-y-5">
              {[
                { 
                  key: 'background', 
                  title: '1. 배경 설정 (Background)', 
                  desc: '주인공의 출신, 성장 환경 및 세계관 내 초기 위치',
                  badgeText: null,
                  tabulaNote: '🎲 [AI 독창적 미지의 과거 창작] (기억상실, 봉인된 혈통 등 서사 속에서 실마리가 밝혀집니다)'
                },
                { 
                  key: 'flaw', 
                  title: '2. 인간적 결핍과 트라우마 (성장 & 극복 가능)', 
                  desc: '서사적 긴장감을 유발하는 육체적/정신적 약점이며, 뼈를 깎는 수련과 깨달음으로 극복 가능합니다.',
                  badgeText: '🌱 서사 진행 중 내적 성장을 통해 극복/승화 가능',
                  tabulaNote: '🌱 [무결한 상태 / 방랑자의 백지] (결핍 없이 시작하며, 서사 중 새로운 시련을 통해 유기적으로 형성 가능)'
                },
                { 
                  key: 'oath', 
                  title: '3. 신념 및 맹세 (Oath)', 
                  desc: '어떤 위기에서도 결코 꺾이지 않는 주인공의 절대적 행동 원칙',
                  badgeText: null,
                  tabulaNote: '🌱 [자유로운 방랑자] (고정된 맹세 없이 시작하며, 서사 중 운명적 인연을 만나 결의를 맺게 됩니다)'
                },
                { 
                  key: 'anchor', 
                  title: '4. 소중한 것 / 버팀목 (Anchor)', 
                  desc: '이성을 붙잡아 주는 소중한 인연, 유품, 혹은 궁극의 귀환 장소',
                  badgeText: null,
                  tabulaNote: '🌱 [혈혈단신] (버팀목 없이 시작하며, 서사 중 동료나 보물을 획득하여 새로운 닻으로 형성됩니다)'
                },
                { 
                  key: 'faction', 
                  title: '5. 소속 세력 (Faction)', 
                  desc: '초기 귀속되어 있거나 인연을 맺고 있는 조직 및 문파',
                  badgeText: null,
                  tabulaNote: '🌱 [무소속 / 재야] (자유 신분으로 시작하며, 서사 중 문파 입문이나 세력 창설이 가능합니다)'
                },
              ].map(({ key, title, desc, badgeText, tabulaNote }) => {
                const fieldKey = key as keyof MetaElements;
                const currentItem = metaInputs[fieldKey] || { type: 'preset', value: '', label: title };
                const pool = (metaPool[fieldKey] && metaPool[fieldKey].length > 0) 
                  ? metaPool[fieldKey] 
                  : (getWorldTailoredMetaPool(world)[fieldKey] || []);

                return (
                  <div key={key} className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                            <span>{title}</span>
                          </h3>
                          {badgeText && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold">
                              {badgeText}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
                      </div>

                      {/* 3 Choice Modes Buttons */}
                      <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const nextVal = currentItem.value && currentItem.type === 'preset' ? currentItem.value : pool[0];
                            handleMetaItemChange(fieldKey, { type: 'preset', value: nextVal, label: title });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            currentItem.type === 'preset'
                              ? 'bg-amber-500 text-black font-bold shadow'
                              : 'bg-zinc-800/90 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          프리셋 선택
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSwitchToCustomInput(fieldKey, title)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            currentItem.type === 'custom'
                              ? 'bg-amber-500 text-black font-bold shadow'
                              : 'bg-zinc-800/90 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          직접 서술
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMetaItemChange(fieldKey, { type: 'tabula_rasa', value: '미상 / 백지 상태 (Tabula Rasa)', isTabulaRasa: true, label: title })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            currentItem.type === 'tabula_rasa'
                              ? 'bg-purple-600 text-white font-bold shadow'
                              : 'bg-zinc-800/90 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          백지상태 (공백)
                        </button>
                      </div>
                    </div>

                    {/* Content Display based on Choice Mode */}
                    {currentItem.type === 'preset' && (
                      <div className="space-y-2.5">
                        {/* Currently Selected Highlight Box */}
                        <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-center justify-between gap-3 shadow-inner">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="text-xs font-medium text-zinc-100 truncate">
                              {currentItem.value || pool[0]}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => rerollSingleMetaItem(fieldKey)}
                            title="다른 프리셋 무작위 뽑기"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-amber-400 text-xs font-medium transition-all shrink-0"
                          >
                            <Dice5 className="w-3.5 h-3.5" />
                            <span>랜덤 리롤</span>
                          </button>
                        </div>

                        {/* Interactive Clickable Chips Grid */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-zinc-400">추천 선택지 (클릭하여 즉시 적용):</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                            {pool.slice(0, 8).map((opt, idx) => {
                              const isSelected = currentItem.value === opt;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleMetaItemChange(fieldKey, { type: 'preset', value: opt, label: title })}
                                  className={`p-2 rounded-lg text-left text-xs transition-all flex items-center justify-between gap-2 border ${
                                    isSelected
                                      ? 'bg-amber-500/20 border-amber-500/80 text-amber-200 font-semibold'
                                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100 hover:border-zinc-700'
                                  }`}
                                >
                                  <span className="truncate">{opt}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Full Dropdown for all options */}
                        {pool.length > 8 && (
                          <div className="pt-1">
                            <select
                              value={currentItem.value}
                              onChange={(e) => handleMetaItemChange(fieldKey, { type: 'preset', value: e.target.value, label: title })}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                            >
                              <option value="" disabled>전체 {pool.length}종 목록에서 선택...</option>
                              {pool.map((opt, idx) => (
                                <option key={idx} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {currentItem.type === 'custom' && (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={currentItem.value}
                          onChange={(e) => handleMetaItemChange(fieldKey, { type: 'custom', value: e.target.value, label: title })}
                          placeholder={META_PLACEHOLDERS[fieldKey]}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                        />
                        <p className="text-[11px] text-amber-400/90">
                          💡 플레이어가 직접 작성한 골든 데이터는 AI GM의 최우선 서사 떡밥 및 갈등 동기로 100% 반영됩니다.
                        </p>
                      </div>
                    )}

                    {currentItem.type === 'tabula_rasa' && (
                      <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-900/50 text-xs text-purple-300">
                        ✨ <strong>정체성 미스터리 촉매:</strong> {tabulaNote}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step 2 Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-all"
              >
                ← 이전 (세계관 설정)
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
              >
                <span>캐릭터 시트 및 스탯 생성으로 이동</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CHARACTER SHEET & CSPRNG STAT ROLLER */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  Phase 3: 캐릭터 시트 및 능력치(스탯) 생성
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                  세계관: <strong className="text-zinc-200">{world.worldName}</strong> | 암호학적 난수(CSPRNG) 주사위로 능력치를 굴리거나 자유롭게 직접 입력하세요.
                </p>
              </div>

              {/* AI World-Tailored Character Profile & Stat Auto-Fill Button */}
              <button
                type="button"
                onClick={handleDynamicCharacterAutoFill}
                disabled={isGeneratingCharacter}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/50 text-amber-300 text-xs font-bold transition-all shadow disabled:opacity-50"
              >
                {isGeneratingCharacter ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-400" />
                )}
                <span>
                  {isGeneratingCharacter
                    ? 'AI 세계관 맞춤 캐릭터 창작 중...'
                    : '✨ AI 세계관 맞춤 캐릭터 & 스탯 무작위 생성 (Auto-Fill)'}
                </span>
              </button>
            </div>

            {/* Profile Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">이름</label>
                <input
                  type="text"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">칭호 / 직함</label>
                <input
                  type="text"
                  value={charTitle}
                  onChange={(e) => setCharTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">나이</label>
                <input
                  type="number"
                  value={charAge}
                  onChange={(e) => setCharAge(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">성별</label>
                <select
                  value={charGender}
                  onChange={(e) => setCharGender(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            {/* Appearance & Goal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">외형 묘사</label>
                <input
                  type="text"
                  value={charAppearance}
                  onChange={(e) => setCharAppearance(e.target.value)}
                  placeholder="예: 검은 삿갓을 눌러쓰고 날카로운 안광을 번뜩이는 청년"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">초기 목표</label>
                <input
                  type="text"
                  value={charGoal}
                  onChange={(e) => setCharGoal(e.target.value)}
                  placeholder="예: 실종된 사형의 흔적을 찾고 살아남는 것"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* CSPRNG vs Manual Direct Stat Toggle & Board */}
            <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <Dice5 className="w-4 h-4 text-amber-400" />
                    6대 기본 능력치 (Stats)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {statInputMode === 'dice' 
                      ? 'CSPRNG 4d6 공정 주사위 굴림 방식 (3~18)' 
                      : '자유 직접 입력 모드 (3~18 수치 직접 조정)'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mode Toggle */}
                  <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setStatInputMode('dice')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        statInputMode === 'dice' ? 'bg-amber-500 text-black font-bold shadow' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      🎲 주사위
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatInputMode('manual')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        statInputMode === 'manual' ? 'bg-amber-500 text-black font-bold shadow' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      ✏️ 직접 입력
                    </button>
                  </div>

                  {statInputMode === 'dice' && (
                    <button
                      type="button"
                      onClick={handleRerollStats}
                      disabled={cooldown > 0}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-medium transition-all disabled:opacity-50"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${cooldown > 0 ? 'animate-spin' : ''}`} />
                      <span>{cooldown > 0 ? `쿨다운 (${cooldown}s)` : '스탯 전체 리롤'}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {[
                  { key: 'strength', label: '근력 / 공력', val: stats.strength },
                  { key: 'agility', label: '민첩 / 신법', val: stats.agility },
                  { key: 'vitality', label: '체력 / 기골', val: stats.vitality },
                  { key: 'intellect', label: '지략 / 학식', val: stats.intellect },
                  { key: 'insight', label: '통찰 / 안목', val: stats.insight },
                  { key: 'willpower', label: '정신 / 의지', val: stats.willpower },
                ].map(({ key, label, val }) => {
                  const statKey = key as keyof typeof stats;
                  const mod = calculateModifier(val);
                  return (
                    <div key={key} className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl text-center flex flex-col justify-between">
                      <div className="text-[11px] text-zinc-400 font-medium">{label}</div>
                      
                      {statInputMode === 'dice' ? (
                        <div className="text-xl font-bold text-amber-400 my-1 font-mono">{val}</div>
                      ) : (
                        <input
                          type="number"
                          min={3}
                          max={18}
                          value={val}
                          onChange={(e) => handleManualStatChange(statKey, parseInt(e.target.value) || 3)}
                          className="w-16 mx-auto bg-zinc-950 border border-amber-500/60 rounded-lg text-center text-lg font-bold text-amber-400 my-1 font-mono focus:outline-none"
                        />
                      )}

                      <div className={`text-[10px] font-mono ${mod >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        보정치: {mod >= 0 ? `+${mod}` : mod}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Final Game Start Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-all"
              >
                ← 이전 (메타 요소)
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-base shadow-xl shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-5 h-5" />
                <span>모험 시작 (서사 개막)</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VALIDATION CONFIRMATION / REJECTION MODAL */}
      {validationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            {validationModal.type === 'original_ip_success' && (
              <>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span>원작 작품 확인 및 고증 완료</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  실시간 외부 검색을 통해 검증된 정식 원작 정보입니다. 이 세계관으로 모험을 시작하시겠습니까?
                </p>

                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2.5 text-xs text-zinc-300">
                  <div>
                    <span className="text-zinc-500 font-semibold">📖 정식 원작명:</span>
                    <p className="font-bold text-amber-400 text-sm mt-0.5">
                      {(validationModal.data as WorldVerificationResult)?.recognizedTitle}
                    </p>
                  </div>
                  {(validationModal.data as WorldVerificationResult)?.settingEra && (
                    <div>
                      <span className="text-zinc-500 font-semibold">🗺️ 주요 배경 및 시대:</span>
                      <p className="text-zinc-200 mt-0.5">{(validationModal.data as WorldVerificationResult)?.settingEra}</p>
                    </div>
                  )}
                  {(validationModal.data as WorldVerificationResult)?.keyFactions && (
                    <div>
                      <span className="text-zinc-500 font-semibold">👥 주요 등장 세력:</span>
                      <p className="text-zinc-200 mt-0.5">{(validationModal.data as WorldVerificationResult)?.keyFactions}</p>
                    </div>
                  )}
                  {(validationModal.data as WorldVerificationResult)?.summary && (
                    <div>
                      <span className="text-zinc-500 font-semibold">📝 핵심 시놉시스:</span>
                      <p className="text-zinc-300 mt-0.5 leading-relaxed">
                        {(validationModal.data as WorldVerificationResult)?.summary}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={validationModal.onCancel}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300"
                  >
                    다른 작품 입력하기 (취소)
                  </button>
                  <button
                    type="button"
                    onClick={validationModal.onConfirm}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs text-black font-bold shadow"
                  >
                    이 원작으로 확정하기 (확인)
                  </button>
                </div>
              </>
            )}

            {validationModal.type === 'original_ip_fail' && (
              <>
                <div className="flex items-center gap-2 text-rose-400 font-bold text-lg">
                  <AlertTriangle className="w-5 h-5" />
                  <span>원작 검증 실패 (작품 미확인)</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  입력하신 <strong className="text-rose-300">"{(validationModal.data as WorldVerificationResult)?.recognizedTitle}"</strong>은(는) 실존하는 원작 IP(소설, 만화, 영화 등)로 확인되지 않았습니다.
                </p>

                <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl text-xs text-zinc-400 space-y-1">
                  <p>• 무의미한 자음/모음 난수나 오타가 아닌지 확인해 주세요.</p>
                  <p>• 원작이 없는 개인 창작 세계관인 경우 <strong>[오리지널 세계관 창작]</strong> 탭을 이용해 주세요.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={validationModal.onCancel}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-semibold"
                  >
                    다시 입력하기
                  </button>
                  {validationModal.onConfirm && (
                    <button
                      type="button"
                      onClick={validationModal.onConfirm}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs text-stone-950 font-bold shadow"
                    >
                      이 명칭으로 직접 시작하기 (수동 확인)
                    </button>
                  )}
                </div>
              </>
            )}

            {validationModal.type === 'custom_confirm' && (
              <>
                <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
                  <Sparkles className="w-5 h-5" />
                  <span>세계관 설정 정리 및 확인</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  입력하신 내용을 바탕으로 TRPG 플레이에 알맞게 세계관 설정을 깔끔하게 정리했습니다. 이 설정으로 진행하시겠습니까?
                </p>

                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs text-zinc-300">
                  <div>
                    <span className="text-zinc-500 font-semibold">🏛️ 세계관 이름:</span>
                    <p className="font-bold text-zinc-100 mt-0.5">{(validationModal.data as WorldVerificationResult)?.recognizedTitle}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-semibold">📜 시대 및 배경:</span>
                    <p className="text-zinc-200 mt-0.5">{(validationModal.data as WorldVerificationResult)?.settingEra}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-semibold">⚖️ 주요 세력 및 갈등:</span>
                    <p className="text-zinc-200 mt-0.5">{(validationModal.data as WorldVerificationResult)?.keyFactions}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={validationModal.onCancel}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300"
                  >
                    다시 수정하기
                  </button>
                  <button
                    type="button"
                    onClick={validationModal.onConfirm}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs text-black font-bold shadow"
                  >
                    이 세계관으로 결정하기 (다음 단계)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};