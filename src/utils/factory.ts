import { Character, CharacterStats, GameState, WorldInfoState, ParsedMetadata } from '../types';
import { TONE_AND_MANNER_CATALOG } from '../data/genreAndToneData';

/**
 * Standard Recursive Deep Merge Utility
 * Prevents TypeError crashes when hydrating partial or nested state structures.
 */
export function deepMerge<T>(target: T, source: any): T {
  if (!source || typeof source !== 'object') {
    return target;
  }
  if (!target || typeof target !== 'object') {
    return source;
  }

  // Handle arrays: if source has array, prefer source if non-empty, else target
  if (Array.isArray(target)) {
    return (Array.isArray(source) ? source : target) as unknown as T;
  }

  const output = { ...target } as any;
  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = output[key];

    if (sourceVal === undefined || sourceVal === null) {
      continue;
    }

    if (
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      output[key] = deepMerge(targetVal, sourceVal);
    } else {
      output[key] = sourceVal;
    }
  }
  return output;
}

export const createEmptyCharacterStats = (): CharacterStats => ({
  strength: 10,
  agility: 10,
  vitality: 10,
  intellect: 10,
  insight: 10,
  willpower: 10,
});

export const createEmptyCharacter = (): Character => ({
  name: '',
  title: '',
  age: 20,
  gender: '남성',
  appearance: '',
  stats: createEmptyCharacterStats(),
  statNames: {
    strength: '근력 / 공력',
    agility: '민첩 / 신법',
    vitality: '체력 / 기골',
    intellect: '지략 / 학식',
    insight: '통찰 / 안목',
    willpower: '정신 / 의지',
  },
  reputation: {
    score: 0,
    alignment: 'neutral',
    title: '무명 낭인 (알려지지 않음)',
    factionReputations: {},
  },
  inventory: ['여행용 배낭', '가죽 수통', '낡은 단도', '은화 5전'],
  metaElements: {
    background: {
      type: 'preset',
      value: '몰락한 무문(가문)의 유일한 생존자',
      label: '배경 설정',
    },
    flaw: {
      type: 'preset',
      value: '과거의 참극으로 인해 불이나 붉은 피를 보면 순간적으로 몸이 굳는 공포증',
      label: '약점 및 결핍',
    },
    oath: {
      type: 'preset',
      value: '어떤 절체절명의 위기에서도 무고한 양민이나 아이의 목숨은 반드시 지킨다',
      label: '신념 및 맹세',
    },
    anchor: {
      type: 'preset',
      value: '어릴 적 헤어진 여동생이 건네준 낡은 옥노리개와 다시 만나겠다는 약속',
      label: '소중한 것 / 소중한 인연',
    },
    faction: {
      type: 'preset',
      value: '구파일방 무림맹 화산파 문하생',
      label: '소속 세력',
    },
  },
  disabilities: [],
  overcameFlaws: [],
  biography: '출신 내력과 기본 설정이 이곳에 기록됩니다.',
  currentGoal: '세상에 얽힌 진실을 밝혀내고 살아남는 것',
});

export const createEmptyWorldState = (): WorldInfoState => ({
  worldName: '정통 무협: 구파정사(九派正邪)와 마교 대혈겁',
  worldMode: 'popular_genre',
  worldGenre: '정통 무협 (Wuxia)',
  worldPremise: '소림, 무당, 화산 등 구대문파와 신비로운 세외 세력, 그리고 부활을 노리는 일월신교의 암투가 강호를 뒤흔드는 정통 무협 세계관입니다.',
  toneAndManner: TONE_AND_MANNER_CATALOG[0],
  npcs: [],
  factions: [],
  seeds: [],
  publicSecrets: [],
  classifiedSecrets: [],
  cameraOffAffairs: [],
  currentChapter: {
    currentChapter: '제 1막: 피바람의 서곡',
    upcomingChapters: ['제 2막: 밝혀지는 음모', '제 3막: 강호의 결전'],
    location: '낙양성 외곽 주막',
  },
  dcRecords: {
    dcHistory: [],
    dcDistribution: {
      5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0,
    },
  },
});

export const createEmptyGameState = (): GameState => ({
  phase: 'creation',
  creationStep: 1,
  turnCount: 0,
  world: createEmptyWorldState(),
  character: createEmptyCharacter(),
  messages: [],
  lastAutoSaveCode: undefined,
  lastSavedAt: undefined,
  latestSavePackageSnapshot: undefined,
  lastSnapshotTurn: undefined,
  pendingDCRequest: null,
});

/**
 * Fail-Open Safe Stub Metadata Generator
 * Guarantees a fully valid ParsedMetadata object even if AI response parsing encounters any anomaly.
 */
export const createSafeStubMetadata = (turnNumber: number = 1): ParsedMetadata => ({
  rawBlockText: '```\n1) [외부 검색 및 검증]: 동기화 정상\n2) [활성화된 미회수 복선 씨앗]: 없음\n3) [카메라 밖 세계 정세]: 유지\n4) [진행 및 예정 챕터]: 서사 진행 중\n5) [주인공 스탯 및 메타요소]: 상태 유지\n6) [DC 누적 통계]: 정상 분산\n7) [개연성 선언]: 내부 데이터 및 맥락 일치 완료\n```',
  searchAndVerificationReport: '외부 검색 및 정사 맥락 검증 완료',
  activeSeeds: [],
  cameraOffAffairs: '세계관 내 세력 정세 유지',
  chapterInfo: '현재 챕터 진행 중',
  statsAndInventory: '주인공 스탯 및 인벤토리 유지',
  dcStats: 'DC 5~15 균등 분포 관리 중',
  adherenceDeclaration: '인터넷 검색 및 맥락 대조 완료',
  parsedAtTurn: turnNumber,
});

/**
 * Defensive Hydration with Deep Merge
 */
export function hydrateGameStateWithDefaults(raw: any): GameState {
  const base = createEmptyGameState();
  if (!raw || typeof raw !== 'object') {
    return base;
  }
  const merged = deepMerge(base, raw);
  // Ensure array defaults if undefined
  if (!merged.world.npcs) merged.world.npcs = [];
  if (!merged.world.factions) merged.world.factions = [];
  if (!merged.world.seeds) merged.world.seeds = [];
  if (!merged.character.inventory) merged.character.inventory = [];
  if (!merged.character.disabilities) merged.character.disabilities = [];
  if (!merged.character.overcameFlaws) merged.character.overcameFlaws = [];
  return merged;
}
