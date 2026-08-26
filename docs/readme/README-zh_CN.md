# 检查单

![background](background.png)

> 一个 MD3 风格的待办清单，从此不再忘记每一件事。

[![Download Release](https://img.shields.io/badge/Download-Release-blue.svg)](https://github.com/CrazySue/Checklist/releases) [![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/CrazySue/Checklist/blob/main/LICENSE) [![Platform Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://github.com/CrazySue/Checklist/releases) [![Made by GLM-5.2](https://img.shields.io/badge/Made_by-GLM5.2-red.svg)](https://github.com/zai-org/GLM-5) [![Maintain by DeepSeek V4 Pro](https://img.shields.io/badge/Maintain_by-DeepSeek_V4_Pro-orange.svg)](https://github.com/zai-org/GLM-5)

[English]() | 简体中文 | [繁體中文]() | [日本語]() | [한국어]() | [Français]() | [Deutsch]() | [Español]() | [Русский]() | [Português]()

**检查单**是一款使用 MD3 设计语言的待办清单应用。

---

## ✨ 特性

- **单文件**：整个应用是一个 HTML 文件，字体、图标字体、应用图标全部内嵌，双击即可离线运行；
- **MD3设计语言**：完整的 MD3 设计令牌、状态层、水波纹、非线性缓动动效；
- **本地化**：10 种语言支持（简体中文、繁體中文、English、日本語、한국어、Français、Deutsch、Español、Русский、Português）；
- **智能选择图标**：根据检查项 / 检查单名称自动匹配图标（每种语言 630+ 关键词索引）；
- **自动重置**：全部完成后可设置定时自动重置，迎接新的一天；
- **轻松分享**：导出 / 导入 .checklist 文件（内部为 JSON），数据永不丢失；
- **横竖屏自适应**：竖屏底栏、横屏左侧导航栏；
- **深色模式**：跟随系统 / 浅色 / 深色，全界面平滑过渡。

---

## 📱 截图

| ![主界面](pictures/picture-1.png)  | ![检查单编辑](pictures/picture-2.png) | ![设置](pictures/picture-3.png) |
| ------------------------------- | -------------------------------- | ----------------------------- |
| ![图标选择](pictures/picture-4.png) | ![搜索](pictures/picture-5.png)    | ![完成](pictures/picture-6.png) |

---

## 📥 下载

- 最新版本请前往 [GitHub Releases](https://github.com/CrazySue/Checklist/releases) 下载 APK；
- 也可以直接使用网页版：打开仓库中的 HTML 文件即可运行；

---

## 🎥 开发背景

当下，人们的事情变得越来越多，参加生日派对、和朋友一起看电影……为此，许多日历应用早已集成了日程功能，用于提醒人们不要忘了某件大事。

可是，问题并没有解决：出门后忘记带公交卡？下班后忘记提交工作日志？反而是组成“大事”的那些“小事”拖慢了人们的进度。

为此，饱受其害的 Sue 决定开发一款待办清单来解决这个问题：《检查单》不会提醒你要做那些大事——因为许多日历应用做得更好、而且你很难忘记它们——而是让你把需要分很多步的小事列成清单，做完一项划一项，**从此不再忘记每一件事**。

---

## 🛠️ 开始构建

《检查单》是一款以 HTML 为编程语言的 5+ App，通过 HBuilderX 将其打包为 APK 安装包。

> [!NOTE]
> 由于使用 HBuilderX 将 HTML 打包的方法和教程数不胜数，在此仅列出简化后的构建方法；欲了解详情，请查看 [HBuilderX 文档](https://hx.dcloud.net.cn/)。

要想自行将 HTML 文件打包为适用于操作系统的安装包，请：

1. [下载 HBuilderX](https://www.dcloud.io/hbuilderx.html)。
2. 新建一个 5+ App 项目。
3. 将 index.html 替换为要打包的 HTML 文件。
4. 在 manifest.json 中编辑需要修改的选项。
5. 使用云打包或离线打包。
6. 上传应用证书（云打包可使用云端证书）。
7. 打包。

---

## 🧭 参与开发

想阅读代码、修 Bug、加功能？请查看：

- [开发指北](https://github.com/CrazySue/Checklist/blob/main/docs/开发指北.md)——架构、构建管线、测试与踩坑记录；
- [CONTRIBUTING.md](https://github.com/CrazySue/Checklist/blob/main/CONTRIBUTING.md)——贡献指南。

---

## 📊 项目状态

![Alt](https://repobeats.axiom.co/api/embed/973db86aa4cd093504f231f7853d6b984558f943.svg "Repobeats analytics image")

---

## 📜 开源许可证

本项目使用 **MIT License** 进行许可，允许任何人使用、复制、修改、合并、发布、分发、再许可和 / 或出售本软件的副本，详见 [LICENSE](https://github.com/CrazySue/Checklist/blob/main/LICENSE) 文件。

本项目使用了以下开源软件：

- Google 的 [Material Symbols Rounded](https://github.com/material-components/material-web) 图标体系
- Google 的 [Material Design 3](https://github.com/material-components/material-web) 设计语言
- Huawei 的 [HarmonyOS Sans](https://github.com/huawei-fonts/HarmonyOS-Sans#) 系列字体

---

## 💌 关于

- 💡 企划：[Crazy Sue](https://github.com/CrazySue)
- ⌨️ 编程：[GLM-5.2](https://github.com/zai-org/GLM-5)
- 🛠️ 维护：[DeepSeek V4 Pro](https://github.com/deepseek-ai/DeepSeek-V4)

---

*从此不再遗忘每一件事。*
