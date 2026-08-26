# Checklist

![background](../background.png)

> A to-do list in MD3 style — never forget anything again.

[![Download Release](https://img.shields.io/badge/Download-Release-blue.svg)](https://github.com/CrazySue/Checklist/releases) [![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/CrazySue/Checklist/blob/main/LICENSE.txt) [![Platform Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://github.com/CrazySue/Checklist/releases) [![Made by GLM-5.2](https://img.shields.io/badge/Made_by-GLM5.2-red.svg)](https://github.com/zai-org/GLM-5) [![Maintain by DeepSeek V4 Pro](https://img.shields.io/badge/Maintain_by-DeepSeek_V4_Pro-orange.svg)](https://github.com/deepseek-ai/DeepSeek-V4)

English | [简体中文](README-zh_CN.md) | [繁體中文](README-zh_TW.md) | [日本語](README-ja.md) | [한국어](README-ko.md) | [Français](README-fr.md) | [Deutsch](README-de.md) | [Español](README-es.md) | [Русский](README-ru.md) | [Português](README-pt.md)

**Checklist** is a to-do list application built with the MD3 design language.

---

## ✨ Features

- **Single file**: The entire app is one HTML file with fonts, icon fonts, and the app icon all embedded — double-click to run it offline;
- **MD3 design language**: Complete MD3 design tokens, state layers, ripples, and non-linear easing animations;
- **Localisation**: Support for 10 languages (简体中文、繁體中文、English、日本語、한국어、Français、Deutsch、Español、Русский、Português);
- **Smart icon matching**: Icons are matched automatically from checklist item / checklist names (630+ keyword index per language);
- **Auto reset**: After everything is done, the list can be set to reset automatically on a timer, ready for a new day;
- **Easy sharing**: Export / import .checklist files (JSON under the hood) — your data never gets lost;
- **Adaptive portrait & landscape**: Bottom bar in portrait, left navigation bar in landscape;
- **Dark mode**: Follow system / light / dark, with smooth transitions across the whole UI.

---

## 📱 Screenshots

| ![Home](../pictures/picture-1.png)  | ![Edit checklist](../pictures/picture-2.png) | ![Settings](../pictures/picture-3.png) |
| ------------------------------- | -------------------------------- | ----------------------------- |
| ![Icon picker](../pictures/picture-4.png) | ![Search](../pictures/picture-5.png)    | ![Done](../pictures/picture-6.png) |

---

## 📥 Download

- For the latest version, download the APK from [GitHub Releases](https://github.com/CrazySue/Checklist/releases);
- You can also use the web version directly: just open the HTML file in the repository and it runs;

---

## 🎥 Background

Life keeps piling things onto our plates — birthday parties, movies with friends... That's why many calendar apps have long integrated scheduling features, to remind people not to forget the big stuff.

But does that solve the problem? Not really. Forgot your transit card when you left the house? Forgot to submit your work log after clocking out? It's the "little things" that make up the "big things" that slow people down.

That's why Sue, who has suffered from this problem, decided to build a to-do list to fix it: *Checklist* won't remind you about the big stuff — because most calendar apps do that better, and you're unlikely to forget it anyway — instead, it lets you break down the little things that need many steps into a list, checking off one item at a time, **so you never forget anything again**.

---

## 🛠️ Getting Started

*Checklist* is a 5+ App written in HTML, packaged into an APK installer with HBuilderX.

> [!NOTE]
> There are countless tutorials on packaging HTML with HBuilderX, so only a simplified build process is listed here. For details, see the [HBuilderX documentation](https://hx.dcloud.net.cn/).

To package the HTML file into an installer for your OS yourself:

1. [Download HBuilderX](https://www.dcloud.io/hbuilderx.html).
2. Create a new 5+ App project.
3. Replace index.html with the HTML file you want to package.
4. Edit the options you need in manifest.json.
5. Use cloud packaging or offline packaging.
6. Upload an app certificate (cloud packaging can use a cloud certificate).
7. Package.

---

## 🧭 Getting Involved

Want to read the code, fix bugs, or add features? Check out:

- [Developer Guide](https://github.com/CrazySue/Checklist/blob/main/docs/devguide/DeveloperGuide-en.md) — architecture, build pipeline, testing, and pitfalls;
- [CONTRIBUTING.md](https://github.com/CrazySue/Checklist/blob/main/.github/CONTRIBUTING.md) — contribution guidelines.

---

## 📊 Project Status

![Alt](https://repobeats.axiom.co/api/embed/973db86aa4cd093504f231f7853d6b984558f943.svg "Repobeats analytics image")

---

## 📜 Open Source License

This project is licensed under the **MIT License**, which permits anyone to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software. See the [LICENSE](https://github.com/CrazySue/Checklist/blob/main/LICENSE.txt) file for details.

This project uses the following open-source software:

- Google's [Material Symbols Rounded](https://github.com/material-components/material-web) icon system
- Google's [Material Design 3](https://github.com/material-components/material-web) design language
- Huawei's [HarmonyOS Sans](https://github.com/huawei-fonts/HarmonyOS-Sans#) font family

---

## 💌 About

- 💡 Concept: [Crazy Sue](https://github.com/CrazySue)
- ⌨️ Programming: [GLM-5.2](https://github.com/zai-org/GLM-5)
- 🛠️ Maintenance: [DeepSeek V4 Pro](https://github.com/deepseek-ai/DeepSeek-V4)

---

*Never forget anything again.*
