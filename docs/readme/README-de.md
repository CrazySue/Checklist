# Checkliste

![background](/background.png)

> Eine To-do-Liste im MD3-Stil – nie wieder etwas vergessen.

[![Download Release](https://img.shields.io/badge/Download-Release-blue.svg)](https://github.com/CrazySue/Checklist/releases) [![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/CrazySue/Checklist/blob/main/LICENSE.txt) [![Platform Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://github.com/CrazySue/Checklist/releases) [![Made by GLM-5.2](https://img.shields.io/badge/Made_by-GLM5.2-red.svg)](https://github.com/zai-org/GLM-5) [![Maintain by DeepSeek V4 Pro](https://img.shields.io/badge/Maintain_by-DeepSeek_V4_Pro-orange.svg)](https://github.com/deepseek-ai/DeepSeek-V4)

[English](README-en.md) | [简体中文](README-zh_CN.md) | [繁體中文](README-zh_TW.md) | [日本語](README-ja.md) | [한국어](README-ko.md) | [Français](README-fr.md) | Deutsch | [Español](README-es.md) | [Русский](README-ru.md) | [Português](README-pt.md)

**Checkliste** ist eine To-do-Liste-App, die mit der MD3-Designsprache entwickelt wurde.

---

## ✨ Funktionen

- **Eine einzige Datei**: Die gesamte App besteht aus einer einzigen HTML-Datei – Schriftarten, Icon-Schriftart und App-Symbol sind vollständig eingebettet; per Doppelklick läuft sie offline;
- **MD3-Designsprache**: Vollständige MD3-Design-Tokens, Zustandsebenen, Wellen und nichtlineare Easing-Animationen;
- **Lokalisierung**: Unterstützung für 10 Sprachen (简体中文、繁體中文、English、日本語、한국어、Français、Deutsch、Español、Русский、Português);
- **Intelligente Symbolauswahl**: Symbole werden automatisch anhand der Checklisteneinträge bzw. des Checklistennamens zugeordnet (Schlüsselwort-Index mit 630+ Einträgen pro Sprache);
- **Automatisches Zurücksetzen**: Nachdem alles erledigt ist, lässt sich ein zeitgesteuertes automatisches Zurücksetzen einstellen – bereit für den neuen Tag;
- **Einfaches Teilen**: .checklist-Dateien exportieren / importieren (intern JSON) – Daten gehen nie verloren;
- **Adaptive Hoch-/Querformat-Anzeige**: untere Leiste im Hochformat, linke Navigationsleiste im Querformat;
- **Dunkelmodus**: System / Hell / Dunkel, mit fließenden Übergängen in der gesamten Oberfläche.

---

## 📱 Screenshots

| ![Hauptbildschirm](../pictures/picture-1.png)  | ![Checkliste bearbeiten](../pictures/picture-2.png) | ![Einstellungen](../pictures/picture-3.png) |
| ------------------------------- | -------------------------------- | ----------------------------- |
| ![Symbolauswahl](../pictures/picture-4.png) | ![Suche](../pictures/picture-5.png)    | ![Erledigt](../pictures/picture-6.png) |

---

## 📥 Download

- Die neueste Version gibt es als APK in den [GitHub Releases](https://github.com/CrazySue/Checklist/releases);
- Alternativ lässt sich direkt die Webversion nutzen: einfach die HTML-Datei aus dem Repository öffnen und loslegen;

---

## 🎥 Hintergrund

Der Alltag wird immer voller: Geburtstagsfeiern, Filmeabende mit Freunden … Viele Kalender-Apps haben deshalb längst Terminfunktionen integriert, um an die großen Dinge zu erinnern.

Doch gelöst ist das Problem damit nicht: Die Buskarte vergessen, wenn man das Haus verlässt? Den Arbeitsbericht nicht mehr abgegeben, wenn der Feierabend naht? Gerade die „kleinen Dinge", aus denen sich die „großen Dinge" zusammensetzen, bremsen einen im Alltag aus.

Deshalb hat Sue, die darunter sehr gelitten hat, beschlossen, eine To-do-Liste zu entwickeln, die dieses Problem löst: *Checkliste* erinnert nicht an die großen Dinge – das können Kalender-Apps besser, und die vergisst man ohnehin kaum –, sondern lässt dich die kleinen Dinge, die viele Schritte erfordern, als Liste festhalten und Punkt für Punkt abhaken, **nie wieder etwas vergessen**.

---

## 🛠️ Erste Schritte

*Checkliste* ist eine 5+ App mit HTML als Programmiersprache, die mit HBuilderX zu einem APK-Installationspaket verpackt wird.

> [!NOTE]
> Da es unzählige Methoden und Tutorials gibt, um HTML mit HBuilderX zu verpacken, wird hier nur der vereinfachte Build-Ablauf gezeigt; für Details siehe die [HBuilderX-Dokumentation](https://hx.dcloud.net.cn/).

Um die HTML-Datei selbst in ein Installationspaket für das Betriebssystem zu verpacken:

1. [HBuilderX herunterladen](https://www.dcloud.io/hbuilderx.html).
2. Ein neues 5+ App-Projekt anlegen.
3. index.html durch die zu verpackende HTML-Datei ersetzen.
4. In manifest.json die zu ändernden Optionen bearbeiten.
5. Cloud-Packaging oder Offline-Packaging verwenden.
6. Ein App-Zertifikat hochladen (beim Cloud-Packaging kann ein Cloud-Zertifikat verwendet werden).
7. Verpacken.

---

## 🧭 Mitmachen

Lust, den Code zu lesen, Bugs zu beheben oder Funktionen beizutragen? Dann schau hier vorbei:

- [Entwicklerleitfaden](https://github.com/CrazySue/Checklist/blob/main/docs/devguide/DeveloperGuide-de.md) – Architektur, Build-Pipeline, Tests und Fallstricke;
- [CONTRIBUTING.md](https://github.com/CrazySue/Checklist/blob/main/.github/CONTRIBUTING.md) – Beitragsleitfaden.

---

## 📊 Projektstatus

![Alt](https://repobeats.axiom.co/api/embed/973db86aa4cd093504f231f7853d6b984558f943.svg "Repobeats analytics image")

---

## 📜 Open-Source-Lizenz

Dieses Projekt ist unter der **MIT-Lizenz** lizenziert: Jede Person darf Kopien dieser Software verwenden, kopieren, ändern, zusammenführen, veröffentlichen, verteilen, unterlizenzieren und/oder verkaufen. Details siehe Datei [LICENSE](https://github.com/CrazySue/Checklist/blob/main/LICENSE.txt).

Dieses Projekt verwendet folgende Open-Source-Software:

- Googles Symbolsystem [Material Symbols Rounded](https://github.com/material-components/material-web)
- Googles Designsprache [Material Design 3](https://github.com/material-components/material-web)
- Huaweis Schriftfamilie [HarmonyOS Sans](https://github.com/huawei-fonts/HarmonyOS-Sans#)

---

## 💌 Über

- 💡 Konzept: [Crazy Sue](https://github.com/CrazySue)
- ⌨️ Programmierung: [GLM-5.2](https://github.com/zai-org/GLM-5)
- 🛠️ Wartung: [DeepSeek V4 Pro](https://github.com/deepseek-ai/DeepSeek-V4)

---

*Nie wieder etwas vergessen.*
