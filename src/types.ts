export type WorldMode = 'original_ip' | 'popular_genre' | 'custom';

export type GenreCategory = 'all' | 'janime_jrpg' | 'classic_fantasy' | 'scifi_cyber' | 'mystery_horror';

export interface ToneAndManner {
  id: string;
  name: string;
  category: 'classic_literary' | 'dark_hardboiled' | 'mystery_horror' | 'adventure_special' | 'custom';
  categoryLabel: string;
  badgeColor?: string;
  previewQuote: string;
  description: string;
  directive: string;
}

export interface GenrePreset {
  id: string;
  category: 'janime_jrpg' | 'classic_fantasy' | 'scifi_cyber' | 'mystery_horror';
  name: string;
  period: string;
  premise: string;
  recommendedToneId: string;
  tags: string[];
}

export type MetaInputType = 'preset' | 'custom' | 'tabula_rasa';

export interface MetaItem {
  type: MetaInputType;
  value: string;
  label?: string;
  isTabulaRasa?: boolean;
}

export interface MetaElements {
  background: MetaItem;
  flaw: MetaItem;
  oath: MetaItem;
  anchor: MetaItem;
  faction: MetaItem;
}

export interface CharacterStats {
  strength: number;     // 근력 / 공력
  agility: number;      // 민첩 / 신법
  vitality: number;     // 체력 / 기골
  intellect: number;    // 지략 / 학식
  insight: number;      // 통찰 / 안목
  willpower: number;    // 정신 / 의지
}

export interface ReputationState {
  score: number;
  alignment: 'good' | 'neutral' | 'evil';
  title: string;
  factionReputations?: Record<string, number>;
}

export interface Character {
  name: string;
  title: string;
  age: number | string;
  gender: string;
  appearance: string;
  stats: CharacterStats;
  statNames?: {
    strength: string;
    agility: string;
    vitality: string;
    intellect: string;
    insight: string;
    willpower: string;
  };
  reputation: ReputationState;
  inventory: string[];
  metaElements: MetaElements;
  disabilities?: string[];      // 후천적 신체 결손 및 제약
  overcameFlaws?: string[];     // 극복된 결핍 및 트라우마
  biography: string;
  currentGoal: string;
}

export type NPCClass = 'Class A' | 'Class B' | 'Class C' | 'Unassigned';

export interface NPC {
  id: string;
  name: string;
  title: string;
  age?: string;
  npcClass: NPCClass;
  isOriginalChar?: boolean;
  affiliation: string;
  personality: string;
  impressionOnPlayer: string;
  relationshipStatus?: 'hostile' | 'wary' | 'neutral' | 'friendly' | 'ally' | 'affection';
  isEncountered: boolean;
  status: string;
  notes?: string;
}

export interface Faction {
  name: string;
  alignment: string;
  influence: string;
  attitudeToPlayer: string;
  reputationScore?: number;
  currentStatus: string;
}

export interface NarrativeSeed {
  id: string;
  text: string;
  status: 'active' | 'resolved';
}

export interface ChapterInfo {
  currentChapter: string;
  upcomingChapters: string[];
  location: string;
}

export interface DCStatRecord {
  dcHistory: number[];
  dcDistribution: Record<number, number>;
  lastRequestedDC?: number;
  lastDCReason?: string;
}

export interface ParsedMetadata {
  rawBlockText: string;
  searchAndVerificationReport: string;
  activeSeeds: string[];
  cameraOffAffairs: string;
  chapterInfo: string;
  statsAndInventory: string;
  dcStats: string;
  adherenceDeclaration: string;
  parsedAtTurn: number;
}

export interface DiceRollResult {
  sides: number;
  rawRoll: number;
  modifier: number;
  total: number;
  targetDC?: number;
  statName?: string;
  outcome: 'critical_failure' | 'narrow_failure' | 'normal_failure' | 'major_failure' | 'narrow_success' | 'normal_success' | 'major_success' | 'miraculous_success';
  description: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  rawContent?: string;
  metadata?: ParsedMetadata;
  turnNumber: number;
  timestamp: number;
  isDiceRollTurn?: boolean;
  diceRollResult?: DiceRollResult;
  autoSaveCode?: string;
  isSavePackageBlock?: boolean;
  savePackageContent?: string;
  isMetaQuery?: boolean;
}

export interface WorldInfoState {
  worldName: string;
  worldMode: WorldMode;
  worldGenre: string;
  worldPremise: string;
  toneAndManner?: ToneAndManner;
  npcs: NPC[];
  factions: Faction[];
  seeds: NarrativeSeed[];
  publicSecrets: string[];
  classifiedSecrets: string[];
  cameraOffAffairs: string[];
  currentChapter: ChapterInfo;
  dcRecords: DCStatRecord;
}

export interface PendingDCRequest {
  dc: number;
  stat: string;
  actionDescription: string;
  requiresChoice?: boolean;
  suggestedChoices?: string[];
}

export interface GameState {
  phase: 'creation' | 'playing';
  creationStep: 1 | 2 | 3;
  turnCount: number;
  world: WorldInfoState;
  character: Character;
  messages: ChatMessage[];
  lastAutoSaveCode?: string;
  lastSavedAt?: number;
  latestSavePackageSnapshot?: string;
  lastSnapshotTurn?: number;
  pendingDCRequest?: PendingDCRequest | null;
}

export interface CloudSessionPayload {
  version: 'TRPG_ENGINE_SESSION_V1';
  syncCode: string;
  savedAt: number;
  gameState: GameState;
}

export interface WorldVerificationResult {
  valid: boolean;
  recognizedTitle: string;
  summary: string;
  keyFactions: string;
  settingEra: string;
  suggestions?: string[];
  isMinorOrUnknown?: boolean;
}

export interface MetaRefinementResult {
  refinedValue: string;
  appliedField: string;
  summary: string;
}
