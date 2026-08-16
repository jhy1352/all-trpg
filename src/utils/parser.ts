import { Character, ParsedMetadata, PendingDCRequest, NPC, NPCClass } from '../types';
import { createSafeStubMetadata } from './factory';

export interface ParseResult {
  cleanNarrative: string;
  metadata?: ParsedMetadata;
  extractedSeeds?: string[];
  extractedNPCs?: Partial<NPC>[];
  detectedDC?: PendingDCRequest;
  updatedCharacterUpdates?: Partial<Character>;
  savePackage?: string;
  isFailOpenFallback?: boolean;
}

/**
 * AI GM Response Parser & Live UI State Synchronizer
 * Strips metadata code blocks from narrative prose and synchronizes game state in real time.
 * Implements a bulletproof Fail-Open Stub policy to ensure zero crashes or UI deadlocks.
 */
export function parseGMResponseMetaData(
  rawResponse: string,
  prevMetadata?: ParsedMetadata,
  currentCharacter?: Character
): ParseResult {
  if (!rawResponse || typeof rawResponse !== 'string') {
    return {
      cleanNarrative: '',
      metadata: prevMetadata || createSafeStubMetadata(1),
      isFailOpenFallback: true,
    };
  }

  let cleanNarrative = rawResponse;
  let metadata: ParsedMetadata | undefined;
  let savePackage: string | undefined;

  // 1. Extract 15th Save Package Markdown Code Block (if present)
  const savePackageRegex = /```(?:markdown|json|text)?\s*([\s\S]*?\[세이브 및 새 세션 전환 알림\][\s\S]*?)```/i;
  const saveMatch = rawResponse.match(savePackageRegex);
  if (saveMatch) {
    savePackage = saveMatch[1].trim();
    cleanNarrative = cleanNarrative.replace(saveMatch[0], '').trim();
  } else {
    // Secondary check for [종합 세이브 데이터 패키지] or [핵심 계승 6대 요소]
    const altSaveRegex = /```(?:markdown|json|text)?\s*([\s\S]*?(?:무손실 세이브|종합 세이브 데이터|핵심 계승 필수)[\s\S]*?)```/i;
    const altSaveMatch = rawResponse.match(altSaveRegex);
    if (altSaveMatch) {
      savePackage = altSaveMatch[1].trim();
      cleanNarrative = cleanNarrative.replace(altSaveMatch[0], '').trim();
    }
  }

  // 2. Extract 14th Mandatory Metadata Markdown Code Block
  // Supports: ``` ... 1) ... 7) ... ```
  const metaBlockRegex = /```(?:markdown|json|text)?\s*([\s\S]*?(?:1\)\s*\[외부 검색|1\.\s*\[외부 검색|외부 검색, UI 코드 반영)[\s\S]*?)```/i;
  const metaMatch = cleanNarrative.match(metaBlockRegex);

  let rawBlockText = '';

  if (metaMatch) {
    rawBlockText = metaMatch[1].trim();
    cleanNarrative = cleanNarrative.replace(metaMatch[0], '').trim();
    metadata = parseMetadataFromBlockText(rawBlockText);
  } else {
    // Secondary fallback: Look for unblocked 1) ... 7) at the start or end of text
    const inlineMetaRegex = /((?:1\)\s*\[외부 검색|1\.\s*\[외부 검색)[\s\S]*?(?:7\)\s*\[개연성|7\.\s*\[개연성)[^\n]*)/i;
    const inlineMatch = cleanNarrative.match(inlineMetaRegex);
    if (inlineMatch) {
      rawBlockText = inlineMatch[1].trim();
      cleanNarrative = cleanNarrative.replace(inlineMatch[0], '').trim();
      metadata = parseMetadataFromBlockText(rawBlockText);
    } else {
      // Third fallback: If parsing fails, inject Fail-Open Safe Stub
      metadata = prevMetadata || createSafeStubMetadata(1);
    }
  }

  // Clean narrative from remaining orphan tags
  cleanNarrative = cleanNarrative
    .replace(/^```(?:markdown|json|text)?\s*/g, '')
    .replace(/```\s*$/g, '')
    .trim();

  // 3. Extract Active Seeds from 2) [활성화된 미회수 복선 씨앗]
  const extractedSeeds: string[] = [];
  if (metadata?.activeSeeds && metadata.activeSeeds.length > 0) {
    extractedSeeds.push(...metadata.activeSeeds);
  }

  // 4. Extract Dynamic Character & Meta Updates from 5)
  const updatedCharacterUpdates = extractCharacterUpdates(
    metadata?.statsAndInventory || '',
    currentCharacter
  );

  // 5. Detect DC / Skill Check Requests in narrative text
  const detectedDC = detectDCInText(cleanNarrative);

  return {
    cleanNarrative,
    metadata,
    extractedSeeds,
    detectedDC,
    updatedCharacterUpdates,
    savePackage,
    isFailOpenFallback: !metaMatch,
  };
}

/**
 * Parses individual 1~7 lines from the extracted metadata block text
 */
function parseMetadataFromBlockText(blockText: string): ParsedMetadata {
  const lines = blockText.split('\n').map((l) => l.trim()).filter(Boolean);

  let searchAndVerificationReport = '이상 없음 (실시간 검증 완료)';
  const activeSeeds: string[] = [];
  let cameraOffAffairs = '카메라 밖 세계 정세 유지';
  let chapterInfo = '서사 진행 중';
  let statsAndInventory = '스탯 및 소장품 상태 유지';
  let dcStats = 'DC 5~15 균등 분포 관리 중';
  let adherenceDeclaration = '정사 및 맥락 일치 확인 완료';

  for (const line of lines) {
    if (/^1[\.\)]\s*\[외부 검색/i.test(line) || line.includes('외부 검색')) {
      searchAndVerificationReport = cleanLineHeader(line);
    } else if (/^2[\.\)]\s*\[활성화된 미회수 복선/i.test(line) || line.includes('복선 씨앗')) {
      const seedContent = cleanLineHeader(line);
      if (seedContent && !seedContent.includes('없음') && !seedContent.includes('미상')) {
        const parts = seedContent.split(/[,/、]/).map((s) => s.trim()).filter(Boolean);
        activeSeeds.push(...parts);
      }
    } else if (/^3[\.\)]\s*\[카메라 밖/i.test(line) || line.includes('카메라 밖')) {
      cameraOffAffairs = cleanLineHeader(line);
    } else if (/^4[\.\)]\s*\[진행 및 예정 챕터/i.test(line) || line.includes('챕터 현황')) {
      chapterInfo = cleanLineHeader(line);
    } else if (/^5[\.\)]\s*\[주인공 스탯/i.test(line) || line.includes('5대 메타요소')) {
      statsAndInventory = cleanLineHeader(line);
    } else if (/^6[\.\)]\s*\[DC 누적/i.test(line) || line.includes('DC 누적')) {
      dcStats = cleanLineHeader(line);
    } else if (/^7[\.\)]\s*\[개연성/i.test(line) || line.includes('개연성/맥락')) {
      adherenceDeclaration = cleanLineHeader(line);
    }
  }

  return {
    rawBlockText: blockText,
    searchAndVerificationReport,
    activeSeeds,
    cameraOffAffairs,
    chapterInfo,
    statsAndInventory,
    dcStats,
    adherenceDeclaration,
    parsedAtTurn: Date.now(),
  };
}

function cleanLineHeader(line: string): string {
  return line
    .replace(/^[\d]+[\.\)]\s*\[[^\]]+\]\s*[:：]?\s*/, '')
    .replace(/^\[[^\]]+\]\s*[:：]?\s*/, '')
    .trim();
}

/**
 * Extracts live character mutations (inventory, goal, disabilities, meta elements) from 5th line
 */
function extractCharacterUpdates(
  statsText: string,
  currentChar?: Character
): Partial<Character> | undefined {
  if (!statsText) return undefined;

  const updates: Partial<Character> = {};

  // Extract items/inventory
  const invMatch = statsText.match(/(?:소장품|아이템|인벤토리)\s*[:：]?\s*([^\n;]+)/i);
  if (invMatch && invMatch[1]) {
    const rawItems = invMatch[1]
      .split(/[,/、]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.includes('유지') && !s.includes('동일'));
    if (rawItems.length > 0) {
      updates.inventory = rawItems;
    }
  }

  // Extract goal change
  const goalMatch = statsText.match(/목표\s*[:：]?\s*([^\n;]+)/i);
  if (goalMatch && goalMatch[1] && goalMatch[1].length > 3 && !goalMatch[1].includes('유지')) {
    updates.currentGoal = goalMatch[1].trim();
  }

  // Extract physical disabilities / permanent impairment (Constitution 3 & 9)
  const disabilityMatch = statsText.match(/(?:신체\s*결핍|기능\s*결손|영구\s*장애|결핍\s*등록)\s*[:：]?\s*([^\n;\]]+)/i);
  if (disabilityMatch && disabilityMatch[1]) {
    const disabilityText = disabilityMatch[1].trim();
    if (disabilityText && !disabilityText.includes('없음') && !disabilityText.includes('유지')) {
      const existing = currentChar?.disabilities || [];
      if (!existing.includes(disabilityText)) {
        updates.disabilities = [...existing, disabilityText];
      }
    }
  }

  // Extract overcome flaws
  const overcomeMatch = statsText.match(/\[?결핍\s*[:：]?\s*([^\]]+?)\s*->\s*(?:극복\s*완료|해소)\]?/i);
  if (overcomeMatch && overcomeMatch[1]) {
    const overcameItem = overcomeMatch[1].trim();
    const existingOvercame = currentChar?.overcameFlaws || [];
    if (!existingOvercame.includes(overcameItem)) {
      updates.overcameFlaws = [...existingOvercame, overcameItem];
    }
  }

  return Object.keys(updates).length > 0 ? updates : undefined;
}

/**
 * Detects DC check requests in GM narrative text
 */
export function detectDCInText(text: string): PendingDCRequest | undefined {
  if (!text) return undefined;

  // Patterns: [판정 요구: 민첩 DC 12 - 행동], [목표 DC 14 (근력)], DC 11 판정 등
  const dcRegex = /\[?(?:목표\s*DC|판정\s*요구|DC|난이도)\s*[:：]?\s*([가-힣a-zA-Z\s]*?)?\s*DC?\s*(\d{1,2})\s*([가-힣a-zA-Z0-9\s\-_\(\)]*?)\]?/i;
  const match = text.match(dcRegex);

  if (match) {
    const rawDC = parseInt(match[2], 10);
    if (!isNaN(rawDC) && rawDC >= 3 && rawDC <= 30) {
      let stat = '능력치';
      const textBefore = (match[1] || '').trim();
      const textAfter = (match[3] || '').trim();

      if (textBefore.includes('근력') || textAfter.includes('근력') || textBefore.includes('공력') || textAfter.includes('공력')) stat = '근력 / 공력';
      else if (textBefore.includes('민첩') || textAfter.includes('민첩') || textBefore.includes('신법') || textAfter.includes('신법')) stat = '민첩 / 신법';
      else if (textBefore.includes('체력') || textAfter.includes('체력') || textBefore.includes('기골') || textAfter.includes('기골')) stat = '체력 / 기골';
      else if (textBefore.includes('지략') || textAfter.includes('지략') || textBefore.includes('학식') || textAfter.includes('학식') || textBefore.includes('지능') || textAfter.includes('지능')) stat = '지략 / 학식';
      else if (textBefore.includes('통찰') || textAfter.includes('통찰') || textBefore.includes('안목') || textAfter.includes('안목') || textBefore.includes('관찰') || textAfter.includes('관찰')) stat = '통찰 / 안목';
      else if (textBefore.includes('정신') || textAfter.includes('정신') || textBefore.includes('의지') || textAfter.includes('의지') || textBefore.includes('심상') || textAfter.includes('심상')) stat = '정신 / 의지';

      // Check if text has numbered choices (1. , 2. , or [1], [2])
      const hasNumberedChoices = /(?:1\s*[\.\)]|\[1\]|1번)[\s\S]*?(?:2\s*[\.\)]|\[2\]|2번)/.test(text);

      return {
        dc: rawDC,
        stat,
        actionDescription: textAfter || textBefore || '행동 판정',
        requiresChoice: hasNumberedChoices,
      };
    }
  }
  return undefined;
}
