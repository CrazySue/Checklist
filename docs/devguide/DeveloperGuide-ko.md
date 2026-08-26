# 체크리스트 개발 가이드

> [!TIP]
> 이 문서는 개발자를 위한 기술 문서입니다: 아키텍처, 빌드 파이프라인, 테스트와 함정 기록.  
> 프로젝트 소개, 기능과 다운로드 방법은 [README](https://github.com/CrazySue/Checklist/blob/main/docs/readme/README-ko.md)를 참조하세요.  

> 현재 버전: `Release v1.0.0` ｜ 저장소: https://github.com/CrazySue/Checklist

---

## 🏗️ 아키텍처 개요

### 🧱 단일 파일 구조

앱은 **하나의 HTML 파일**（약 40 MB）이며, 내부는 위에서 아래로 네 개의 레이어로 나뉩니다:

| 영역 | 내용 |
| --- | --- |
| `<head>` 내 `<style id="embedded-fonts">` | 3개의 `@font-face`（HarmonyOS Sans SC 400/500/700 + Material Symbols Rounded）, base64 내장, `font-display:swap` |
| `<head>` 내 메인 `<style>` | 전체 CSS: 디자인 토큰 → 컴포넌트 스타일 → 애니메이션 → 반응형（`html.landscape` 가로 화면 왼쪽 바 포함） |
| `<body>` | 앱 스켈레톤: 상단 바 / 검색 바 / 절대 위치로 겹쳐진 세 개의 페이지 컨테이너 / 하단 바 + 팝업（아이콘 선택, 언어 선택, Toast） |
| `<script>` | 전체 JavaScript（약 3800줄）: 상태 → 유틸리티 → i18n → 테마/레이아웃 → 렌더링 → 폼 → 데이터 교환 → 설정 → 시작 |

### 🔀 데이터 흐름

**「상태 집중 + 렌더링 함수 + DOM 직접 조작 애니메이션」**의 하이브리드 모델:

```text
사용자 상호작용
   │
   ├── 데이터 변경 ──→ Store.save()（localStorage 영속화）
   │                   └──→ renderXxx()를 명시적으로 호출해 해당 영역 재렌더링
   │
   └── 순수 시각적 변경（체크, 페이지 넘기기, 리플）──→ DOM / 인라인 스타일 직접 조작（재렌더링 없음）
```

> [!WARNING]
> 애니메이션이 수반되는 상태 변경은 반드시 **DOM을 직접 조작**해야 하며, 전체 재렌더링을 유발하면 안 됩니다.

### 🗂️ 상태 모델

`localStorage` 키 `checklist_app_state_v1`에 영속화됩니다:

```js
state = {
  checklists: [
    { id, name, icon, resetHours,          // icon: 'auto' | 아이콘 이름
      items: [{ id, text, icon, done }],
      completedAt, createdAt }
  ],
  activeChecklistId: id | null,
  settings: {
    theme: 'auto' | 'light' | 'dark',
    itemHeight: 64,        // 56~120
    firstOnly: false,      // 첫 번째 항목에만 사용자 지정 높이 적용
    language: 'auto' | 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru' | 'pt'
  }
}
```

임시 상태（영속화되지 않음）는 모듈 수준 변수로 관리됩니다: `currentPage`, `formMode`（`'new'|'edit'`）, `formState`, `settingsFromPage`, `titleFlipDir`, `titleAnimToken`, `switchAnimToken`, `currentHomeView` 등.

---

## 📂 저장소 구조（GitHub）

```text
.
├── .github/              행동 강령과 Issue 템플릿
├── docs/                 문서
├── build/                패치 파이프라인, 키워드 마스터 데이터와 테스트 스위트
├── README.md             자체 소개 파일
└── LICENSE.txt           라이선스
```

---

## 🚀 환경 및 테스트 시작하기

### 📦 환경 요구 사항

- 앱 실행: 모든 최신 브라우저 / HBuilderX로 패키징한 APK;
- 빌드 및 테스트: Node.js ≥ 16（Node 24에서 검증됨）; `build/node_modules`에 jsdom 의존성이 내장되어 있습니다.

### 🧪 테스트 실행하기

```bash
node build/_extract099.js && node --check build/_check099.js   # 문법 검사
node build/_sim099.js                                          # 사용자 동작 시뮬레이션（73개 어서션）
node build/_smoke099.js && node build/_smoke099b.js            # 회귀 테스트
```

모두 `ALL PASS`를 출력하고 `uncaught errors: 0`이어야 통과로 인정됩니다.

---

## 🛠️ 빌드 파이프라인과 개발 워크플로우

### 🔁 버전 패치 파이프라인

버전 업그레이드 = 이전 버전 HTML에 Node 패치 스크립트를 적용하는 것입니다. 각 스크립트의 `apply(old, new, count)`는 매칭 횟수를 검증하며, 하나라도 일치하지 않으면 쓰기를 중단합니다.

| 스크립트 | 역할 |
| --- | --- |
| `upgrade_v09.js` + `patch_v09_css.js` + `keywords_v09.js` + `embed_font_v09.js` + `rebuild_v09.js` | 0.8.0 → 0.9.0 |
| `upgrade_v095.js` / `upgrade_v095b.js` | → 0.9.5 |
| `upgrade_v096.js` / `upgrade_v096b.js` | → 0.9.6 |
| `upgrade_v097.js` | → 0.9.7 |
| `upgrade_v098.js` | → 0.9.8 |
| `upgrade_v099.js` + `upgrade_v099b.js` + `upgrade_v099c.js` + `remove_icons_v099.js` | → 0.9.9 |
| `upgrade_v100.js` | → 1.0.0 |

### ✏️ 코드를 올바르게 수정하는 방법

1. 대상 버전의 HTML을 직접 편집합니다（단일 파일, 보이는 대로 편집 가능）;
2. 수정 사항을 해당 `upgrade_vXXX.js`에 **동기화**합니다（이전 버전에서 원클릭으로 재구축할 수 있도록）;
3. 문법 검사와 시뮬레이션/회귀 테스트가 모두 통과한 뒤 커밋합니다.

### 🎛️ 아이콘 및 키워드 추가/삭제

- 아이콘 라이브러리: `ICON_LIBRARY`（분류 키 `daily / travel / shopping / sports / leisure / food / health / work / other`）;
- 아이콘 추가: 분류 배열에 아이콘 이름 추가 → `build/keywords_v09.js`에 `[icon, {언어: '키워드|키워드'}]` 추가 → `AUTO_ICON_KEYWORDS` 블록 재구축;
- 아이콘 삭제: 라이브러리와 키워드 데이터에서 동시에 삭제한 뒤 재구축（`remove_icons_v099.js` 참고）;
- 검증: 언어별 키워드 ≥ 200개; 아이콘 이름은 반드시 내장 폰트와 `ICON_LIBRARY`에 존재해야 합니다.

### 🌍 언어 추가하기

`I18N`에 새 사전 추가（키 집합은 다른 언어와 동일）→ `LANGUAGES`에 등록 → 키워드 라이브러리를 ≥ 200개로 채움 → `getLang()`（auto → 정확 일치 → 접두사 일치 → zh-CN 폴백）.

---

## 🧩 코드 구조 상세

### 🎨 디자인 토큰과 CSS 레이어링

```css
:root{
  --brand-1:#10172F; --brand-2:#283558; --brand-3:#525288; --brand-4:#A5A8BA;  /* 브랜드 4색 */
  --md-primary:#525288; --md-primary-container:#E1E0FF; …                         /* MD3 파생 팔레트 */
  --md-easing-standard / emphasized / accelerated / decelerated;                  /* 모션 토큰 */
  --md-dur-short:150ms; --md-dur-medium:250ms; --md-dur-long:400ms;
}
```

CSS 레이어링: 리셋 → 폰트 → 토큰 → 모션 → 스켈레톤 → 상단 바 → 페이지 컨테이너 → 목록 항목 → 하단 바 → 버튼/FAB → 폼 → 검색 → 설정 → 팝업/Toast → 반응형. 다크 테마는 `[data-theme="dark"]`로 변수를 오버라이드하여 구현되며, 모든 색상 변화는 `*{transition-property:…;transition-duration:.25s}`를 통해 부드럽게 전환됩니다.

### ⚙️ JS 모듈 맵

| 블록 | 핵심 함수 |
| --- | --- |
| 상태 | `Store`（load/save/set） |
| 유틸리티 | `$` `$$` `el` `uid` `attachRipple` `initGlobalRipple` |
| 아이콘 매칭 | `normText` `latinMatch` `autoIconFor` `resolveIcon` |
| i18n | `getLang` `t` |
| 테마/레이아웃 | `applyTheme` `updateLayout` |
| 상단 바 | `renderTopbar` `setTopbarTitle` |
| 홈 | `renderHome` `showHomeView` `completeItem` `resetChecklist` `checkAutoReset` |
| 하단 바/페이지 넘기기 | `renderBottombar` `switchChecklist` `switchPage` |
| 폼 | `openForm` `renderForm` `renderFormItems` `appendFormItem` `refreshChecklistIconRow` |
| 데이터 교환 | `handleExport` `downloadViaAnchor` `finishImport` `handleImport` |
| 설정 | `renderSettings` `toggleDropdown` `openLanguageMenu` |
| 팝업 | `openIconPicker` `renderIconPickerGrid` `selectIcon` |
| 이동 | `openSettingsFrom` `goBackFromSettings` `openExternal` |
| 애니메이션 유틸리티 | `swapIcon` `popIcon` `smoothCenter` |
| 시작 | `bindEvents` `updateStaticLabels` `init` |

### ✨ 애니메이션 시스템

- **인터럽트 토큰 패턴**: 모든 인터럽트 가능한 애니메이션（페이지 넘기기, 타이틀, 스크롤, 아이콘 교체）은 증가하는 토큰을 보유하며, 타이머 콜백은 먼저 토큰을 검증하고 새 애니메이션에 인터럽트되면 조용히 종료됩니다;
- **페이지 넘기기/전환**: 이전 콘텐츠가 150ms 동안 가속하며 40px 슬라이드 아웃 + 페이드 아웃 → 새 콘텐츠가 반대 방향에서 40px, 300ms 동안 감속하며 슬라이드 인（`switchPage`와 `switchChecklist` 동일）;
- **타이틀 플립**: 전체 타이틀이 140ms 동안 플립 아웃 → 240ms 동안 감속 플립 인, 방향은 페이지 넘기기 방향에 따라 결정됩니다（앞으로 가면 위로, 뒤로 가면 아래로）;
- **커피 페이지**: 등장/퇴장은 `@keyframes` 사용（Android에서 안정적）; 체크리스트 전환 시 "특수 체크 항목"으로 취급되어 스크롤 영역과 함께 플립됩니다（`instant` 경로에서는 자체 애니메이션 비활성화）;
- **FLIP**: 체크 항목 완료 시 CSS transition으로 높이를 접으며, 전체 재렌더링은 하지 않습니다.

---

## 📱 APK 패키징（HBuilderX）

### 📦 절차

새 5+ App 프로젝트 생성（패키지 이름 `com.crazysue.checklist`）→ HTML을 엔트리 페이지로 배치 → manifest.json 편집 → 클라우드/오프라인 패키징 → 인증서 → 패키징.

### 🔌 사용된 plus API

| API | 용도 |
| --- | --- |
| `plus.io.requestFileSystem(plus.io.PRIVATE_DOC, …)` | .checklist를 앱 전용 디렉터리로 내보내기（**다시 공용 디렉터리 방식으로 바꾸지 말 것**） |
| `plus.runtime.openURL(url)` | 외부 링크를 시스템 기본 브라우저로 열기 |
| `plus.os.name` | 플랫폼 판별（Android 가져오기 시 **accept 없이** 필터링） |

### ⚠️ 플랫폼 함정 체크리스트

- Android 파일 입력은 `accept`를 반드시 제거해야 합니다. 그렇지 않으면 시스템 선택기에서 모든 파일을 선택할 수 없습니다;
- Android 10+의 공용 Download 폴더 쓰기（File 경로/MediaStore/SAF）는 일부 기기에서 전부 실패합니다（0바이트 파일） — v1.0은 결국 앱 전용 디렉터리로 폴백했습니다;
- `window.open(url,'_blank','noopener')`는 탭을 두 개 엽니다 — 외부 링크는 앵커 또는 `plus.runtime.openURL`을 사용하세요;
- `scrollTo({behavior:'smooth'})`는 구형 WebView에서 조용히 실패합니다 — 커스텀 스크롤은 rAF + 이징으로 `scrollTop`에 직접 기록하세요;
- `screen.orientation`은 창이 아닌 모니터를 반영합니다 — 세로/가로 화면은 창 자체의 비율로만 판단하세요;
- 핵심 등장/퇴장 애니메이션은 "초기 상태→클래스 전환" transition이 아닌 `@keyframes`를 사용하세요;
- inline-block은 앞쪽 공백을 접습니다 — 타이틀 접미사는 inline으로 유지하세요;
- 리플을 pointerup 시 즉시 제거하면 너무 빨라 보입니다 — 손을 뗀 뒤에도 끝까지 재생되도록 하세요.

---

## 🧠 핵심 기술 결정과 함정 기록

| 주제 | 결정 | 이유 |
| --- | --- | --- |
| 페이지 방향 모델 | 새로 만들기/설정 페이지는 항상 오른쪽에서 슬라이드 인; 체크리스트 페이지는 왼쪽에서 슬라이드 인; 설정에서 "뒤로" 이동 시 새로 만들기 페이지 방향이 반전 | 사용자의 멘탈 모델과 일치 |
| 타이틀 애니메이션 종료 상태 | 전체 타이틀（이름 + "체크리스트"）이 함께 위아래로 플립되며 모든 페이지에 적용 | 초기 "이름 플립 + 접미사 이동" 이중 트랙 방식은 순간 이동/겹침 문제가 반복됨 |
| 커피 페이지 | 전환 시 스크롤 영역과 함께 플립; 리셋 시 아래로 이동하며 페이드 아웃 | 페이지 넘기기 느낌 통일 |
| 자동 빈 줄 | 끝에는 항상 삭제 버튼이 없는 자동 줄이 하나 있음; 이전 항목을 비우면 애니메이션으로 제거; 첫 항목을 비워도 삭제하지 않음 | 입력 경험과 "숨겨진 버튼 없음"의 균형 |
| 내보내기 | 앱 전용 디렉터리（APK）/ 앵커 다운로드（Web） | Android 버전 간 안정성 |
| 아이콘 키워드 | 언어별 630+개 단어, 현재 언어 우선, 영어 폴백, 서양 문자는 정확한 단어 매칭 | 적중률과 오탐의 균형 |

---

## 🧪 테스트 가이드

### 🧰 도구 체인

- **jsdom**: HTML 로드 전에 base64 리소스를 제거해 속도를 높이고, `beforeParse`에서 상태 시드와 폴리필（`scrollIntoView`/`matchMedia`/`URL.createObjectURL` 등）을 주입합니다;
- **`_sim099.js`**: 동작 시뮬레이션 — 실제 DOM 이벤트로 전체 사용자 흐름을 구동하고, 애니메이션 중간 상태를 샘플링해 타이밍을 검증합니다;
- **`_smoke099.js` / `_smoke099b.js`**: 기능 회귀 + 코드 문자열 수준 검사.

### 📝 시뮬레이션 예시

```js
// beforeParse: 상태 시드 + 레이아웃 지오메트리 mock
window.localStorage.setItem('checklist_app_state_v1', JSON.stringify(state));
window.Element.prototype.getBoundingClientRect = function(){ /* 필요에 따라 반환 */ };
// 실제 이벤트 구동 + 중간 상태 샘플링 검증
input.focus(); input.value='물 마시기';
input.dispatchEvent(new w.Event('input', {bubbles:true}));
await sleep(60); check('자동 빈 줄 애니메이션 제거', !!document.querySelector('.form-item.removing'));
```

### ✅ 출시 전 체크리스트

- [ ] `node --check` 문법 통과;
- [ ] `_sim099.js` 연속 2회 모두 통과;
- [ ] `_smoke099.js`, `_smoke099b.js` 모두 통과;
- [ ] 버전 번호, 삭제 항목 잔재, 핵심 API 마커 grep 확인;
- [ ] 실기기 검증: 내보내기/가져오기/외부 링크/라이트·다크/세로·가로/타이틀 플립/리플.

---

## 🎨 디자인 규격 요약（MD3）

- 테마 4색: `#10172F` `#283558` `#525288` `#A5A8BA`; 라이트는 `#525288`, 다크는 `#283558`를 시드로 파생;
- 상태 레이어: hover 8% / active 12% 투명 블랙;
- 폰트: HarmonyOS Sans SC（400/500/700, **서브셋 금지** — 사용자 콘텐츠에는 어떤 한자든 포함될 수 있음）;
- 아이콘: Material Symbols Rounded（가변 폰트, `font-variation-settings`로 FILL/wght 제어）, 반드시 Google Fonts에서 가져와야 함;
- 모션: 플립 인/페이드 인/리플/스케일만 허용, 갑자기 나타나거나 사라지는 것 금지; 이징과 지속 시간은 항상 토큰 사용;
- 스위치: 0.8.0 규격（끔 12px / 켬 24px）, 누름 스트레치 없음, emphasized 비선형 전환.

---

## 📜 버전 이력

| 버전 | 주요 내용                                                                     |
| ----- | ------------------------------------------------------------------------- |
| 0.7.0 | 최초 사용 가능 버전（파일 용량이 너무 커서 GitHub에 업로드할 수 없었음）                              |
| 0.8.0 | 초기 리뷰 기준선                                                                 |
| 0.9.0 | 하단 바 포커스, 커피 페이지 넘기기, 편집 페이지 내비게이션, 아이콘 분류 현지화, 언어별 200+ 키워드, .checklist 내보내기, 후원 버튼, 리플 클리핑, 가로 화면 왼쪽 바, Bold 내장 |
| 0.9.5 | 페이지 넘기기 방향 규칙, 편집↔새로 만들기 플립, 스위치 규격, 자동 빈 줄, 타이틀 이동 애니메이션                 |
| 0.9.6 | 설정 뒤로 가기 방향, Android 내보내기/가져오기, 타이틀 상하 플립, 다크 전환, 가로 화면 판단 재작성            |
| 0.9.7 | 타이틀 애니메이션 타이밍, 커피 페이지 페이드 아웃, 빈 줄 정리, 스위치 0.8.0 규격 복귀, 크레딧 통합                 |
| 0.9.8 | Android 포커스 중앙 정렬, 가져오기 accept 제거, 3단계 내보내기 체인, 타이틀 통합 연출, 리플 가속, 성능 최적화  |
| 0.9.9 | 전체 타이틀 플립 전 페이지 적용, 페이지 넘기기 애니메이션 40px 통일, 아이콘 정리, 전체 요소 테마 전환, 포커스 이징 스크롤, 빠른 인터럽트 |
| 1.0.0 | 내보내기 전용 디렉터리 복귀, 드롭다운 빠른 인터럽트, 데드 코드 정리, 시작 최적화 —— 🎉 정식 버전               |
