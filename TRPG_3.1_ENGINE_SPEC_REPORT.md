# 3.1 엔진 전체 구조 및 구동 원리 정밀 역추적 보고서

> **[조사 원칙]**  
> 본 보고서는 소스코드 분석 결과만을 바탕으로 작성되었습니다.  
> 코드는 단 한 줄도 수정되지 않았으며, 추측이나 임의의 보완 없이 현재 저장소에 물리적으로 존재하는 코드 객체, 함수, 데이터 흐름만을 근거로 기술합니다.

---

## ① 3.1 전체 아키텍처

실제 소스코드(React 클라이언트 `src/` + Express 백엔드 `server.ts`)를 분석하여 도출한 실제 아키텍처 흐름입니다.

```
[사용자 (User)]
      │
      ▼
[React UI 프론트엔드 (App.tsx / GameInterface.tsx)]
      │  ─ 사용자 입력 및 CSPRNG 주사위 굴림(rollD20WithModifier)
      ▼
[상태 조합 및 페이로드 생성 (handleSendMessage in App.tsx)]
      │  ─ Character, World, Messages(10턴/20메시지 슬라이딩 윈도우), Snapshot, DC통계 결합
      ▼
[HTTP POST /api/chat (Fetch with Retry in App.tsx: lines 58-98)]
      │
      ▼
[Express 서버 라우터 (server.ts: line 810)]
      │  ─ 원작 IP 모드 판별 -> googleSearch 툴 바인딩 여부 결정 (server.ts: 824)
      │  ─ DC 5~15 균등 분포 계산 (calculateRecommendedDC) (server.ts: 783)
      │  ─ 컨텍스트 스와핑 & 슬라이딩 윈도우 구성 (server.ts: 838)
      │  ─ MASTER_SYSTEM_INSTRUCTION + 톤앤매너 + 시스템 상태 주입 (server.ts: 907)
      ▼
[Gemini 3.7 Flash API 호출 (callGemini37WithRetry in server.ts: 242)]
      │  ─ model: 'gemini-3.7-flash', thinkingBudget: 4096, maxOutputTokens: 8192
      ▼
[AI GM 원문 응답 수신 (reply text: 14번 코드블록 + 서사 본문 + 15번 세이브패키지)]
      │
      ▼
[클라이언트 정규식 파서 (parseGMResponseMetaData in src/utils/parser.ts: 20)]
      │  ─ 15번 세이브 패키지 추출 (Regex)
      │  ─ 14번 7개 하위 메타데이터 블록 분리 및 순수 문학 서사 정제
      │  ─ 5번 라인(소장품, 목표, 영구 결손) 및 2번 라인(복선 씨앗) 추출
      │  ─ DC 판정 요구 감지 (detectDCInText)
      ▼
[React 게임 상태 갱신 (setGameState in App.tsx: lines 255-300)]
      │  ─ world.seeds, world.dcRecords, character.inventory/disabilities, messages 갱신
      ▼
[UI 렌더링 & 다음 턴 대기]
      │  ─ 순수 문학 서사 본문 표시 (양판소/상태창 어휘 차단)
      │  ─ 14번 메타데이터는 접이식 아코디언(MetadataAccordion.tsx) 및 인물록 모달에 표시
      │  ─ 다음 사용자 행동 입력 또는 주사위 판정 대기
```

---

## ② 핵심 엔진 구성요소

현재 프로젝트에 실재하는 14대 핵심 시스템의 파일, 함수, 입출력 및 연결 관계 명세입니다.

| 시스템 이름 | 실제 파일 경로 | 주요 함수 / 객체 | 입력 (Input) | 처리 (Processing) | 출력 (Output) | 타 시스템 연결 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **게임 상태 초기화 팩토리** | `src/utils/factory.ts` | `createEmptyCharacter()`, `createEmptyGameState()`, `createEmptyWorldState()`, `deepMerge()` | 초기화 트리거 / 로드 객체 | 순수 팩토리 함수 기반 빈 객체 생성 및 안전 병합 | 완전한 불변 `GameState` | `App.tsx` 초기 로딩, 세션 리셋, 클라우드 로드 |
| **CSPRNG 암호학적 주사위 엔진** | `src/utils/dice.ts` | `rollCryptoDie()`, `rollD20WithModifier()`, `generateAllStatsCSPRNG()` | 면수(sides), 수정치, 목표 DC, 스탯명 | `window.crypto.getRandomValues()` 기반 균등 난수 생성 및 차이값(diff) 판정 | `DiceRollResult` (8단계 결과 및 서사 묘사) | `DiceRollerModal.tsx`, `CreationPhase.tsx`, `App.tsx` |
| **GM 응답 파서 & 상태 동기화기** | `src/utils/parser.ts` | `parseGMResponseMetaData()`, `extractCharacterUpdates()`, `detectDCInText()` | AI GM의 원문 텍스트 (`data.reply`), 현재 캐릭터/메타 | 정규식 기반 14번/15번 코드블록 분리, 복선·결손·아이템·DC 추출 | `ParseResult` (cleanNarrative, metadata, seeds, dc, characterUpdates) | `App.tsx`의 `setGameState`, `MetadataAccordion.tsx`, `WorldInfoModal.tsx` |
| **서버 GM 대화 및 프롬프트 빌더** | `server.ts` (lines 810~970) | `app.post('/api/chat')`, `calculateRecommendedDC()` | `messages`, `world`, `character`, `userMessage`, `latestSavePackageSnapshot` | DC 균등 분포 계산, 슬라이딩 윈도우 조립, 톤앤매너/시스템 컨텍스트 결합 | Gemini 요청 contents 및 최종 JSON 응답 | Gemini 3.7 SDK, `App.tsx` |
| **Gemini 3.7 호출 & Fail-Fast 엔진** | `server.ts` (lines 216~287) | `callGemini37WithRetry()`, `isFailFastError()` | Gemini 클라이언트 인스턴스, contents, config | 429/401/404 Fail-Fast 처리, 일시 오류 시 지수 백오프 3회 재시도, Thinking Budget 강제 주입 | Model Response 객체 | `/api/chat` 핸들러 |
| **무손실 스냅샷 & 패키지 엔진** | `src/utils/snapshot.ts` | `buildSyntheticSaveSnapshot()`, `exportSessionToPackageJson()`, `importSessionFromPackageJson()` | `WorldInfoState`, `Character`, `turnCount`, `ChatMessage[]` | 6대 필수 계승 요소(A~F) 기반 무손실 텍스트 스냅샷 생성 및 JSON 직렬화 | 포맷팅된 스냅샷 텍스트 / `CloudSessionPayload` | `server.ts` 컨텍스트 스와핑, `CloudSyncModal.tsx` |
| **원작 IP 검증 및 앨리어스 매퍼** | `server.ts` (lines 398~548) | `CANON_ALIAS_MAP`, `app.post('/api/validate-world')` | 유저 입력 원작명 (예: '전생슬', '사조영웅전') | 내장 딕셔너리 즉시 매칭 및 Gemini 2.5 Flash 기반 정사/세력 구조 검증 | JSON (`valid`, `recognizedTitle`, `summary`, `keyFactions`, `settingEra`) | `CreationPhase.tsx` 1단계 월드 설정 |
| **동적 메타요소 풀 생성기** | `server.ts` (lines 670~714) | `app.post('/api/generate-meta-presets')` | 확정된 `world` 객체 | Gemini 2.5 Flash 호출을 통해 세계관 맞춤형 5대 메타요소 풀 10~15개 생성 | JSON (`background`, `flaw`, `oath`, `anchor`, `faction`) | `CreationPhase.tsx` 2단계 메타 설정 |
| **동적 캐릭터 컨셉 생성기** | `server.ts` (lines 716~780) | `app.post('/api/generate-character-concept')` | 확정된 `world`, `metaElements` | Gemini 2.5 Flash 호출을 통해 세계관/메타 맞춤 캐릭터 1명 완전 생성 | JSON (`name`, `title`, `age`, `gender`, `appearance`, `stats`, `currentGoal`) | `CreationPhase.tsx` 3단계 캐릭터 설정 |
| **클라우드 세이브/로드 엔진** | `server.ts` (lines 14~71, 327~366) | `app.post('/api/cloud-save')`, `app.get('/api/cloud-load/:code')`, `saveToKv()`, `loadFromKv()` | `gameState`, 6자리 동기화 코드 | In-Memory Cache 및 Vercel KV / Upstash Redis 이중 영속화 | `success`, `syncCode`, `gameState` | `CloudSyncModal.tsx`, `App.tsx` |
| **인물록 및 세계관 뷰어** | `src/components/WorldInfoModal.tsx` | `WorldInfoModal` 컴포넌트 | `WorldInfoState` (`npcs`, `factions`, `seeds`, `lore`) | Class A/B/C 판정, 인과적 심경(💭), 조연 OC, 복선 상태 실시간 탭 렌더링 | 모달 UI 뷰 | `GameInterface.tsx` 상단 바 |
| **메타데이터 아코디언** | `src/components/MetadataAccordion.tsx` | `MetadataAccordion` 컴포넌트 | `ParsedMetadata`, `turnNumber` | 14번 7개 하위 메타 블록을 파싱하여 접이식 UI로 렌더링, 원클릭 복사 제공 | 메시지별 아코디언 UI | `GameInterface.tsx` 메시지 스트림 |
| **사운드 & 환경음 엔진** | `src/utils/audio.ts` | `SoundEngine` 클래스 (Web Audio API) | 사운드 이벤트명 (`dice_roll`, `turn_complete`, `click` 등) | 오실레이터(Oscillator) 기반 실시간 신디사이저 사운드 합성 (외부 오디오 파일 의존 제로) | 스피커 음향 출력 | `App.tsx`, `DiceRollerModal.tsx` |
| **다국어 로컬라이제이션 레이어** | `src/locales/ko.ts`, `src/locales/index.ts` | `KO` 딕셔너리 객체 | 번역 키 | 한국어 UI 레이블, 버튼 텍스트, 시스템 안내문 맵핑 | 국문 UI 텍스트 | 전 UI 컴포넌트 |

---

## ③ 실제 게임 한 턴 전체 실행 흐름

사용자가 `"나는 문을 열어본다."`를 입력했을 때의 18단계 전수 추적입니다.

- **단계 1 (UI 입력)**: 사용자가 `GameInterface.tsx` 하단 프롬프트 인풋에 `"나는 문을 열어본다."`를 입력하고 전송 버튼을 누름.
- **단계 2 (React 함수 트리거)**: `GameInterface.tsx`의 `handleSubmit`이 부모로부터 전달받은 `handleSendMessage("나는 문을 열어본다.")`를 호출 (`App.tsx`: line 193).
- **단계 3 (클라이언트 데이터 생성)**: 
  - `checkIsMetaQuery` 검사 (`App.tsx`: line 181) -> `false` 판정.
  - `currentTurn = gameState.turnCount + 1` 계산.
  - `userMsg` 객체 생성 (`id: 'msg-...-user'`, `role: 'user'`, `content: '나는 문을 열어본다.'`, `turnNumber`).
  - `nextMessages = [...gameState.messages, userMsg]` 생성 후 `gameState.pendingDCRequest`를 `null`로 클리어.
- **단계 4 (서버 전송 JSON 페이로드)**: `fetchGMResponseWithRetry` (`App.tsx`: line 58)가 `POST /api/chat`으로 다음 JSON 전송:
  ```json
  {
    "world": { "worldName": "...", "worldMode": "...", "toneAndManner": { ... }, "dcRecords": { ... } },
    "character": { "name": "...", "stats": { ... }, "metaElements": { ... }, "inventory": [ ... ] },
    "messages": [ { "role": "user", "content": "..." }, { "role": "assistant", "content": "..." }, ... ],
    "userMessage": "나는 문을 열어본다.",
    "latestSavePackageSnapshot": undefined,
    "isMetaQuery": false
  }
  ```
- **단계 5 (Express 라우트 수신)**: `server.ts` line 810 `app.post(['/api/chat', '/chat'])` 라우트가 요청 수신.
- **단계 6 (서버 실행 순서)**:
  1. `getGenAI()` 호출하여 SDK 인스턴스 획득 (line 821).
  2. `world.worldMode === 'original_ip'` 검사 -> 참일 경우 `tools = [{ googleSearch: {} }]` 바인딩 (line 825).
  3. `turnCount` 및 15턴 배수 자동 세이브 여부 (`isAutoSaveTurn`) 산출 (line 830).
  4. `calculateRecommendedDC(world.dcRecords.dcHistory)` 실행하여 5~15 중 최소 빈도 DC 선정 (line 836).
  5. 컨텍스트 히스토리 빌드 (line 838~896).
  6. 톤앤매너 지침 및 시스템 컨텍스트 문자열 `systemContext` 조립 (line 907~929).
- **단계 7 (게임 상태 정보 추출)**: 서버는 수신된 `character`에서 6대 스탯, 5대 메타요소(배경, 결핍, 맹세, 닻, 세력), 신체 결손(`disabilities`), 극복 결핍(`overcameFlaws`), 평판, 목표를 문자열로 추출하여 주입.
- **단계 8 (최종 프롬프트 구성)**: `contents = [...processedHistory, { role: 'user', parts: [{ text: systemContext }] }]` 형태로 조립.
- **단계 9 (MASTER_SYSTEM_INSTRUCTION 주입)**: `server.ts` line 74에 선언된 거대 시스템 헌법 상수가 `config.systemInstruction` 파라미터로 주입 (line 943).
- **단계 10 (14개 구조화 블록 지시 위치)**: `MASTER_SYSTEM_INSTRUCTION` 내부 제14조 (`server.ts`: line 173~180)에 정의되어 AI에게 "매 턴 서술 직전에 1개 마크다운 코드블록 안에 1)~7)을 압축 표기하라"고 명령.
- **단계 11 (캐릭터/세계관/상태 주입 위치)**: `systemContext` 문자열 내부에 실시간으로 직렬화되어 마지막 턴 유저 프롬프트 상단에 주입 (`server.ts`: line 907~929).
- **단계 12 (주사위 판정 시점)**: 이번 턴이 순수 선언인 경우 주사위는 실행되지 않음. 만약 이전 턴에서 AI가 DC 판정을 요구하여 유저가 주사위 모달에서 굴렸다면, `handleSendMessage`의 2번째 인자로 `DiceRollResult`가 전달되어 `userMessage` 텍스트 끝에 `[🎲 주사위 투척 결과: ...]` 형태로 삽입된 채 전송됨.
- **단계 13 (Gemini 최종 요청 구조)**:
  - Model: `gemini-3.7-flash`
  - SystemInstruction: `MASTER_SYSTEM_INSTRUCTION`
  - ThinkingConfig: `{ thinkingBudget: 4096 }`
  - Tools: `[{ googleSearch: {} }]` (원작 IP 모드 시)
  - Contents: 누적 턴 대화 배열 + 최종 시스템 컨텍스트 및 사용자 선언.
- **단계 14 (Gemini 응답 수신 함수)**: `server.ts`의 `callGemini37WithRetry`가 응답을 수신하고, 라우트 핸들러가 `{ success: true, reply: responseText, turnNumber, isAutoSaveTurn, autoSaveCode }` 형태로 클라이언트에 JSON 응답 반환.
- **단계 15 (14개 블록 파싱 함수)**: `App.tsx` line 239에서 `parseGMResponseMetaData(data.reply, prevMeta, gameState.character)` (`src/utils/parser.ts`) 실행.
  - 정규식으로 15번 세이브 블록 및 14번 메타데이터 코드블록 분리.
  - 남은 텍스트를 `cleanNarrative`로 확정 (마크다운 백틱 및 태그 제거).
  - 14번 블록 텍스트를 줄단위로 분해하여 `searchAndVerificationReport`, `activeSeeds`, `cameraOffAffairs`, `chapterInfo`, `statsAndInventory`, `dcStats`, `adherenceDeclaration` 파싱.
  - 서사 본문에서 `detectDCInText`를 통해 `[판정 요구]` 정규식 매칭.
- **단계 16 (게임 상태 반영)**: `App.tsx` lines 255~300의 `setGameState` 함수:
  - `world.seeds`: 파싱된 복선 씨앗 목록으로 동기화.
  - `world.dcRecords`: 감지된 DC가 있으면 `dcHistory`에 푸시.
  - `character`: 5번 항목에서 아이템/목표/영구결손 변동이 추출된 경우 `updatedCharacterUpdates`로 병합.
  - `messages`: 유저 메시지와 정제된 `assistant` 메시지(`content: cleanNarrative`, `metadata: parsed.metadata`)를 배열에 추가.
  - `pendingDCRequest`: 감지된 DC 판정 객체 저장 (있을 경우 UI에 주사위 버튼 활성화).
- **단계 17 (UI 결과 표시)**:
  - `GameInterface.tsx` 채팅창에 순수한 소설 문체 서사 본문만 렌더링.
  - 메시지 상단에 `MetadataAccordion.tsx`가 생성되어 접이식으로 14번 시스템 검증 내역 렌더링 및 복사 버튼 제공.
  - 상단바의 인물록/복선 카운터 뱃지 실시간 갱신.
- **단계 18 (다음 턴 정보 유지)**: 갱신된 `gameState`는 React 상태로 유지되며, 다음 턴 전송 시 `messages` 및 `character`, `world` 객체에 그대로 실려 서버로 전송됨.

---

## ④ 게임 상태 구조 (Game State)

현재 시스템에서 게임 상태가 기억·보존되는 위치를 정확히 5단계로 분류했습니다.

| 분류 | 보존 대상 데이터 | 소스코드 내 물리적 위치 / 변수 | 특성 및 수명 |
| :--- | :--- | :--- | :--- |
| **A. 실제 코드 변수/상태로 저장되는 것** | `phase`, `creationStep`, `turnCount`, `world` (이름, 장르, NPC목록, 세력목록, 복선목록, DC기록, 톤앤매너), `character` (이름, 6대스탯, 5대메타요소, 소장품, 평판, 영구결손, 극복결핍, 목표, 연표), `messages` (전체 대화 로그, 턴번호, 개별 메타데이터), `pendingDCRequest`, `latestSavePackageSnapshot` | `src/types.ts`의 `GameState` 인터페이스 및 `App.tsx`의 `const [gameState, setGameState] = useState<GameState>` | React 런타임 메모리 상에 완전한 구조체로 실시간 유지됨. |
| **B. AI 프롬프트에만 주입되는 것** | `MASTER_SYSTEM_INSTRUCTION` (16개 조항 헌법), 톤앤매너 세부 문체 지침(`directive`), 이번 턴 추천 DC 안내문(`[System Note: 이번 턴 추천 목표 DC: X]`), 15턴 자동 세이브 발급 명령 | `server.ts` lines 74~206 및 `systemContext` 템플릿 리터럴 (lines 907~929) | 매 턴 동적으로 조합되어 Gemini 호출 시에만 일시적으로 전달됨. |
| **C. localStorage에 저장되는 것** | `TRPG_ENGINE_SESSION_V1` 키로 직렬화된 `GameState` 전체 객체 | `src/App.tsx` lines 44~55 (useEffect 내 자동 저장) | 브라우저 로컬 저장소에 저장되어 탭 새로고침 시 자동 복원됨. 파싱 실패 시 초기화. |
| **D. 서버에 저장되는 것** | 6자리 동기화 코드(`syncCode`)를 키로 하는 `{ version, syncCode, savedAt, gameState }` | `server.ts` line 14 `memoryKvStore` (Map) 및 Upstash Redis / Vercel KV REST 저장소 | 클라우드 저장 시 서버 및 분산 KV에 영구 보존되어 타 기기에서 복원 가능. |
| **E. 실제로는 저장되지 않고 매번 재생성되는 것** | 1단계/2단계/3단계 월드 빌딩 및 5대 메타요소 추천 풀, 캐릭터 컨셉 추천값, DC 추천 번호(`calculateRecommendedDC`) | `server.ts`의 `/api/generate-presets`, `/api/generate-meta-presets`, `/api/generate-character-concept` | 호출 시점에 AI가 즉석에서 생성하여 반환하며, 유저가 선택한 값만 `gameState`에 영속화됨. |

---

## ⑤ 14개 구조화 블록 전수 해부

스펙 제14조에 정의되고 `src/utils/parser.ts`에서 파싱하는 메타데이터 블록(1개 마크다운 코드블록 내의 7개 세부 항목)의 상세 분석입니다.

*주의: 스펙 명칭은 "제14조 필수 표기사항(14th Mandatory Metadata Block)"이며, 그 내부에 **1)부터 7)까지의 7대 핵심 하위 항목**이 포함되어 있습니다.*

| 항목 번호 및 명칭 | 목적 | 생성 주체 | 코드 정의 위치 | 파싱 후 저장 위치 | 다음 턴 활용 방식 | 다른 블록과의 관계 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1) [외부 검색, UI 코드 반영 및 NPC 지식 검증 보고]** | 원작 팩트체크 요약, Class A/B/C 판정, UI 인물록 추가 상태, NPC 메타 지식 비대칭성 준수 선언 | AI GM | `server.ts: 174` (규칙) / `parser.ts: 125` | `ParsedMetadata.searchAndVerificationReport` | `MetadataAccordion.tsx`에 표시되어 플레이어의 고증 검증에 활용 | 7번 개연성 준수 선언 및 월드 NPC 인물록과 직결 |
| **2) [활성화된 미회수 복선 씨앗]** | 현재 강호/세계에 뿌려진 힌트/복선 중 미회수된 요소를 최대 3개까지 실시간 추적 | AI GM | `server.ts: 175` / `parser.ts: 127` | `ParsedMetadata.activeSeeds` 및 `gameState.world.seeds` | 다음 턴 프롬프트의 스냅샷/이전 컨텍스트에 포함되어 복선 회수 유도 | 4번 챕터 전개 및 8조 복선 회수 명령과 연동 |
| **3) [카메라 밖 세계 정세 자율 변동]** | 주인공 동선 밖 타 지역/세력에서 발생한 물밑 정세 1줄 기록 (NPC 인지 불가 정보) | AI GM | `server.ts: 176` / `parser.ts: 133` | `ParsedMetadata.cameraOffAffairs` | 스냅샷 패키지(D항목)에 누적되어 세계관의 거시적 연속성 유지 | NPC의 제한된 지식(4조)과 대비되는 시스템 전용 정보 |
| **4) [진행 및 예정 챕터 현황]** | 현재 챕터 명칭과 향후 3개 예정 챕터 요약 및 인물 위치 | AI GM | `server.ts: 177` / `parser.ts: 135` | `ParsedMetadata.chapterInfo` 및 `WorldInfoModal`의 Lore 탭 | 서사의 기승전결 템포와 챕터 전환의 방향타 역할 | 2번 복선 씨앗 및 8조의 서사 회수 우선순위와 결합 |
| **5) [주인공 스탯, 소장품 및 5대 메타요소 상태]** | 불변/변화 스탯, 소장품, 신체 결손 등록, 결핍 극복, 닻/세력 변동 내역 | AI GM | `server.ts: 178` / `parser.ts: 137, 169` | `gameState.character.inventory`, `currentGoal`, `disabilities`, `overcameFlaws` | 다음 턴 `systemContext`의 캐릭터 상태란에 그대로 주입 | 3조 고위험 판정 결과(신체 손실)의 실제 영속화 창구 |
| **6) [DC 누적 통계 관리]** | 지금까지 사용된 목표 DC(5~15) 누적 분포 및 이번 턴 DC 배정 사유 | AI GM | `server.ts: 179` / `parser.ts: 139` | `ParsedMetadata.dcStats` | 서버의 `calculateRecommendedDC`와 교차 검증되어 균등 분포 강제 | 3조 DC 분산 통계 규칙 집행 확인 |
| **7) [개연성/맥락 준수 선언]** | 외부 검색을 통한 정사/맥락 대조 완료 여부 공식 선언 ("인터넷 검색을 통해..." 선언) | AI GM | `server.ts: 180` / `parser.ts: 141` | `ParsedMetadata.adherenceDeclaration` | 허풍/환각 방지 및 100% 정직성 수칙 준수 검증 | 1번 팩트체크 보고서와 쌍을 이룸 |

> **[판정 결과]**: 14번 메타데이터 블록은 단순한 AI의 텍스트 출력 형식이 아니라, **AI의 서사 생성과 엔진의 React 상태 객체(복선, 인벤토리, 결손, DC기록)를 실시간으로 브리지(Bridge)하는 핵심 상태 동기화 프로토콜**로 작동합니다.

---

## ⑥ MASTER_SYSTEM_INSTRUCTION 전체 구조

- **정의 위치**: `server.ts` lines 74~206의 `const MASTER_SYSTEM_INSTRUCTION = ...;`
- **로딩 시점**: Node.js 서버 부팅 시점에 메모리에 상주하며, `/api/chat` 요청마다 Gemini 호출 설정(`config.systemInstruction`)에 주입.
- **결합 구조**:
  ```
  MASTER_SYSTEM_INSTRUCTION (상위 헌법: 문체, 14조 표기, 16대 프로토콜, 환각 금지)
        +
  톤앤매너 지침 (선택된 장르별 문체 헌법)
        +
  시스템 컨텍스트 (세계관 정보, 캐릭터 스탯/5대메타/결손, 누적 DC 가이드)
        +
  슬라이딩 윈도우 대화 히스토리 (또는 15턴 무손실 스냅샷)
        +
  플레이어의 최종 입력 선언
  ```
- **시스템 규칙과 서사 규칙의 분리**:
  - 시스템 규칙(DC 균등 분포, 14번 마크다운 코드블록 압축, 환각 금지, 투명성 보고)은 메타데이터 블록으로 격리.
  - 서사 규칙(정통 고전 소설 문체, 상태창 어휘 금지, 직감 스캔 금지, 풍류와 고증 묘사)은 서사 본문에 100% 적용되도록 이원화.
- **매 턴 생성 여부**: `MASTER_SYSTEM_INSTRUCTION` 자체는 불변 헌법으로 고정되어 있으며, 하단의 `systemContext`와 `messages` 배열만 매 턴 동적으로 새로 조립되어 전송됩니다.

---

## ⑦ CSPRNG / 판정 시스템

- **파일 및 함수**: `src/utils/dice.ts` -> `rollCryptoDie(sides)`, `rollD20WithModifier(modifier, targetDC, statName)`
- **난수원**: `window.crypto.getRandomValues(new Uint32Array(1))` (암호학적 안전 난수).
- **결과 범위**: d20 기준 순수 1 ~ 20.
- **판정 방식 (8단계 Outcome)**:
  - Natural 20: `miraculous_success` (기적적 성공)
  - Natural 1: `critical_failure` (치명적 실패)
  - DC 차이 $\ge +7$: `major_success` (대성공)
  - DC 차이 $+4 \sim +6$: `normal_success` (성공)
  - DC 차이 $0 \sim +3$: `narrow_success` (아슬아슬한 성공)
  - DC 차이 $-1 \sim -3$: `narrow_failure` (아슬아슬한 실패)
  - DC 차이 $-4 \sim -6$: `normal_failure` (실패)
  - DC 차이 $\le -7$: `major_failure` (대실패)
- **호출 주체**: **100% 클라이언트(플레이어)**.
  - AI는 서사 본문에서 `[판정 요구: 민첩 판정 (목표 DC 12)]` 형태로 목표치만 제시하고 행동을 멈춤.
  - 클라이언트 파서(`detectDCInText`)가 이를 감지하여 UI에 주사위 투척 모달을 띄움.
  - 플레이어가 버튼을 눌러 브라우저 CSPRNG로 주사위를 굴리고, 산출된 최종 결과 객체(`DiceRollResult`)가 다음 턴 프롬프트에 주입됨.
- **책임 분리**:
  - **코드 결정**: 주사위 눈금 난수 발생, 보정치 합산, 목표치와의 차이값 계산, 8단계 판정 등급 확정.
  - **AI 결정**: 확정된 판정 등급(`miraculous_success`, `major_failure` 등)을 바탕으로 한 문학적 결과 서술 및 대가 집행.
  - AI가 주사위 눈금을 임의로 날조하거나 결과를 뒤집는 것은 구조적으로 원천 차단되어 있습니다.

---

## ⑧ 원작 IP / Google Search

- **실제 동작 경로**:
  ```
  사용자가 1단계에서 Original IP 선택
        ↓
  world.worldMode === 'original_ip' 플래그 확정
        ↓
  server.ts line 824: const isOriginalIP = world?.worldMode === 'original_ip';
        ↓
  const tools = isOriginalIP ? [{ googleSearch: {} }] : [];
        ↓
  callGemini37WithRetry 호출 시 config.tools에 전달 (server.ts: line 944)
        ↓
  Gemini 3.7 Flash 모델이 정사 타임라인, 인물 생애, 무공/아이템 실시간 구글 검색 수행
        ↓
  14번 1항 [외부 검색 보고]에 팩트체크 요약 기록 후 서사 집필
  ```
- **상시 활성화 여부 [확정]**: Google Search 툴은 무조건 켜져 있는 것이 아니며, **`world.worldMode === 'original_ip'`일 때만 조건부로 바인딩**됩니다. 일반 판타지/무협 장르 창작 모드나 커스텀 모드에서는 검색 툴이 주입되지 않아 불필요한 레이턴시 및 토큰 소모를 방지합니다.

---

## ⑨ Gemini 호출 구조 전수 조사

프로젝트 전체 소스코드에 존재하는 모든 Gemini 호출 지점의 전수 명세입니다.

| 호출 위치 (Route / File) | 백엔드 핸들러 함수 | 사용 모델 | Thinking Config | Tools | 호출 조건 | 호출 횟수 / Retry | 호출 결과 사용처 | 상태 (실행 vs 데드코드) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **POST `/api/chat`** (`server.ts: 810`) | `app.post('/api/chat')` | `gemini-3.7-flash` | `thinkingBudget: 4096` | `[{ googleSearch: {} }]` (원작 IP 모드 시만) | 게임 시작 오프닝 및 매 턴 플레이어 행동 선언 시 | 매 턴 1회 / 3회 지수 백오프 (Fail-Fast 적용) | TRPG 서사 본문 생성, 14번 메타데이터 블록 생성, 15번 세이브 발급 | **[실행 핵심 경로]** (실제 게임 메인 엔진) |
| **POST `/api/validate-world`** (`server.ts: 456`) | `app.post('/api/validate-world')` | `gemini-2.5-flash` | 미사용 (경량 모델) | 없음 | 1단계에서 원작명 입력 후 검증 버튼 클릭 시 (딕셔너리 미등록 단어일 때) | 1회 / 단발 호출 | 원작 정사 타이틀, 시놉시스, 주요 세력/시대 배경 JSON 추출 | **[실행 보조 경로]** (월드 생성 1단계) |
| **POST `/api/generate-presets`** (`server.ts: 619`) | `app.post('/api/generate-presets')` | `gemini-2.5-flash` | 미사용 | 없음 | 1단계에서 장르 프리셋 'AI로 새 프리셋 생성' 클릭 시 | 1회 / 3회 재시도 | 10개의 독창적 세계관 프리셋 JSON 생성 | **[실행 보조 경로]** (월드 생성 1단계) |
| **POST `/api/generate-meta-presets`** (`server.ts: 671`) | `app.post('/api/generate-meta-presets')` | `gemini-2.5-flash` | 미사용 | 없음 | 2단계 메타요소 진입 시 또는 '새 메타 풀 생성' 클릭 시 | 1회 / 3회 재시도 | 세계관 맞춤 5대 메타요소(배경, 결핍, 맹세, 닻, 세력) 10~15개 풀 생성 | **[실행 보조 경로]** (메타 생성 2단계) |
| **POST `/api/generate-character-concept`** (`server.ts: 717`) | `app.post('/api/generate-character-concept')` | `gemini-2.5-flash` | 미사용 | 없음 | 3단계 캐릭터 시트에서 'AI 맞춤 컨셉 자동완성' 클릭 시 | 1회 / 3회 재시도 | 세계관/메타 맞춤 캐릭터 이름, 칭호, 나이, 외형, 목표, 6대 스탯 생성 | **[실행 보조 경로]** (캐릭터 생성 3단계) |

> **[조사 결과]**: 프로젝트 내에 방치된 죽은 코드(Dead Code) 호출은 존재하지 않으며, 1~3단계 생성 마법사에서 `gemini-2.5-flash`가 경량 헬퍼로 사용되고, 실제 게임 플레이 턴 루프에서는 **오직 `gemini-3.7-flash` (Deep Thinking Budget 4096)**만이 엄격하게 단독 구동됩니다.

---

## ⑩ 데이터 흐름 (Data Flow)

1. **캐릭터 생성 데이터**: `CreationPhase.tsx`에서 생성 -> `createEmptyCharacter()` 객체에 주입 -> `gameState.character`에 안착.
   - 필드: `name`, `title`, `age`, `gender`, `appearance`, `stats` (`strength`, `agility`, `vitality`, `intellect`, `insight`, `willpower`), `metaElements` (`background`, `flaw`, `oath`, `anchor`, `faction`), `inventory`, `reputation`, `currentGoal`.
2. **세계관 데이터**: `CreationPhase.tsx` 1단계에서 확정 -> `gameState.world`에 안착.
   - 필드: `worldName`, `worldMode` (`original_ip` | `popular_genre` | `custom`), `worldGenre`, `worldPremise`, `toneAndManner`, `npcs`, `factions`, `seeds`, `dcRecords`.
3. **게임 시작 시 확정 데이터**: `handleCompleteCreation` 실행 시 `gameState.phase = 'playing'`, `turnCount = 1` 확정.
4. **플레이어 행동 변환**: 문자열 및 주사위 결과가 `ChatMessage` (`id`, `role: 'user'`, `content`, `turnNumber`, `timestamp`, `isDiceRollTurn`, `diceRollResult`)로 변환.
5. **Gemini 응답 구조**: 백엔드에서 `{ success: true, reply: string, turnNumber: number, isAutoSaveTurn: boolean, autoSaveCode?: string }` JSON 반환.
6. **결과 저장 위치**: 
   - 텍스트 원문: `assistantMsg.rawContent`
   - 정제 서사: `assistantMsg.content`
   - 파싱 메타데이터: `assistantMsg.metadata`
   - 복선: `gameState.world.seeds`
   - DC 기록: `gameState.world.dcRecords`
   - 소장품/결손: `gameState.character`
   - 로컬 영속화: 브라우저 `localStorage` (`TRPG_ENGINE_SESSION_V1`)
7. **다음 턴 활용**: 직전 턴의 `character`, `world`, `messages`가 다음 `fetchGMResponseWithRetry`의 입력 페이로드로 그대로 재투입.

---

## ⑪ 엔진의 실제 중심축

프로젝트 전체에서 게임의 진행을 물리적으로 통제하는 가장 핵심적인 파일과 함수는 다음과 같습니다.

- **프론트엔드 통제 중심**: `src/App.tsx`의 **`handleSendMessage`** 및 **`gameState` State Dispatcher**
- **서버 서사 조율 중심**: `server.ts`의 **`app.post('/api/chat')` Route Handler** 및 **`MASTER_SYSTEM_INSTRUCTION`**
- **규칙-서사 브리지 중심**: `src/utils/parser.ts`의 **`parseGMResponseMetaData`**

```
                     [핵심 엔진 (TRPG Engine 3.1)]
                                  │
    ┌─────────────────────────────┼─────────────────────────────┐
    ▼                             ▼                             ▼
 [입력 통제]                   [상태 저장소]                 [판정 & 난수]
 App.tsx (handleSendMessage)   App.tsx (gameState)           dice.ts (rollCryptoDie)
    │                             │                             │
    └─────────────────────────────┼─────────────────────────────┘
                                  ▼
                         [프롬프트 조립기]
                         server.ts (/api/chat)
                         - MASTER_SYSTEM_INSTRUCTION
                         - Token Diet (Sliding Window)
                         - DC 균등 가이드 계산
                                  │
                                  ▼
                         [인공지능 GM 엔진]
                         Gemini 3.7 Flash (Thinking: 4096)
                                  │
                                  ▼
                         [상태 동기화 파서]
                         parser.ts (parseGMResponseMetaData)
                         - 14번 메타데이터 추출
                         - 복선 / 결손 / 소장품 추출
                         - DC 판정 요구 감지
                                  │
                                  ▼
                         [출력 및 UI 렌더링]
                         GameInterface.tsx (서사 본문)
                         MetadataAccordion.tsx (메타데이터)
                         WorldInfoModal.tsx (인물록)
                                  │
                                  ▼
                         [다음 턴 루프 순환]
```

---

## ⑫ AI와 코드의 책임 분리

- **질문 A: 이것은 단순한 "Gemini에게 프롬프트를 보내는 앱"인가?**
  - **[판정: 아니다.]** 본 시스템은 클라이언트 측에 상태 머신(`GameState`), CSPRNG 난수 엔진, 응답 분리 파서(`parser.ts`), 15턴 토큰 다이어트/스냅샷 직렬화기(`snapshot.ts`), 로컬 및 분산 클라우드 KV 세이브 시스템을 완전히 구축하고 있으며, Gemini는 이 구조화된 파이프라인의 "서사 생성 GM 코어"로 결합되어 있습니다.
- **질문 B: 자체적인 게임 엔진이 존재하는가?**
  - **[판정: 그렇다.]** 팩토리 함수 기반 초기화, 8단계 DC 판정기, 복선 생멸 추적기, 영구 신체 결손 동기화기, DC 5~15 균등 분포 분산 알고리즘이 순수 TypeScript 코드로 실행됩니다.
- **질문 C: 게임의 규칙과 상태를 코드가 얼마나 통제하고 있는가?**
  - 주사위 난수 생성, 판정 성공/실패 등급 확정, 턴 수 계산, 세이브/로드 직렬화, 토큰 다이어트 슬라이딩 윈도우 잘라내기는 **코드가 100% 통제**합니다.
- **질문 D: AI가 임의로 결정할 수 있는 영역은 어디까지인가?**
  - 세계관 고증에 기반한 문학적 묘사, NPC의 대사와 주관적 심경(💭), 사건의 전개 방식, 플레이어 행동에 대한 서사적 대가(Consequences), 새로운 복선 씨앗의 생성 내용.
- **질문 E: AI가 실수해도 코드가 보호해주는 영역은 어디까지인가?**
  - **Fail-Open Safe Stub (`parser.ts`)**: AI가 마크다운 코드블록 형식을 깨뜨리거나 누락하더라도, 정규식 대체 검사 및 안전 스텁(`createSafeStubMetadata`)을 주입하여 UI 데드락이나 크래시를 완벽히 방지합니다.
  - **Fail-Fast Error Filter (`server.ts`)**: 429(할당량 소진) 등 치명적 에러 발생 시 무의미한 재시도를 즉시 중단하고 유저에게 명확히 보고합니다.
  - **문체 오염 차단**: 14번 메타데이터를 서사 본문에서 완전히 잘라내어 플레이어에게는 순수한 문학 텍스트만 보여줍니다.
- **질문 F: 반대로 AI에게 지나치게 의존하고 있는 부분은 무엇인가?**
  - NPC의 호감도/심경 변화와 신체 결손 등록 여부를 AI의 5번 라인 텍스트 출력에 의존하고 있어, AI가 메타데이터 라인에 결손을 누락할 경우 코드 레벨에서 강제로 캐릭터 시트에 주입하기 어렵습니다.

---

## ⑬ 현재 확인된 구조적 위험

[확정] 및 [논리적 가능성] 기준으로 분류한 잠재적 위험 목록입니다.

1. **[확정] AI의 14번 메타데이터 형식 미준수 시 동기화 누락 위험**:
   - AI가 14번 코드블록의 5번 항목(`[주인공 스탯 및 소장품]`) 형식을 지키지 않고 서사 본문으로만 소장품 획득이나 부상을 서술할 경우, `parser.ts`의 정규식 매칭이 스킵되어 `character.inventory`나 `disabilities`에 자동 반영되지 않을 수 있음 (단, `isFailOpenFallback` 덕분에 앱이 멈추지는 않음).
2. **[확정] 15턴 자동 세이브 스냅샷 생성 시 이전 메시지 Truncation**:
   - `server.ts` line 861에 따라 스냅샷이 활성화되면 이전 메시지를 잘라내고 최근 6개 메시지만 슬라이딩 윈도우로 유지함. 스냅샷 문자열에 담기지 않은 미세한 세부 묘사는 이후 턴의 AI 컨텍스트에서 제외될 수 있음 (토큰 절약 설계의 트레이드오프).
3. **[논리적 가능성] 브라우저 CSPRNG 미지원 환경 Fallback**:
   - `dice.ts` line 11에서 `window.crypto`가 없는 비표준 환경일 경우 `Math.random()`으로 폴백되므로, 브라우저 표준 환경이 아닐 경우 암호학적 안전 난수 보장이 약화될 수 있음 (최신 브라우저 환경에서는 안전).
4. **[확정] In-Memory KV 저장소의 재부팅 휘발성**:
   - `server.ts`의 클라우드 세이브는 Upstash Redis 환경변수가 없을 경우 메모리 `Map`에 저장되므로, 컨테이너 서버가 재시작되면 6자리 동기화 코드가 초기화될 수 있음 (클라이언트 `localStorage` 및 JSON 파일 내보내기/가져오기로 보완 가능).

---

## ⑭ 아직 확인하지 못한 부분

- **[미확인] 실제 원작 IP 검색 시 구글 서치 그라운딩의 최신성 한계**:
  - Gemini 3.7 Flash 모델의 Google Search 도구가 매우 마이너한 팬픽션이나 실시간 연재 중인 최신 웹소설 화수(예: 어제 연재분)까지 100% 완벽하게 교차 검증하는지의 실제 검색 적중률은 네트워크/검색엔진의 실시간 응답에 종속되므로 정적 코드 분석만으로는 단정할 수 없음.

---

## ⑮ 3.1 엔진 한 장의 구조도 (ASCII Architecture Diagram)

```
====================================================================================================
                                  TRPG ENGINE 3.1 FULL ARCHITECTURE
====================================================================================================

                                            [ PLAYER ]
                                                │
                                                │ (User Input / Click Action)
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ FRONTEND CLIENT - React 18 + TypeScript (src/) ]                                               │
│                                                                                                  │
│   ┌───────────────────────────┐      ┌───────────────────────────┐      ┌────────────────────┐   │
│   │ GameInterface.tsx         │      │ CreationPhase.tsx         │      │ WorldInfoModal.tsx │   │
│   │ - Text Input Stream       │      │ - 3-Phase Wizard          │      │ - NPCs (Class A/B) │   │
│   │ - MetadataAccordion View  │      │ - World/Meta/Char Presets │      │ - Factions / Seeds │   │
│   └─────────────┬─────────────┘      └─────────────┬─────────────┘      └────────────────────┘   │
│                 │                                  │                                             │
│                 ▼                                  ▼                                             │
│   ┌──────────────────────────────────────────────────────────────┐      ┌────────────────────┐   │
│   │ CSPRNG Dice Engine (src/utils/dice.ts)                       │      │ Web Audio Engine   │   │
│   │ - window.crypto.getRandomValues()                            │◄────┤ (src/utils/audio)  │   │
│   │ - 8-Tier Outcomes (Natural 1/20, DC diff >= 7)               │      │ - Synth SFX/BGM    │   │
│   └─────────────────────────────┬────────────────────────────────┘      └────────────────────┘   │
│                                 │                                                                │
│                                 ▼                                                                │
│   ┌──────────────────────────────────────────────────────────────┐      ┌────────────────────┐   │
│   │ Client Game State Engine (App.tsx)                           │      │ Local Persistence  │   │
│   │ - GameState (world, character, messages, dcRecords)          │◄────►│ - localStorage     │   │
│   │ - 15-Turn Lossless Snapshot Packer (snapshot.ts)             │      │   TRPG_SESSION_V1  │   │
│   └─────────────────────────────┬────────────────────────────────┘      └────────────────────┘   │
└─────────────────────────────────┼────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP POST /api/chat (Fetch with Exponential Backoff)
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ BACKEND SERVER - Express Runtime (server.ts) ]                                                 │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Prompt Orchestrator & Token Diet Engine                                                  │   │
│   │ - Master System Instruction (Rev 3.0 Constitution, 16 Protocols, Tabula Rasa)            │   │
│   │ - Balanced DC 5~15 Uniform Distribution Calculator (calculateRecommendedDC)              │   │
│   │ - Dynamic Context Swapping (15-Turn Snapshot vs. 20-Message Sliding Window)              │   │
│   │ - Conditional Google Search Grounding Binding (Only if worldMode === 'original_ip')      │   │
│   └─────────────────────────────────────────┬────────────────────────────────────────────────┘   │
│                                             │                                                    │
│                                             ▼                                                    │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Gemini 3.7 Flash Core Invoker (callGemini37WithRetry)                                    │   │
│   │ - Model: 'gemini-3.7-flash'                                                             │   │
│   │ - Thinking Config: { thinkingBudget: 4096 }                                              │   │
│   │ - Fail-Fast Safety Guard (429 Quota / 401 Auth Immediate Breakout)                       │   │
│   └─────────────────────────────────────────┬────────────────────────────────────────────────┘   │
│                                             │                                                    │
│                                             ▼                                                    │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │ External Cloud Storage Integration                                                       │   │
│   │ - In-Memory Map Store & Upstash Redis / Vercel KV REST Endpoints                        │   │
│   │ - 6-Digit Collision-Resistant Sync Code Engine (generateSyncCode)                        │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┼────────────────────────────────────────────────────────────────┘
                                  │
                                  │ AI Response Payload (Raw Reply with 14th Meta & 15th Save Block)
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ RESPONSE PARSER & STATE SYNCHRONIZER (src/utils/parser.ts) ]                                   │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Regex Extraction & State Bridge                                                          │   │
│   │ 1. Strip & Extract 15th Save Package Markdown Block                                      │   │
│   │ 2. Strip & Extract 14th Metadata Block (1~7 Items: Search, Seeds, CameraOff, DC, Stats)  │   │
│   │ 3. Extract Live Character Mutations (Inventory, Current Goal, Physical Disabilities)     │   │
│   │ 4. Detect DC Check Requests in Narrative Prose (detectDCInText)                          │   │
│   │ 5. Fail-Open Safe Stub Injection (Guarantees Zero Crashes on Format Anomaly)             │   │
│   └─────────────────────────────────────────┬────────────────────────────────────────────────┘   │
└─────────────────────────────────┼────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ STATE RE-RENDER & NEXT TURN LOOP ]                                                             │
│                                                                                                  │
│   - Pure Literary Narrative Prose ───► Rendered in Chat Stream (GameInterface.tsx)               │
│   - Structured Metadata (1~7)     ───► Rendered in Collapsible MetadataAccordion.tsx             │
│   - Seeds & Faction Statuses      ───► Synchronized into WorldInfoModal.tsx                      │
│   - Character Disabilities/Items  ───► Synchronized into CharacterSheetModal.tsx                 │
│   - Pending DC Check              ───► Activates Dice Roller UI for Player CSPRNG Roll           │
│                                                                                                  │
│   =======================> READY FOR NEXT PLAYER TURN <=======================                   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---
*본 보고서는 소스코드 분석을 통해 작성된 기술 역추적 문서입니다.*
