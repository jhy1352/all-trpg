import { ToneAndManner, GenrePreset, GenreCategory } from '../types';

export const TONE_AND_MANNER_CATALOG: ToneAndManner[] = [
  // 1. Classic & Literary
  {
    id: 'classic_literary',
    name: '대문호의 정통 고전 문학체',
    category: 'classic_literary',
    categoryLabel: '🏛️ 정통 문학 & 서사',
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-950/30',
    previewQuote: '“바람은 마른 억새를 흔들고, 칼끝에 맺힌 새벽이슬은 서늘한 핏빛을 머금은 채 대지를 적셨다.”',
    description: '풍류와 깊이 있는 은유, 김용·톨킨 풍의 품격 높고 묵직한 호흡을 가진 정통 소설 문체.',
    directive: '문학 거장(김용, 톨킨)의 품격 높은 정통 고전 문학체. 계절감과 주변 풍광, 인물의 미세한 호흡과 눈빛을 깊이 있는 어휘와 우아한 은유로 서술하라. 경박한 수식을 배제하고 무게감 있는 여운을 남겨라.',
  },
  {
    id: 'epic_chronicle',
    name: '장엄한 영웅 서사시',
    category: 'classic_literary',
    categoryLabel: '🏛️ 정통 문학 & 서사',
    badgeColor: 'border-yellow-500/40 text-yellow-300 bg-yellow-950/30',
    previewQuote: '“별들이 침묵하는 밤, 운명의 거대한 수레바퀴가 피와 쇠의 굉음을 내며 움직이기 시작했다.”',
    description: '신화적 비유, 웅장한 대결 구도와 역사서처럼 장대한 스케일을 담아내는 서사시적 문체.',
    directive: '장대한 역사서와 신화적 대서사시의 호흡. 시대의 격변과 영웅들의 신념 대립을 장엄하고 웅건한 필치로 서술하라.',
  },
  {
    id: 'lyrical_humanism',
    name: '서정적 낭만 & 인간군상극',
    category: 'classic_literary',
    categoryLabel: '🏛️ 정통 문학 & 서사',
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/30',
    previewQuote: '“주막의 희미한 호롱불 아래, 잔을 기울이는 늙은 검객의 주름진 눈가에 지난 세월의 회한이 어렸다.”',
    description: '인물 간의 섬세한 심리선, 현지의 음식·풍속과 계절감이 살아 숨쉬는 인간적인 드라마.',
    directive: '인물들의 내면 심리와 인간적 번뇌, 현지의 음식, 차, 기후와 풍속을 섬세하게 묘사하는 서정적 군상극 문체. 인간미와 짙은 정서적 여운을 살려라.',
  },

  // 2. Dark & Hardboiled
  {
    id: 'dark_hardboiled',
    name: '비정한 하드보일드 르포르타주',
    category: 'dark_hardboiled',
    categoryLabel: '🩸 다크 & 하드보일드',
    badgeColor: 'border-stone-500/40 text-stone-300 bg-stone-900/40',
    previewQuote: '“총성은 빗소리에 묻혔다. 바닥에 고인 웅덩이에선 화약 냄새와 차가운 쇠비린내가 피어올랐다.”',
    description: '형용사를 극도로 절제한 건조한 단문, 냉철한 사실 묘사와 핏빛 긴장감이 감도는 문체.',
    directive: '군더더기 없는 건조한 단문과 사실적 묘사 위주의 하드보일드 문체. 감상에 젖지 않고 찰나의 침묵, 물리적 타격감, 비정한 현실의 냉혹함을 날카롭게 포착하라.',
  },
  {
    id: 'picaresque_noir',
    name: '피카레스크 & 범죄 누아르',
    category: 'dark_hardboiled',
    categoryLabel: '🩸 다크 & 하드보일드',
    badgeColor: 'border-red-500/40 text-red-300 bg-red-950/30',
    previewQuote: '“이 도시에서 정의는 가장 값싼 농담이다. 살아남는 놈이 규칙을 정하고, 죽은 놈은 쓰레기가 될 뿐이다.”',
    description: '도덕적 회색지대, 냉소적 독백, 밑바닥 암투와 부패의 냄새를 묵직하게 담아내는 누아르.',
    directive: '도덕적 흑백논리를 배제하고 배신과 생존, 회색지대의 냉소와 타락을 다루는 정통 피카레스크 누아르 문체. 밑바닥 인간들의 비틀린 욕망을 현실적으로 그리라.',
  },
  {
    id: 'grim_dark_survival',
    name: '처절한 다크 판타지 / 생존 잔혹극',
    category: 'dark_hardboiled',
    categoryLabel: '🩸 다크 & 하드보일드',
    badgeColor: 'border-rose-600/40 text-rose-300 bg-rose-950/30',
    previewQuote: '“진흙탕에 처박힌 성기사의 방패 위로 검은 까마귀들이 내려앉았다. 구원은 어디에도 없었다.”',
    description: '가혹한 세계관, 피비린내 나는 생존의 무게와 절망적인 사투를 그리는 다크소울·위쳐풍.',
    directive: '서늘하고 가혹한 다크 판타지 생존극. 피와 상흔, 굶주림, 무너져가는 이성과 처절한 사투를 리얼하고 긴박감 넘치게 묘사하라.',
  },

  // 3. Mystery & Horror
  {
    id: 'gothic_cosmic_horror',
    name: '고딕 오컬트 & 코스믹 호러',
    category: 'mystery_horror',
    categoryLabel: '🕯️ 미스터리 & 호러',
    badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-950/30',
    previewQuote: '“벽장 너머에서 들려오는 긁는 소리는 결코 쥐의 발톱이 아니었다. 밤이 길어질수록 이성은 무너져 내렸다.”',
    description: '기이하고 음산한 분위기, 미지의 공포와 서서히 조여오는 심리적 불안과 광기.',
    directive: '러브크래프트·포우 식의 음산하고 기이한 고딕 호러 문체. 불길한 환경음, 왜곡된 시각적 전조, 미지의 존재에 대한 원초적 공포와 심리적 긴장을 점진적으로 증폭시키라.',
  },
  {
    id: 'suspense_deduction',
    name: '치밀한 서스펜스 & 추리극',
    category: 'mystery_horror',
    categoryLabel: '🕯️ 미스터리 & 호러',
    badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/30',
    previewQuote: '“탁자 위의 찻잔은 아직 미지근했다. 범인은 이 방을 떠난 지 3분이 채 되지 않았다.”',
    description: '정교한 복선과 단서, 인물 간의 치열한 심리적 신경전과 차가운 논리적 추론.',
    directive: '현장의 미세한 단서와 증거, 인물들의 모순된 알리바이와 알력 다툼을 지적이고 치밀하게 전개하는 정통 서스펜스 추리 문체.',
  },
  {
    id: 'urban_psycho_thriller',
    name: '기괴한 도시 괴담 & 사이코 스릴러',
    category: 'mystery_horror',
    categoryLabel: '🕯️ 미스터리 & 호러',
    badgeColor: 'border-indigo-500/40 text-indigo-300 bg-indigo-950/30',
    previewQuote: '“엘리베이터 거울에 비친 내 뒤의 남자는 내가 고개를 돌려도 움직이지 않고 미소를 지었다.”',
    description: '일상 속의 균열, 기괴한 도시 괴담과 왜곡된 현실감이 주는 심리적 공포.',
    directive: '평온한 일상 속에 서서히 침투하는 괴담과 심리적 왜곡. 신경을 긁는 듯한 섬뜩한 불쾌함과 긴박한 전개를 연출하라.',
  },

  // 4. Adventure & Special (Including J-Anime)
  {
    id: 'janime_battle_style',
    name: '열혈 이능 배틀 / J애니메이션 활극',
    category: 'adventure_special',
    categoryLabel: '🧭 모험 & 특수 장르',
    badgeColor: 'border-orange-500/40 text-orange-300 bg-orange-950/30',
    previewQuote: '“공간이 뒤틀리며 푸른 불꽃이 폭발했다. 각자의 신념을 짊어진 칼날이 허공에서 불꽃을 튀겼다.”',
    description: '강렬한 신념의 충돌, 공간을 가르는 박진감 넘치는 액션과 개성 넘치는 인물들의 활극.',
    directive: '주술회전, 페이트, 블리치 등 J애니메이션 명작의 스타일리시하고 역동적인 활극 문체. 공간을 가르는 속도감, 신념과 이능이 부딪히는 팽팽한 대치, 매력적인 인물들의 대사를 입체적으로 살리라.',
  },
  {
    id: 'high_adventure',
    name: '경쾌한 정통 하이 어드벤처',
    category: 'adventure_special',
    categoryLabel: '🧭 모험 & 특수 장르',
    badgeColor: 'border-blue-500/40 text-blue-300 bg-blue-950/30',
    previewQuote: '“돛을 올려라! 미지의 해도가 가리키는 폭풍 너머에 전설의 황금 도시가 잠들어 있다!”',
    description: '역동적인 활극과 위트, 낭만과 모험심이 가득 찬 시원하고 생동감 있는 문체.',
    directive: '활기차고 낭만적인 모험 활극 문체. 미지의 땅을 탐험하는 설렘, 유쾌한 동료 간의 티키타카와 재치 넘치는 위기 돌파를 그려라.',
  },
  {
    id: 'techno_hard_scifi',
    name: '건조한 테크노 스릴러 / 하드 SF',
    category: 'adventure_special',
    categoryLabel: '🧭 모험 & 특수 장르',
    badgeColor: 'border-teal-500/40 text-teal-300 bg-teal-950/30',
    previewQuote: '“산소 잔량 12%. 주 추진 노즐의 결빙을 해제하지 못하면 궤도 재진입 각도를 상실한다.”',
    description: '정밀한 과학/기술적 고증, 이성적이고 분석적인 서술로 전개되는 차가운 지적 스릴.',
    directive: '물리학, 전뇌 네트워크, 궤도 역학 등 정밀한 기술적 고증과 시스템 데이터를 차분하고 논리적으로 묘사하는 정통 하드 SF 문체.',
  },
  {
    id: 'original_ip_faithful',
    name: '원작 고유의 문체 충실 재현',
    category: 'adventure_special',
    categoryLabel: '🧭 모험 & 특수 장르',
    badgeColor: 'border-fuchsia-500/40 text-fuchsia-300 bg-fuchsia-950/30',
    previewQuote: '“원작 소설 및 애니메이션 고유의 어휘, 호흡, 캐릭터 대사톤을 1:1로 완벽하게 재현합니다.”',
    description: '선택한 원작 IP의 작가적 문체와 특유의 대사 호흡을 원작과 동일하게 복원하는 모드.',
    directive: '해당 원작 IP의 고유한 문체, 어휘 사용법, 캐릭터들의 말투와 작품 특유의 분위기를 철저히 고증하여 100% 원작 감성 그대로 서술하라.',
  },
  {
    id: 'custom_tone',
    name: '✍️ 자유 커스텀 문체 (직접 작성)',
    category: 'custom',
    categoryLabel: '✍️ 커스텀',
    badgeColor: 'border-zinc-500/40 text-zinc-300 bg-zinc-900/50',
    previewQuote: '“플레이어가 직접 지시한 특별한 문체와 호흡을 엔딩까지 100% 반영합니다.”',
    description: '자신만의 독특한 문체 지시나 특별한 어조를 직접 프롬프트로 작성하여 적용.',
    directive: '플레이어가 직접 작성한 커스텀 문체 지시사항을 최우선으로 반영하여 서술하라.',
  },
];

// Rich Preset Pool categorized by Genre
export const GENRE_PRESET_MASTER_POOL: GenrePreset[] = [
  // 1. J-Anime & JRPG Category
  {
    id: 'janime_exorcism_curse',
    category: 'janime_jrpg',
    name: '다크 도심 주술·퇴마 활극 (주술·요괴 배틀)',
    period: '현대 대도시 이면의 주술 사회',
    premise: '인간의 부정적 감정이 응축되어 태어난 특급 재앙/주령과, 이를 은밀히 퇴마하는 현대 주술사 명가 및 학생들의 목숨을 건 이능 활극 세계관입니다.',
    recommendedToneId: 'janime_battle_style',
    tags: ['주술', '특급주령', '학원퇴마', '영역전개'],
  },
  {
    id: 'janime_academy_esper',
    category: 'janime_jrpg',
    name: '거대 학원도시 이능 배틀 (에스퍼 vs 마술)',
    period: '근미래 초과학 학원도시',
    premise: '초능력 개발 프로그램을 이수하는 230만 학원도시의 학생들과, 과학의 이면에 숨어 암약하는 고대 마술 결사 간의 은밀한 충돌과 음모를 다룹니다.',
    recommendedToneId: 'janime_battle_style',
    tags: ['초능력', '학원도시', '암부조직', '과학vs마술'],
  },
  {
    id: 'janime_mecha_chronicle',
    category: 'janime_jrpg',
    name: '황폐화된 우주 식민지와 리얼 로봇 전기',
    period: '우주세기 말기 항성간 분쟁기',
    premise: '지구 연방의 자원 통제에 맞서 독립을 선언한 콜로니 군사 세력, 그리고 거대 인형 기동병기(메카)에 탑승한 소년병 파일럿들의 신념과 전쟁 군상극입니다.',
    recommendedToneId: 'epic_chronicle',
    tags: ['메카닉', '우주전쟁', '소년병', '이념대립'],
  },
  {
    id: 'janime_dark_magical_girl',
    category: 'janime_jrpg',
    name: '이면의 잔혹 계약: 다크 마법소녀 전기',
    period: '외견상 평화로운 현대 항구도시',
    premise: '소원을 대가로 영혼을 계약한 마법사들. 그러나 마수 토벌 뒤에 숨겨진 잔혹한 진실과 절망의 엔트로피 속에서 동료들과 살아남기 위한 비극적 투쟁입니다.',
    recommendedToneId: 'gothic_cosmic_horror',
    tags: ['마법계약', '잔혹동화', '운명극복', '이면진실'],
  },
  {
    id: 'janime_persona_shadow',
    category: 'janime_jrpg',
    name: '심층 무의식과 이면 세계 (페르소나풍 심리 활극)',
    period: '현대 도쿄/메트로폴리스의 밤',
    premise: '부패한 권력자들의 일그러진 마음이 만들어낸 이계의 궁전. 내면의 가면(페르소나)을 각성한 이들이 타락한 마음을 훔쳐 개심시키는 심리 판타지입니다.',
    recommendedToneId: 'janime_battle_style',
    tags: ['이면궁전', '심리판타지', '괴도단', '가면각성'],
  },
  {
    id: 'janime_deep_dungeon_survival',
    category: 'janime_jrpg',
    name: '심층 미궁 생태계와 하드코어 던전 크롤러',
    period: '거대 지하 대미궁 오라리오',
    premise: '끝을 알 수 없는 지하 미궁. 몬스터 식생 채집, 정밀한 마법 자원 관리, 층계별 가혹한 환경을 돌파하며 심연의 유물을 노리는 던전 탐험 활극입니다.',
    recommendedToneId: 'grim_dark_survival',
    tags: ['미궁생존', '자원관리', '파티협동', '심층탐사'],
  },
  {
    id: 'janime_cyber_ghost_tokyo',
    category: 'janime_jrpg',
    name: '전뇌 네트워크와 의체 디스토피아 (공각 스타일)',
    period: '2040년대 네오 도쿄',
    premise: '인간의 뇌가 네트워크에 직결된 시대. 고스트 해킹 범죄와 메가코프의 암투를 추적하는 공안 특수 부대 요원들의 건조하고 날카로운 SF 수사극입니다.',
    recommendedToneId: 'dark_hardboiled',
    tags: ['전뇌화', '의체수사', '메가코프', '고스트'],
  },
  {
    id: 'janime_post_god_apocalypse',
    category: 'janime_jrpg',
    name: '신마 대전쟁 이후의 황폐 세계 (여신전생/니어풍)',
    period: '신과 악마가 붕괴시킨 잿빛 지구',
    premise: '절대적 규율의 천사와 자유를 갈망하는 악마의 대전쟁 끝에 폐허가 된 세계. 소수의 생존 인간이 선택해야 할 세계 재생과 멸망의 철학적 선택지입니다.',
    recommendedToneId: 'epic_chronicle',
    tags: ['신마전쟁', '종말세계', '법칙선택', '철학대립'],
  },
  {
    id: 'janime_isekai_banished_artisan',
    category: 'janime_jrpg',
    name: '추방된 연금술 장인의 변경 슬로라이프 & 공방 개척',
    period: '왕도에서 쫓겨난 최변경 미개척 영지',
    premise: '파티에서 불필요하다며 추방당한 생산직 연금술사. 그러나 그가 지닌 고대 연금 조합술로 마석과 약초를 가공해 변경 마을을 대도시로 번영시키는 힐링 개척기입니다.',
    recommendedToneId: 'lyrical_humanism',
    tags: ['연금술', '공방개척', '슬로라이프', '추방물'],
  },
  {
    id: 'janime_holy_grail_war',
    category: 'janime_jrpg',
    name: '비의(秘儀)의 의식: 영웅 소환 성배 전쟁',
    period: '결계로 봉쇄된 후유키 시가지',
    premise: '만능의 소원기 성배를 쟁탈하기 위해 7인의 마술사와 7기의 전설적 영령(서번트)이 밤의 도심에서 격돌하는 목숨을 건 마술 결투극입니다.',
    recommendedToneId: 'janime_battle_style',
    tags: ['영웅소환', '성배전쟁', '마술결투', '서번트'],
  },
  {
    id: 'janime_hunter_tower_climb',
    category: 'janime_jrpg',
    name: '각성자 레이드와 무한의 탑 등반',
    period: '대균열 이후 헌터 협회 서울 본부',
    premise: '하늘에 솟아오른 100층의 시련의 탑. 탑을 오를 때마다 신화적 권능과 유물을 부여받지만, 층마다 숨겨진 시스템의 가혹한 심판을 돌파해야 하는 헌터 활극입니다.',
    recommendedToneId: 'janime_battle_style',
    tags: ['탑등반', '헌터각성', '보스레이드', '스킬성장'],
  },
  {
    id: 'janime_gourmet_dungeon',
    category: 'janime_jrpg',
    name: '미식 던전 탐식: 마수 요리와 생태 탐험',
    period: '황금향으로 이어지는 지하 7층 생태계',
    premise: '식량이 떨어진 채 던전 깊숙이 고립된 모험가 파티. 마수들의 생태적 약점을 공략해 즉석에서 극상의 요리로 조리해 먹으며 나아가는 기상천외한 미식 생존기입니다.',
    recommendedToneId: 'lyrical_humanism',
    tags: ['마수요리', '생태탐험', '미식던전', '파티모험'],
  },

  // 2. Classic Fantasy & Wuxia
  {
    id: 'classic_wuxia_nine_sects',
    category: 'classic_fantasy',
    name: '정통 무협: 구파정사(九派正邪)와 마교 대혈겁',
    period: '남송 말기 중원 강호 천하',
    premise: '소림, 무당, 화산 등 구대문파와 신비로운 세외 세력, 그리고 부활을 노리는 일월신교의 암투가 강호를 뒤흔드는 정통 무협 세계관입니다.',
    recommendedToneId: 'classic_literary',
    tags: ['구파일방', '사파마교', '정통무공', '강호풍류'],
  },
  {
    id: 'classic_grim_witcher_fantasy',
    category: 'classic_fantasy',
    name: '잿빛 대륙의 몬스터 헌터와 다크 판타지',
    period: '전란과 흑사병이 휩쓰는 북부 왕국령',
    premise: '괴물과 변이, 인간의 탐욕과 종교 재판이 뒤엉킨 잿빛 대륙. 돌연변이 약물과 검술로 괴물을 사냥하는 사냥꾼들의 비정한 생존기입니다.',
    recommendedToneId: 'grim_dark_survival',
    tags: ['괴물사냥', '은검', '도덕적회색', '위쳐풍'],
  },
  {
    id: 'classic_high_tolkien_fantasy',
    category: 'classic_fantasy',
    name: '하이 판타지: 성검과 엘프 고대 왕국',
    period: '제3시대 고대 유적과 요정의 숲',
    premise: '어둠의 군주가 깨어나고 고대 성검의 봉인이 풀린 시대. 드워프의 지하 도시와 엘프의 은둔림, 인간 왕국이 연합하여 맞서는 장대한 여정입니다.',
    recommendedToneId: 'epic_chronicle',
    tags: ['성검', '엘프드워프', '어둠의군주', '원정대'],
  },
  {
    id: 'classic_eastern_xianxia',
    category: 'classic_fantasy',
    name: '동양 선협: 천도 수련과 등선(登仙) 대도',
    period: '구천구지(九天九地) 신선 수선계',
    premise: '영맥을 차지하기 위한 선문 종파들의 쟁탈전. 영단을 연성하고 천겁(天劫)을 돌파하여 불사의 신선으로 거듭나려는 수선자들의 치열한 투쟁입니다.',
    recommendedToneId: 'classic_literary',
    tags: ['선협수선', '영단연성', '천겁돌파', '선문암투'],
  },
  {
    id: 'classic_low_mercenary',
    category: 'classic_fantasy',
    name: '로우 판타지: 흙먼지와 용병단의 피비린내',
    period: '영주들의 백년 전쟁기 중세',
    premise: '마법은 전설 속에나 존재하고, 차가운 강철과 화살비가 생사를 가르는 중세 전장. 은화 한 닢을 위해 피를 흘리는 용병단의 현실적인 사투입니다.',
    recommendedToneId: 'dark_hardboiled',
    tags: ['용병단', '중세공성', '강철사투', '현실적전쟁'],
  },
  {
    id: 'classic_viking_norse_myth',
    category: 'classic_fantasy',
    name: '북유럽 신화: 얼어붙은 피오르드와 발할라의 서약',
    period: '영원한 겨울 핌불베트르 직전의 노르드 해안',
    premise: '서리 거인들의 봉인이 풀리고 룬 문자의 힘이 요동치는 혹한의 대지. 도끼와 방패벽을 맞대고 신들의 황혼(라그나로크)에 맞서는 바이킹 영웅들의 대서사시입니다.',
    recommendedToneId: 'epic_chronicle',
    tags: ['바이킹', '룬마법', '라그나로크', '발할라'],
  },
  {
    id: 'classic_arthurian_knights',
    category: 'classic_fantasy',
    name: '아서왕 전설: 원탁의 기사와 성배의 순례',
    period: '안개 낀 브리튼 섬 카멜롯 왕국',
    premise: '마법사 멀린의 예언과 카멜롯의 번영 뒤에 드리운 요정 모르간의 저주. 기사도의 명예와 성배 탐색을 위해 황야로 떠나는 원탁 기사들의 비장한 여정입니다.',
    recommendedToneId: 'classic_literary',
    tags: ['기사도', '원탁의기사', '성배탐색', '엑스칼리버'],
  },
  {
    id: 'classic_dark_souls_ruins',
    category: 'classic_fantasy',
    name: '시들어가는 불꽃과 저주받은 망자의 왕국 (소울즈풍)',
    period: '재가 덮인 고대 성채와 시든 화톳불',
    premise: '불꽃이 꺼져가며 인간들이 불사의 망자로 변해가는 멸망의 시대. 유일하게 이성을 간직한 재의 귀인이 심연의 군주들을 베고 불꽃을 계승하려는 처절한 고투입니다.',
    recommendedToneId: 'grim_dark_survival',
    tags: ['망자저주', '화톳불', '다크소울풍', '심연군주'],
  },

  // 3. Sci-Fi & Cyberpunk & Post-Apocalypse
  {
    id: 'scifi_neon_cyberpunk',
    category: 'scifi_cyber',
    name: '네온 사이버펑크 2099: 메가코프와 넷러너',
    period: '네온사인 아래 슬럼가 나이트시티',
    premise: '거대 초국적 기업들이 국가를 대체한 미래. 불법 사이버웨어와 신경 접속 덱을 무기로 기업의 기밀을 털어먹는 엣지러너들의 목숨을 건 질주입니다.',
    recommendedToneId: 'picaresque_noir',
    tags: ['사이버웨어', '넷러닝', '기업전쟁', '슬럼가'],
  },
  {
    id: 'scifi_space_opera_empire',
    category: 'scifi_cyber',
    name: '스페이스 오페라: 은하 제국과 항성 반란군',
    period: '은하계 대항해 시대 제국력 700년',
    premise: '워프 게이트를 장악한 은하 제국 귀족정과 자유 항로를 수호하려는 성간 무역 연합. 함대전과 빔 세이버가 교차하는 우주 대서사시입니다.',
    recommendedToneId: 'epic_chronicle',
    tags: ['은하함대', '워프항법', '성간제국', '우주해적'],
  },
  {
    id: 'scifi_wasteland_diesel_apocalypse',
    category: 'scifi_cyber',
    name: '황무지 아포칼립스: 매드 맥스와 가솔린 워',
    period: '핵전쟁 100년 후 모래바람 황야',
    premise: '물과 기름이 화폐가 된 불타는 황야. 개조 차량을 몰고 습격하는 광기의 워로드 군단에 맞서 오아시스를 지키려는 생존자들의 사투입니다.',
    recommendedToneId: 'dark_hardboiled',
    tags: ['개조차량', '가솔린', '황무지약탈', '워로드'],
  },
  {
    id: 'scifi_hard_orbital_station',
    category: 'scifi_cyber',
    name: '하드 SF: 고립된 목성 궤도 연구소의 생존',
    period: '2150년 목성 위성 유로파 궤도',
    premise: '심우주 통신이 두절되고 산소 순환기가 멈춘 고립 기지. 미지의 심해 외계 샘플과 기계 고장 속에서 냉정한 계산으로 생환하려는 과학자들의 사투입니다.',
    recommendedToneId: 'techno_hard_scifi',
    tags: ['목성탐사', '산소관리', '고립기지', '하드SF'],
  },
  {
    id: 'scifi_victorian_steampunk',
    category: 'scifi_cyber',
    name: '빅토리아 스팀펑크: 증기 기관 제국과 하늘의 비공정',
    period: '1888년 증기압 매연이 자욱한 런던 상공',
    premise: '증기압 자동인형과 거대 증기 비공정이 하늘을 뒤덮은 대영제국. 에테르 광물을 둘러싼 황실 첩보원과 하늘의 비공정 해적들의 활극입니다.',
    recommendedToneId: 'janime_battle_style',
    tags: ['비공정', '증기기관', '황실첩보', '에테르광'],
  },
  {
    id: 'scifi_biopunk_flesh_dystopia',
    category: 'scifi_cyber',
    name: '바이오펑크: 유전자 조작과 생체 유기체 디스토피아',
    period: '유전자 카스트 제도가 정착된 해상 메트로폴리스',
    premise: '기계 대신 살아 숨 쉬는 생체 조직으로 장비와 도시를 건설하는 시대. 불법 유전자 변형체들의 반란과 생체 무기를 통제하려는 유전자 경찰의 추적극입니다.',
    recommendedToneId: 'dark_hardboiled',
    tags: ['유전자조작', '생체장비', '변형체', '카스트'],
  },

  // 4. Mystery & Horror & Occult
  {
    id: 'mystery_cthulhu_cosmic_horror',
    category: 'mystery_horror',
    name: '1920s 코스믹 호러: 아컴의 광기와 크툴루',
    period: '1926년 미국 매사추세츠 아컴 시',
    premise: '금주법 시대, 오래된 저택과 미스카토닉 대학의 지하실에서 벌어지는 기이한 의식. 인간의 지성을 초월한 고대 신들의 속삭임과 광기의 수사록입니다.',
    recommendedToneId: 'gothic_cosmic_horror',
    tags: ['크툴루', '광기SAN치', '고서해독', '아컴시'],
  },
  {
    id: 'mystery_victorian_gothic_vampire',
    category: 'mystery_horror',
    name: '빅토리아 고딕: 안개 낀 런던과 흡혈귀 사냥',
    period: '1890년대 안개와 가스등의 런던',
    premise: '귀족 사회의 가면 뒤에 숨어 피를 탐하는 불사의 흡혈귀 가문. 성수와 은제 말뚝을 쥐고 밤의 거리를 수색하는 뱀파이어 헌터들의 고딕 추적극입니다.',
    recommendedToneId: 'gothic_cosmic_horror',
    tags: ['흡혈귀', '빅토리아', '가스등런던', '은말뚝'],
  },
  {
    id: 'mystery_1930s_hardboiled_detective',
    category: 'mystery_horror',
    name: '1930s 하드보일드: 비 내리는 항구의 사설탐정',
    period: '대공황기 비 내리는 시카고 항구',
    premise: '부패한 시장, 뇌물을 받는 경찰, 마피아 패밀리가 지배하는 도시. 실종된 재벌가의 딸을 찾기 위해 시궁창에 발을 들인 사설탐정의 냉혹한 수사록입니다.',
    recommendedToneId: 'dark_hardboiled',
    tags: ['사설탐정', '마피아암투', '밀주조직', '하드보일드'],
  },
  {
    id: 'mystery_korean_urban_occult',
    category: 'mystery_horror',
    name: '한국형 도심 오컬트: 신내림과 무당의 퇴마록',
    period: '현대 서울 재개발 구역과 폐병원',
    premise: '재개발로 터진 지맥의 악귀와 원혼들. 신어머니의 작두와 방울을 이어받은 무속인과 오컬트 특수수사팀이 마주하는 처절한 원한과 퇴마의 기록입니다.',
    recommendedToneId: 'gothic_cosmic_horror',
    tags: ['무속신앙', '신내림', '악귀퇴마', '한국오컬트'],
  },
  {
    id: 'mystery_scp_containment_breach',
    category: 'mystery_horror',
    name: '변칙 개체 격리 실패: SCP 재단 특무대 기동',
    period: '지하 500m 고립된 제19연구기지',
    premise: '현실 조작과 밈적 오염을 일으키는 변칙 개체들의 집단 격리 파기. 사태를 수습하고 기지의 자폭을 막기 위해 투입된 기동특무대(MTF)의 극비 작전입니다.',
    recommendedToneId: 'techno_hard_scifi',
    tags: ['변칙격리', 'SCP풍', '기동특무대', '인지오염'],
  },
  {
    id: 'mystery_snowbound_manor_locked_room',
    category: 'mystery_horror',
    name: '폭설의 설산 산장: 밀실 연쇄 살인과 의심의 밤',
    period: '외부와 완전히 단절된 로키 산맥의 대저택',
    premise: '통신과 도로가 끊긴 폭설 속, 유산 상속을 위해 모인 8명의 인물들. 하나씩 살해당하는 밀실 트릭과 살인마를 찾아내야 하는 본격 정통 추리극입니다.',
    recommendedToneId: 'classic_literary',
    tags: ['밀실살인', '본격추리', '고립산장', '심리전'],
  },
];

// Helper to get 10 presets with golden ratio:
// J-Anime/JRPG (2~3 guaranteed) + Classic Fantasy (3~4) + SciFi/Mystery (3~4)
export function getRandom10Presets(category: GenreCategory = 'all'): GenrePreset[] {
  if (category === 'janime_jrpg') {
    const pool = GENRE_PRESET_MASTER_POOL.filter(p => p.category === 'janime_jrpg');
    return shuffleArray([...pool]).slice(0, 10);
  }
  if (category === 'classic_fantasy') {
    const pool = GENRE_PRESET_MASTER_POOL.filter(p => p.category === 'classic_fantasy');
    return shuffleArray([...pool]).slice(0, 10);
  }
  if (category === 'scifi_cyber') {
    const pool = GENRE_PRESET_MASTER_POOL.filter(p => p.category === 'scifi_cyber');
    return shuffleArray([...pool]).slice(0, 10);
  }
  if (category === 'mystery_horror') {
    const pool = GENRE_PRESET_MASTER_POOL.filter(p => p.category === 'mystery_horror');
    return shuffleArray([...pool]).slice(0, 10);
  }

  // 'all' category -> Golden Ratio:
  const janimePool = shuffleArray(GENRE_PRESET_MASTER_POOL.filter(p => p.category === 'janime_jrpg'));
  const fantasyPool = shuffleArray(GENRE_PRESET_MASTER_POOL.filter(p => p.category === 'classic_fantasy'));
  const scifiPool = shuffleArray(GENRE_PRESET_MASTER_POOL.filter(p => p.category === 'scifi_cyber'));
  const mysteryPool = shuffleArray(GENRE_PRESET_MASTER_POOL.filter(p => p.category === 'mystery_horror'));

  const janimeCount = Math.floor(Math.random() * 2) + 2; // 2 or 3
  const fantasyCount = 3;
  const scifiCount = 2;
  const mysteryCount = 10 - (janimeCount + fantasyCount + scifiCount); // 2 or 3

  const selected = [
    ...janimePool.slice(0, janimeCount),
    ...fantasyPool.slice(0, fantasyCount),
    ...scifiPool.slice(0, scifiCount),
    ...mysteryPool.slice(0, mysteryCount),
  ];

  return shuffleArray(selected);
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * [⚡ AI 무한 창작 프리셋 생성]
 * 백엔드 /api/generate-presets 엔드포인트를 호출하여 세계관 프리셋을 동적으로 생성합니다.
 */
export async function generateDynamicPresetsOnTheFly(
  category: GenreCategory = 'all',
  userPremise?: string
): Promise<GenrePreset[]> {
  try {
    const res = await fetch('/api/generate-presets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, userPremise }),
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.presets) && data.presets.length > 0) {
      return data.presets;
    }
  } catch (err) {
    console.warn('generateDynamicPresetsOnTheFly API call failed, falling back to local pool:', err);
  }
  return getRandom10Presets(category);
}