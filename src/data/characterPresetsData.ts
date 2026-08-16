import { WorldInfoState } from '../types';

export interface CharacterPresetItem {
  name: string;
  title: string;
  age: number;
  gender: string;
  appearance: string;
  goal: string;
}

export const WORLD_CHARACTER_POOLS: Record<string, CharacterPresetItem[]> = {
  // 무협
  wuxia: [
    {
      name: '이천우',
      title: '초출강호 검객',
      age: 20,
      gender: '남성',
      appearance: '흑포를 걸치고 낡은 청강검을 허리에 찬 서늘한 눈빛의 청년',
      goal: '멸문당한 가문의 진실을 밝히고 잃어버린 가전 비급을 되찾는 것',
    },
    {
      name: '연소하',
      title: '비연소선 (낭인)',
      age: 22,
      gender: '여성',
      appearance: '비단 수건으로 땋은 머리와 예리한 쌍단도를 지닌 기민한 풍모',
      goal: '강호의 부조리한 혈겁에 희생당한 사부의 원수를 갚는 것',
    },
    {
      name: '장무극',
      title: '파계 권승',
      age: 25,
      gender: '남성',
      appearance: '단단한 기골에 굵은 염주를 목에 건 묵직하고 과묵한 장한',
      goal: '살생의 업보를 짊어지고 위국위민의 참된 협을 실천하는 것',
    },
    {
      name: '백서린',
      title: '소요유 도객',
      age: 23,
      gender: '남성',
      appearance: '백의를 입고 술병을 든 채 세상만사를 관조하는 듯한 눈빛',
      goal: '천하를 주유하며 자신만의 궁극의 도법을 완성하는 것',
    },
    {
      name: '단목영',
      title: '비영살수 (개심한 살수)',
      age: 21,
      gender: '여성',
      appearance: '칠흑 같은 암살복에 비침을 숨긴 그림자 같은 자태',
      goal: '암살 조직의 굴레를 끊어내고 햇빛 아래서 평범한 인간으로 살아가는 것',
    },
  ],
  // 정통 판타지
  fantasy: [
    {
      name: '발레리안 폰 발트',
      title: '몰락 기사단의 후예',
      age: 24,
      gender: '남성',
      appearance: '흠집 난 은빛 판금 갑옷과 푸른 눈동자를 지닌 헌신적인 기사',
      goal: '무너진 성기사단의 명예를 회복하고 영지의 백성들을 수호하는 것',
    },
    {
      name: '엘리시아 윈드스톰',
      title: '방랑 마도학자',
      age: 21,
      gender: '여성',
      appearance: '룬 문자가 새겨진 짙은 로브와 마도 지팡이를 든 신비로운 학구파',
      goal: '고대 마법 제국의 붕괴 원인이 담긴 유실된 금서를 회수하는 것',
    },
    {
      name: '바란 섀도우워커',
      title: '황야의 척후병',
      age: 26,
      gender: '남성',
      appearance: '가죽 방어구와 긴 활을 메고 짐승의 흉터를 지닌 날렵한 사냥꾼',
      goal: '대륙 남부를 잠식하는 마물의 준동을 막고 부족을 지켜내는 것',
    },
    {
      name: '로웬 실버베일',
      title: '은밀한 정보상',
      age: 23,
      gender: '여성',
      appearance: '그림자 속에 숨어든 듯한 잿빛 망토와 예리한 비수를 숨긴 첩보원',
      goal: '왕국의 왕좌 뒤에 숨은 부패한 흑막의 음모를 폭로하는 것',
    },
    {
      name: '토르발 아이언하트',
      title: '대장장이 룬 전사',
      age: 35,
      gender: '남성',
      appearance: '거대한 강철 모루 문양의 방패와 전투망치를 든 단단한 드워프/용병',
      goal: '선조의 성채를 함락시킨 고대 드래곤의 약점을 파헤치는 것',
    },
  ],
  // SF / 사이버펑크 / 스페이스 오페라
  scifi: [
    {
      name: '카일 V-09',
      title: '프리랜서 용병 해커',
      age: 27,
      gender: '남성',
      appearance: '사이버네틱 의안과 네온 문신이 깜빡이는 가죽 재킷의 러너',
      goal: '거대 메가코프가 은폐한 인공지능 자아 각성 프로젝트의 기밀을 빼내는 것',
    },
    {
      name: '신시아 레이',
      title: '크롬 스트리트 닥터',
      age: 25,
      gender: '여성',
      appearance: '정밀 나노 수술용 기계 의수를 장착한 냉철한 언더그라운드 의사',
      goal: '슬럼가에 유포된 불법 사이버웨어 바이러스의 치료제를 배포하는 것',
    },
    {
      name: '잭슨 "아크" 콜',
      title: '중화기 특수요원',
      age: 29,
      gender: '남성',
      appearance: '중갑 방탄 조끼와 전자 펄스 라이플을 메고 턱에 흉터가 있는 거한',
      goal: '자신을 배신하고 버린 특수작전 사령부에 대가를 치르게 하는 것',
    },
    {
      name: '미라 첸',
      title: '심우주 탐사정 파일럿',
      age: 24,
      gender: '여성',
      appearance: '경량 우주 비행복과 홀로그램 헤드셋을 착용한 기민한 조종사',
      goal: '성간 항로에서 실종된 부모님의 탐사선 잔해와 블랙박스를 회수하는 것',
    },
    {
      name: '에이든 제로',
      title: '안드로이드 방랑자',
      age: 5,
      gender: '기타',
      appearance: '합금 골격 위에 인공 피부 코팅을 두른 정밀형 의체 소유자',
      goal: '자신에게 탑재된 미지의 자아 알고리즘을 설계한 창조자를 찾는 것',
    },
  ],
  // 다크 판타지 / 아포칼립스 / 크툴루 호러 / 생존
  dark: [
    {
      name: '카엘',
      title: '저주받은 낙인의 망자',
      age: 28,
      gender: '남성',
      appearance: '피와 잿더미로 물든 누더기 망토와 부서진 대검을 짊어진 생존자',
      goal: '영혼을 갉아먹는 피의 저주를 풀고 멸망한 세계의 안식을 찾는 것',
    },
    {
      name: '헬레나',
      title: '심연의 마녀',
      age: 24,
      gender: '여성',
      appearance: '붕대로 감은 손과 어둠의 등불을 든 침울하고 창백한 여인',
      goal: '재앙 속에서 사라진 여동생의 유골과 기억을 회수하는 것',
    },
    {
      name: '모르간',
      title: '이단 심문관',
      age: 32,
      gender: '남성',
      appearance: '차가운 가면과 은도금 철퇴를 든 광신적인 정화자',
      goal: '오염된 성역을 불태우고 인간성을 위협하는 악마적 존재를 멸절하는 것',
    },
    {
      name: '아서 펜들턴 박사',
      title: '광기의 오컬트 고고학자',
      age: 38,
      gender: '남성',
      appearance: '트렌치코트와 돋보기를 들고 이계의 속삭임에 불면증을 겪는 지식인',
      goal: '심해의 유적에서 인류 문명을 멸망시킬 금기의 서판을 파괴하는 것',
    },
  ],
  // 서브컬처 / JRPG / 현대 학원 / 이능력 / 성배전쟁
  janime: [
    {
      name: '시이나 렌',
      title: '각성한 이능력자',
      age: 18,
      gender: '남성',
      appearance: '교복 위에 가디건을 걸치고 날카롭고 결의에 찬 눈빛의 소년',
      goal: '도시를 위협하는 괴이와 침략자로부터 소중한 일상과 친구들을 지키는 것',
    },
    {
      name: '아스카 세이라',
      title: '명문 퇴마사 후계자',
      age: 17,
      gender: '여성',
      appearance: '영력이 감도는 부적과 영도를 든 단정한 제복 차림의 소녀',
      goal: '가문에 내려오는 금지된 저주를 봉인하고 진정한 자유를 얻는 것',
    },
    {
      name: '키리시마 하루토',
      title: '전이된 방랑자',
      age: 19,
      gender: '남성',
      appearance: '이세계의 가죽 갑옷과 현실의 후드티를 조합해 입은 모험가',
      goal: '미궁의 심층을 돌파하여 원래 세상으로 돌아가는 포털을 여는 것',
    },
    {
      name: '아마미야 쿠로코',
      title: '괴도 마술사',
      age: 18,
      gender: '여성',
      appearance: '세련된 정장 망토와 실크햇을 쓰고 도회적인 미소를 띤 소녀',
      goal: '부패한 권력자들의 일그러진 마음의 핵을 훔쳐 세상의 부조리를 바로잡는 것',
    },
  ],
};

export function getRandomCharacterPresetForWorld(world: WorldInfoState): CharacterPresetItem {
  const genre = (world.worldGenre || '').toLowerCase();
  const name = (world.worldName || '').toLowerCase();
  const premise = (world.worldPremise || '').toLowerCase();

  let poolKey = 'fantasy';

  if (
    genre.includes('무협') ||
    name.includes('무협') ||
    premise.includes('강호') ||
    premise.includes('문파') ||
    premise.includes('내공') ||
    premise.includes('검객') ||
    premise.includes('혈겁')
  ) {
    poolKey = 'wuxia';
  } else if (
    genre.includes('sf') ||
    genre.includes('사이버') ||
    genre.includes('스페이스') ||
    genre.includes('우주') ||
    name.includes('스페이스') ||
    name.includes('사이버') ||
    name.includes('목성') ||
    name.includes('궤도') ||
    premise.includes('우주') ||
    premise.includes('해커') ||
    premise.includes('인공지능') ||
    premise.includes('궤도') ||
    premise.includes('함선')
  ) {
    poolKey = 'scifi';
  } else if (
    genre.includes('다크') ||
    genre.includes('아포') ||
    genre.includes('호러') ||
    genre.includes('크툴루') ||
    genre.includes('생존') ||
    name.includes('다크') ||
    name.includes('심연') ||
    premise.includes('생존') ||
    premise.includes('저주') ||
    premise.includes('멸망') ||
    premise.includes('오염')
  ) {
    poolKey = 'dark';
  } else if (
    genre.includes('애니') ||
    genre.includes('학원') ||
    genre.includes('이능') ||
    genre.includes('jrpg') ||
    genre.includes('서브컬처') ||
    name.includes('도쿄') ||
    name.includes('이세계') ||
    premise.includes('이세계') ||
    premise.includes('퇴마') ||
    premise.includes('헌터') ||
    premise.includes('페르소나')
  ) {
    poolKey = 'janime';
  }

  const pool = WORLD_CHARACTER_POOLS[poolKey] || WORLD_CHARACTER_POOLS.fantasy;

  // Use CSPRNG for random selection
  const randArr = new Uint32Array(1);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randArr);
  } else {
    randArr[0] = Math.floor(Math.random() * 1000000);
  }

  const idx = randArr[0] % pool.length;
  return pool[idx];
}
