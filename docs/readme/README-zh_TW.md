# 檢查單

![background](/background.png)

> 一個 MD3 風格的待辦清單，從此不再忘記每一件事。

[![Download Release](https://img.shields.io/badge/Download-Release-blue.svg)](https://github.com/CrazySue/Checklist/releases) [![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/CrazySue/Checklist/blob/main/LICENSE.txt) [![Platform Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://github.com/CrazySue/Checklist/releases) [![Made by GLM-5.2](https://img.shields.io/badge/Made_by-GLM5.2-red.svg)](https://github.com/zai-org/GLM-5) [![Maintain by DeepSeek V4 Pro](https://img.shields.io/badge/Maintain_by-DeepSeek_V4_Pro-orange.svg)](https://github.com/deepseek-ai/DeepSeek-V4)

[English](README-en.md) | [简体中文](README-zh_CN.md) | 繁體中文 | [日本語](README-ja.md) | [한국어](README-ko.md) | [Français](README-fr.md) | [Deutsch](README-de.md) | [Español](README-es.md) | [Русский](README-ru.md) | [Português](README-pt.md)

**檢查單**是一款使用 MD3 設計語言的待辦清單應用程式。

---

## ✨ 特色

- **單一檔案**：整個應用程式是一個 HTML 檔案，字型、圖示字型、應用程式圖示全部內嵌，雙擊即可離線執行；
- **MD3 設計語言**：完整的 MD3 設計權杖、狀態層、漣漪效果、非線性緩動動效；
- **在地化**：支援 10 種語言（简体中文、繁體中文、English、日本語、한국어、Français、Deutsch、Español、Русский、Português）；
- **智慧選取圖示**：根據檢查項／檢查單名稱自動比對圖示（每種語言 630+ 關鍵字索引）；
- **自動重置**：全部完成後可設定定時自動重置，迎接新的一天；
- **輕鬆分享**：匯出／匯入 .checklist 檔案（內部為 JSON），資料永不遺失；
- **直橫螢幕自適應**：直式螢幕底欄、橫式螢幕左側導覽列；
- **深色模式**：跟隨系統／淺色／深色，全介面平滑過渡。

---

## 📱 截圖

| ![主介面](/pictures/picture-1.png)  | ![編輯檢查單](/pictures/picture-2.png) | ![設定](/pictures/picture-3.png) |
| ------------------------------- | -------------------------------- | ----------------------------- |
| ![選取圖示](/pictures/picture-4.png) | ![搜尋](/pictures/picture-5.png)    | ![完成](/pictures/picture-6.png) |

---

## 📥 下載

- 最新版本請前往 [GitHub Releases](https://github.com/CrazySue/Checklist/releases) 下載 APK；
- 也可以直接使用網頁版：開啟倉庫中的 HTML 檔案即可執行；

---

## 🎥 開發背景

當下，人們的事情變得越來越多，參加生日派對、和朋友一起看電影……為此，許多行事曆應用程式早已整合了行程功能，用來提醒人們不要忘了某件大事。

可是，問題並沒有解決：出門後忘記帶公車卡？下班後忘記提交工作日誌？反而是組成「大事」的那些「小事」拖慢了人們的進度。

為此，深受其害的 Sue 決定開發一款待辦清單來解決這個問題：《檢查單》不會提醒你要做那些大事——因為許多行事曆應用程式做得更好、而且你很難忘記它們——而是讓你把需要分很多步的小事列成清單，做完一項劃一項，**從此不再忘記每一件事**。

---

## 🛠️ 開始建置

《檢查單》是一款以 HTML 為程式語言的 5+ App，透過 HBuilderX 將其打包為 APK 安裝檔。

> [!NOTE]
> 由於使用 HBuilderX 將 HTML 打包的方法和教學不勝枚舉，在此僅列出簡化後的建置方法；欲了解詳情，請查看 [HBuilderX 文件](https://hx.dcloud.net.cn/)。

要想自行將 HTML 檔案打包為適用於作業系統的安裝檔，請：

1. [下載 HBuilderX](https://www.dcloud.io/hbuilderx.html)。
2. 新建一個 5+ App 專案。
3. 將 index.html 替換為要打包的 HTML 檔案。
4. 在 manifest.json 中編輯需要修改的選項。
5. 使用雲打包或離線打包。
6. 上傳應用程式憑證（雲打包可使用雲端憑證）。
7. 打包。

---

## 🧭 參與開發

想閱讀程式碼、修 Bug、加功能？請查看：

- [開發指北](https://github.com/CrazySue/Checklist/blob/main/docs/devguide/DeveloperGuide-zh_TW.md)——架構、建置管線、測試與踩雷紀錄；
- [CONTRIBUTING.md](https://github.com/CrazySue/Checklist/blob/main/.github/CONTRIBUTING.md)——貢獻指南。

---

## 📊 專案狀態

![Alt](https://repobeats.axiom.co/api/embed/973db86aa4cd093504f231f7853d6b984558f943.svg "Repobeats analytics image")

---

## 📜 開放原始碼授權條款

本專案使用 **MIT License** 授權，允許任何人使用、複製、修改、合併、發佈、散佈、再授權和／或販售本軟體的副本，詳見 [LICENSE](https://github.com/CrazySue/Checklist/blob/main/LICENSE.txt) 檔案。

本專案使用了以下開放原始碼軟體：

- Google 的 [Material Symbols Rounded](https://github.com/material-components/material-web) 圖示體系
- Google 的 [Material Design 3](https://github.com/material-components/material-web) 設計語言
- Huawei 的 [HarmonyOS Sans](https://github.com/huawei-fonts/HarmonyOS-Sans#) 系列字型

---

## 💌 關於

- 💡 企劃：[Crazy Sue](https://github.com/CrazySue)
- ⌨️ 程式設計：[GLM-5.2](https://github.com/zai-org/GLM-5)
- 🛠️ 維護：[DeepSeek V4 Pro](https://github.com/deepseek-ai/DeepSeek-V4)

---

*從此不再遺忘每一件事。*
