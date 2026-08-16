import { WorldInfoState, Character, ParsedMetadata, ChatMessage, GameState, CloudSessionPayload } from '../types';

/**
 * Constructs a comprehensive 6-Point Lossless Save Snapshot
 * based on Section 3, Rule 15 of the TRPG Engine Spec.
 */
export function buildSyntheticSaveSnapshot(
  world: WorldInfoState,
  character: Character,
  metadata: ParsedMetadata | undefined,
  turnCount: number,
  recentMessages: ChatMessage[]
): string {
  const dcDistStr = Object.entries(world.dcRecords.dcDistribution || {})
    .map(([dc, count]) => `DC${dc}:${count}회`)
    .join(', ') || '초기 상태';

  const npcsStr = (world.npcs || [])
    .map(
      (npc) =>
        `- ${npc.name} (${npc.title || '직함 미상'}): ${npc.npcClass || 'Class C'} / 심경: ${
          npc.impressionOnPlayer || '미인지 상태'
        } / 소속: ${npc.affiliation || '미상'} / 상태: ${npc.status || '생존'}`
    )
    .join('\n') || '- 등록된 주요 인물 없음';

  const seedsStr = (world.seeds || [])
    .map((s, i) => `${i + 1}) ${s.text}`)
    .join('\n') || '- 현재 활성화된 미회수 복선 없음';

  const recentPlot = recentMessages
    .filter((m) => m.role === 'assistant')
    .slice(-3)
    .map((m) => m.content.slice(0, 100).replace(/\n/g, ' '))
    .join(' -> ');

  return `[TRPG ENGINE 무손실 세이브 스냅샷 패키지 - Turn ${turnCount}]
A. [주인공 상태 및 스탯]:
- 이름/칭호: ${character.name} (${character.title || '주인공'}) / ${character.gender}, ${character.age}세
- 능력치: 근력(${character.stats.strength}), 민첩(${character.stats.agility}), 체력(${character.stats.vitality}), 지략(${character.stats.intellect}), 통찰(${character.stats.insight}), 의지(${character.stats.willpower})
- 평판/성향: ${character.reputation.title} (${character.reputation.score})
- 메타 요소: [배경: ${character.metaElements.background?.value || '미상'}, 결핍: ${character.metaElements.flaw?.value || '미상'}, 맹세: ${character.metaElements.oath?.value || '미상'}, 닻: ${character.metaElements.anchor?.value || '미상'}, 세력: ${character.metaElements.faction?.value || '무연고'}]
- 현재 소장품: ${character.inventory.join(', ') || '기본 장비'}
- 현재 목표: ${character.currentGoal || '생존 및 탐색'}

B. [원작 및 오리지널 인물(OC) 상태망]:
${npcsStr}

C. [현재 시점 정보 한계선]:
- [세간 공표 정보]: ${world.publicSecrets.join(', ') || '지역 내 일반적 소문'}
- [미공개 기밀 정보]: ${world.classifiedSecrets.join(', ') || '주요 세력 내부 기밀'}

D. [활성화된 미회수 복선 씨앗 및 카메라 밖 정세]:
${seedsStr}
- 카메라 밖 정세: ${metadata?.cameraOffAffairs || '각 세력 물밑 이동 중'}

E. [DC 누적 통계 계승]:
- 5~15 DC 누적 분포: [${dcDistStr}]

F. [서사 진행 줄거리 및 챕터]:
- 현 챕터: ${metadata?.chapterInfo || world.currentChapter.currentChapter || '제 1막'}
- 최근 핵심 줄거리: ${recentPlot || '모험의 서막 진행 중'}`;
}

export function exportSessionToPackageJson(gameState: GameState, syncCode: string): string {
  const payload: CloudSessionPayload = {
    version: 'TRPG_ENGINE_SESSION_V1',
    syncCode,
    savedAt: Date.now(),
    gameState,
  };
  return JSON.stringify(payload, null, 2);
}

export function importSessionFromPackageJson(jsonString: string): GameState | null {
  try {
    const payload: CloudSessionPayload = JSON.parse(jsonString);
    if (payload && payload.version === 'TRPG_ENGINE_SESSION_V1' && payload.gameState) {
      return payload.gameState;
    }
    return null;
  } catch {
    return null;
  }
}
