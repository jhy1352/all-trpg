export const KO = {
  appTitle: 'TRPG Engine & Web Player',
  subtitle: '고품격 서사 TRPG 엔진 및 마스터 GM 시스템',
  
  // Navigation & Actions
  nav: {
    worldInfo: '세계관 정보 및 인물록',
    characterSheet: '주인공 시트',
    diceRoller: '주사위 투척 (D20)',
    cloudSync: '세이브 / 동기화 / 초기화',
    autoSaveNotice: '자동 세이브',
    turn: '턴',
    newGame: '새 캠페인 시작',
    volume: '배경음/효과음 조절',
  },

  // Phase 1: World Establishment
  phase1: {
    title: 'Phase 1: 세계관 확립 및 검증',
    desc: '모험의 무대가 될 세계관을 선택하거나 직접 구축하세요.',
    modeOriginalIp: '기존 원작 IP (정사 보존 & 외부 고증)',
    modePopularGenre: '인기 장르 프리셋 (정통 무협, 판타지, 사이버펑크 등)',
    modeCustom: '오리지널 세계관 창작 (자율 설정 & 지능형 정제)',
    ipNamePlaceholder: '원작 제목 입력 (예: 반지의 제왕, 삼국지, 해리 포터, 김용 사조영웅전 등)',
    customNamePlaceholder: '세계관 명칭 입력 (예: 기계 녹슨 한양 연대기)',
    genrePlaceholder: '장르/시대적 배경 (예: 다크 판타지, 무협, 사이버펑크)',
    premisePlaceholder: '세계관의 역사, 대립 구도, 핵심 법칙 및 사건 배경을 자유롭게 작성하세요...',
    confirmWorld: '세계관 확인 및 메타요소 단계로 이동',
    validateBtn: '세계관 설정 정리 및 확인',
  },

  // Phase 2: Meta Elements
  phase2: {
    title: 'Phase 2: 핵심 설정(Meta-Elements) 구성',
    desc: '캐릭터의 운명과 성장을 이끌어갈 5가지 핵심 설정을 정의합니다.',
    tabulaRasaWarningTitle: '⚠️ [무연고 / 백지상태 선택 안내]',
    tabulaRasaWarningText: '출신 배경을 무연고/기억상실로 시작할 경우, 세상의 모든 인물은 당신을 전혀 알지 못하는 [미인지 상태]로 시작합니다. 미지의 요람에서 깨어난 정체불명의 서사 촉매로 시작합니다.',
    optPreset: 'AI 프리셋 선택',
    optCustom: '직접 서술 (자유 작성)',
    optTabulaRasa: '무연고 / 백지상태',
    customPlaceholder: '직접 서술할 핵심 서사 훅을 입력하세요...',
    confirmMeta: '설정 확정 및 스탯 생성 단계로 이동',
    categories: {
      background: '1. 출신 및 배경',
      flaw: '2. 약점 및 결핍',
      oath: '3. 신념 및 맹세',
      anchor: '4. 소중한 것 / 소중한 인연',
      faction: '5. 소속 세력',
    },
  },

  // Phase 3: Character Sheet
  phase3: {
    title: 'Phase 3: 캐릭터 시트 및 능력치 확정',
    desc: '암호학적 난수(CSPRNG)로 6대 능력치를 투척하고 캐릭터를 완성합니다.',
    charName: '이름 / 성명',
    charTitle: '이칭 / 직함 / 호칭',
    charAge: '연령 / 나이',
    charGender: '성별',
    charAppearance: '외모 및 첫인상',
    statsRoll: '능력치 주사위 일괄 투척 (3d6 CSPRNG)',
    statsDesc: '세계관에 최적화된 6대 내적 능력치로 결정됩니다.',
    biography: '출신 내력 및 기본 설정',
    goal: '현재 추구하는 최종 목표',
    startGame: 'TRPG 서사 세션 시작',
  },

  // Stats
  stats: {
    strength: '근력 / 공력',
    agility: '민첩 / 신법',
    vitality: '체력 / 기골',
    intellect: '지략 / 학식',
    insight: '통찰 / 안목',
    willpower: '정신 / 의지',
  },

  // Dice & Checks
  dice: {
    title: '공정하고 엄격한 D20 주사위 판정',
    rollD20: 'D20 주사위 굴리기',
    targetDC: '목표 난이도 (DC)',
    rawRoll: '순수 주사위 눈금',
    modifier: '스탯 보정치',
    total: '최종 합계',
    critSuccess: '기적적인 성공 (Natural 20)',
    critFailure: '치명적 실패 (Natural 1)',
    majorSuccess: '대성공 (+7 이상)',
    normalSuccess: '성공 (+4 ~ +6)',
    narrowSuccess: '아슬아슬한 성공 (0 ~ +3)',
    narrowFailure: '아슬아슬한 실패 (-1 ~ -3)',
    normalFailure: '실패 (-4 ~ -6)',
    majorFailure: '대실패 (-7 이하)',
  },

  // Save / Load
  sync: {
    title: '세이브 / 클라우드 동기화 / 초기화',
    desc: 'PC/모바일 어디서든 6자리 코드로 세션을 그대로 이어하거나 초기화할 수 있습니다.',
    yourCode: '현재 발급된 6자리 동기화 코드',
    loadCodePlaceholder: '6자리 코드 입력 (예: X9K2A7)',
    saveBtn: '지금 클라우드에 세이브하기',
    loadBtn: '코드로 세션 불러오기',
    exportJson: '세이브 패키지 JSON 복사',
    importJson: 'JSON 텍스트로 복원',
    autoSaveInfo: '※ 15턴마다 자동으로 세이브 코드가 발급되며 채팅창에 [세이브 코드: XXXXXX] 형태로 기록됩니다.',
    resetGame: '새 캠페인 시작 (현재 세션 초기화)',
    resetConfirmTitle: '정말로 처음부터 새로 시작하시겠습니까?',
    resetConfirmDesc: '현재 진행 중인 모든 서사 기록과 캐릭터 정보가 초기화되고 세계관 선택 화면으로 돌아갑니다.',
  },

  // Metadata block
  metaAccordion: {
    title: '시스템 동기화 리포트 & 게임 엔진 메타데이터 (14번 블록)',
    copyBtn: '원클릭 메타데이터 복사',
    copied: '복사 완료!',
  },
};
