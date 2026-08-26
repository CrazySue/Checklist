# 체크리스트

![background](../background.png)

> MD3 스타일의 할 일 목록, 이제 어떤 일도 잊지 마세요.

[![Download Release](https://img.shields.io/badge/Download-Release-blue.svg)](https://github.com/CrazySue/Checklist/releases) [![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/CrazySue/Checklist/blob/main/LICENSE.txt) [![Platform Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://github.com/CrazySue/Checklist/releases) [![Made by GLM-5.2](https://img.shields.io/badge/Made_by-GLM5.2-red.svg)](https://github.com/zai-org/GLM-5) [![Maintain by DeepSeek V4 Pro](https://img.shields.io/badge/Maintain_by-DeepSeek_V4_Pro-orange.svg)](https://github.com/deepseek-ai/DeepSeek-V4)

[English](README-en.md) | [简体中文](README-zh_CN.md) | [繁體中文](README-zh_TW.md) | [日本語](README-ja.md) | 한국어 | [Français](README-fr.md) | [Deutsch](README-de.md) | [Español](README-es.md) | [Русский](README-ru.md) | [Português](README-pt.md)

**체크리스트**는 MD3 디자인 언어를 사용하는 할 일 목록 앱입니다.

---

## ✨ 기능

- **단일 파일**: 앱 전체가 하나의 HTML 파일이며, 폰트·아이콘 폰트·앱 아이콘이 모두 내장되어 있어 더블 클릭만으로 오프라인에서 실행할 수 있습니다;
- **MD3 디자인 언어**: 완전한 MD3 디자인 토큰, 상태 레이어, 리플, 비선형 이징 모션;
- **현지화**: 10개 언어 지원（简体中文、繁體中文、English、日本語、한국어、Français、Deutsch、Español、Русский、Português）;
- **스마트 아이콘 선택**: 체크 항목 / 체크리스트 이름에 따라 아이콘을 자동으로 매칭합니다（언어별 630+ 키워드 인덱스）;
- **자동 리셋**: 모든 항목을 완료한 뒤 타이머를 설정해 자동으로 리셋할 수 있어, 새로운 하루를 맞이할 수 있습니다;
- **간편한 공유**: .checklist 파일 내보내기 / 가져오기（내부는 JSON）, 데이터가 절대 유실되지 않습니다;
- **세로/가로 화면 자동 대응**: 세로 화면에서는 하단 바, 가로 화면에서는 왼쪽 내비게이션 바;
- **다크 모드**: 시스템 / 라이트 / 다크 모드를 따르며, 전체 UI가 부드럽게 전환됩니다.

---

## 📱 스크린샷

| ![홈 화면](../pictures/picture-1.png)  | ![체크리스트 편집](../pictures/picture-2.png) | ![설정](../pictures/picture-3.png) |
| ------------------------------- | -------------------------------- | ----------------------------- |
| ![아이콘 선택](../pictures/picture-4.png) | ![검색](../pictures/picture-5.png)    | ![완료](../pictures/picture-6.png) |

---

## 📥 다운로드

- 최신 버전은 [GitHub Releases](https://github.com/CrazySue/Checklist/releases)에서 APK를 다운로드하세요;
- 웹 버전도 바로 사용할 수 있습니다: 저장소에 있는 HTML 파일을 열기만 하면 실행됩니다;

---

## 🎥 개발 배경

요즘 사람들은 해야 할 일이 점점 많아지고 있습니다. 생일 파티에 참석하고, 친구와 영화를 보는 일까지…… 그래서 많은 캘린더 앱에는 이미 일정 기능이 내장되어, 중요한 일을 잊지 않도록 알려 주고 있습니다.

하지만 문제는 해결되지 않았습니다. 집을 나선 뒤 교통카드를 안 가져온 것을 잊었다면? 퇴근한 뒤 업무 일지를 제출하지 않은 것을 잊었다면? 오히려 "큰일"을 이루는 그 "작은 일"들이 사람들의 진도를 늦추고 있습니다.

이에 이 문제로 고생해 온 Sue는 이 문제를 해결하기 위해 할 일 목록 앱을 개발하기로 결심했습니다. 체크리스트는 그런 큰일을 알려 주지 않습니다. 많은 캘린더 앱이 더 잘 처리할 뿐만 아니라, 큰일은 사실 잊기 어렵기 때문입니다. 대신 여러 단계가 필요한 작은 일들을 목록으로 정리해, 하나를 끝낼 때마다 체크해 나갈 수 있게 해 줍니다. **이제 어떤 일도 잊지 않게 됩니다.**

---

## 🛠️ 빌드 시작하기

체크리스트는 HTML을 프로그래밍 언어로 사용하는 5+ App으로, HBuilderX를 통해 APK 설치 패키지로 빌드됩니다.

> [!NOTE]
> HBuilderX로 HTML을 패키징하는 방법과 튜토리얼은 셀 수 없이 많으므로, 여기서는 간소화된 빌드 방법만 소개합니다. 자세한 내용은 [HBuilderX 문서](https://hx.dcloud.net.cn/)를 참조하세요.

HTML 파일을 직접 운영체제용 설치 패키지로 만들려면 다음을 따르세요:

1. [HBuilderX 다운로드](https://www.dcloud.io/hbuilderx.html).
2. 새 5+ App 프로젝트를 만듭니다.
3. index.html을 패키징할 HTML 파일로 교체합니다.
4. manifest.json에서 수정할 옵션을 편집합니다.
5. 클라우드 패키징 또는 오프라인 패키징을 사용합니다.
6. 앱 인증서를 업로드합니다（클라우드 패키징에서는 클라우드 인증서 사용 가능）.
7. 패키징합니다.

---

## 🧭 개발 참여

코드를 읽어 보거나, 버그를 수정하거나, 기능을 추가하고 싶으신가요? 다음을 확인하세요:

- [개발 가이드](https://github.com/CrazySue/Checklist/blob/main/docs/devguide/DeveloperGuide-ko.md) — 아키텍처, 빌드 파이프라인, 테스트와 함정 기록;
- [CONTRIBUTING.md](https://github.com/CrazySue/Checklist/blob/main/.github/CONTRIBUTING.md) — 기여 가이드.

---

## 📊 프로젝트 상태

![Alt](https://repobeats.axiom.co/api/embed/973db86aa4cd093504f231f7853d6b984558f943.svg "Repobeats analytics image")

---

## 📜 오픈소스 라이선스

이 프로젝트는 **MIT License**로 라이선스되며, 누구나 본 소프트웨어의 사본을 사용, 복제, 수정, 병합, 게시, 배포, 재라이선스 및/또는 판매할 수 있습니다. 자세한 내용은 [LICENSE](https://github.com/CrazySue/Checklist/blob/main/LICENSE.txt) 파일을 참조하세요.

이 프로젝트는 다음 오픈소스 소프트웨어를 사용합니다:

- Google의 [Material Symbols Rounded](https://github.com/material-components/material-web) 아이콘 시스템
- Google의 [Material Design 3](https://github.com/material-components/material-web) 디자인 언어
- Huawei의 [HarmonyOS Sans](https://github.com/huawei-fonts/HarmonyOS-Sans#) 폰트 시리즈

---

## 💌 소개

- 💡 기획: [Crazy Sue](https://github.com/CrazySue)
- ⌨️ 프로그래밍: [GLM-5.2](https://github.com/zai-org/GLM-5)
- 🛠️ 유지보수: [DeepSeek V4 Pro](https://github.com/deepseek-ai/DeepSeek-V4)

---

*이제 어떤 일도 잊지 않게 됩니다.*
