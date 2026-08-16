import { CharacterStats, DiceRollResult } from '../types';

// Cryptographically Secure Pseudo-Random Number Generator (CSPRNG)
export const rollCryptoDie = (sides: number = 20): number => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return (array[0] % sides) + 1;
  }
  // Fallback if window is not available (e.g. unit testing)
  return Math.floor(Math.random() * sides) + 1;
};

// Roll 3d6 for character generation (range 3 - 18)
export const roll3d6 = (): number => {
  return rollCryptoDie(6) + rollCryptoDie(6) + rollCryptoDie(6);
};

export const generateAllStatsCSPRNG = (): CharacterStats => {
  return {
    strength: roll3d6(),
    agility: roll3d6(),
    vitality: roll3d6(),
    intellect: roll3d6(),
    insight: roll3d6(),
    willpower: roll3d6(),
  };
};

export const calculateModifier = (statValue: number): number => {
  return Math.floor((statValue - 10) / 2);
};

export const getOutcomeType = (
  rawRoll: number,
  diffWithDC: number
): {
  outcome: DiceRollResult['outcome'];
  description: string;
} => {
  if (rawRoll === 20) {
    return {
      outcome: 'miraculous_success',
      description: '✨ 기적적인 성공 (Natural 20): 주변 환경의 극적인 행운과 압도적인 서사적 성취가 주어집니다.',
    };
  }
  if (rawRoll === 1) {
    return {
      outcome: 'critical_failure',
      description: '💀 치명적 실패 (Natural 1): 보정치와 무관하게 즉각적인 위기와 혹독한 대가가 발생합니다.',
    };
  }

  if (diffWithDC >= 7) {
    return {
      outcome: 'major_success',
      description: '대성공 (목표 DC +7 이상): 손실이나 부작용 없이 목표를 완벽하게 완수합니다.',
    };
  }
  if (diffWithDC >= 4) {
    return {
      outcome: 'normal_success',
      description: '성공 (목표 DC +4 ~ +6): 안정적으로 행동에 성공합니다.',
    };
  }
  if (diffWithDC >= 0) {
    return {
      outcome: 'narrow_success',
      description: '아슬아슬한 성공 (목표 DC 0 ~ +3): 목표는 달성하나 경미한 피해나 소음 등 서사적 대가가 뒤따릅니다.',
    };
  }
  if (diffWithDC >= -3) {
    return {
      outcome: 'narrow_failure',
      description: '아슬아슬한 실패 (목표 DC -1 ~ -3): 행동은 실패하나 재도전의 기회나 탈출로가 주어집니다.',
    };
  }
  if (diffWithDC >= -6) {
    return {
      outcome: 'normal_failure',
      description: '실패 (목표 DC -4 ~ -6): 시도가 좌절되며 상황이 불리해집니다.',
    };
  }
  return {
    outcome: 'major_failure',
    description: '대실패 (목표 DC -7 이하): 큰 부상, 무기 손실 등 심각한 위기 상황에 직면합니다.',
  };
};

export const rollD20WithModifier = (
  modifier: number,
  targetDC: number = 10,
  statName: string = '능력'
): DiceRollResult => {
  const rawRoll = rollCryptoDie(20);
  const total = rawRoll + modifier;
  const diff = total - targetDC;
  const outcomeInfo = getOutcomeType(rawRoll, diff);

  return {
    sides: 20,
    rawRoll,
    modifier,
    total,
    targetDC,
    statName,
    outcome: outcomeInfo.outcome,
    description: outcomeInfo.description,
  };
};
