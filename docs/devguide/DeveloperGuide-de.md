# Checkliste-Entwicklerleitfaden

> [!TIP]
> Dieses Dokument ist eine technische Dokumentation für Entwickler: Architektur, Build-Pipeline, Tests sowie Fallstricke und Erfahrungen.  
> Projektvorstellung, Funktionen und Download-Möglichkeiten findest du im [README](https://github.com/CrazySue/Checklist/blob/main/docs/readme/README-de.md).  

> Aktuelle Version: `Release v1.0.0` ｜ Repository: https://github.com/CrazySue/Checklist

---

## 🏗️ Architekturübersicht

### 🧱 Ein-Datei-Struktur

Die App ist **eine einzige HTML-Datei** (ca. 40 MB), die sich von oben nach unten in vier Ebenen gliedert:

| Bereich | Inhalt |
| --- | --- |
| `<style id="embedded-fonts">` im `<head>` | 3 `@font-face`-Blöcke (HarmonyOS Sans SC 400/500/700 + Material Symbols Rounded), base64 eingebettet, `font-display:swap` |
| Haupt-`<style>` im `<head>` | Das gesamte CSS: Design-Tokens → Komponentenstile → Animationen → Responsive-Design (inkl. der linken Leiste im Querformat über `html.landscape`) |
| `<body>` | App-Gerüst: obere Leiste / Suchleiste / drei absolut positionierte, übereinanderliegende Seitencontainer / untere Leiste + Modals (Symbolauswahl, Sprachauswahl, Toast) |
| `<script>` | Das gesamte JavaScript (ca. 3800 Zeilen): Zustand → Hilfsfunktionen → i18n → Design/Layout → Rendering → Formulare → Datenaustausch → Einstellungen → Start |

### 🔀 Datenfluss

Ein Hybridmodell aus **„zentralisiertem Zustand + Renderfunktionen + direkter DOM-Animation"**:

```text
Benutzerinteraktion
   │
   ├── Datenänderung ──→ Store.save() (in localStorage gespeichert)
   │                   └──→ explizit renderXxx() aufrufen, um den betroffenen Bereich neu zu rendern
   │
   └── Rein visuelle Änderung (Abhaken, Seitenwechsel, Wellen) ──→ DOM / Inline-Stile direkt manipulieren (kein Neu-Rendering)
```

> [!WARNING]
> Jede Zustandsänderung, die Animationen betrifft, **muss das DOM direkt manipulieren** – kein vollständiges Neu-Rendering auslösen.

### 🗂️ Zustandsmodell

Gespeichert unter dem `localStorage`-Schlüssel `checklist_app_state_v1`:

```js
state = {
  checklists: [
    { id, name, icon, resetHours,          // icon: 'auto' | Symbolname
      items: [{ id, text, icon, done }],
      completedAt, createdAt }
  ],
  activeChecklistId: id | null,
  settings: {
    theme: 'auto' | 'light' | 'dark',
    itemHeight: 64,        // 56~120
    firstOnly: false,      // nur der erste Eintrag erhält die benutzerdefinierte Höhe
    language: 'auto' | 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru' | 'pt'
  }
}
```

Temporärer Zustand (wird nicht gespeichert) liegt in modulweiten Variablen: `currentPage`, `formMode` (`'new'|'edit'`), `formState`, `settingsFromPage`, `titleFlipDir`, `titleAnimToken`, `switchAnimToken`, `currentHomeView` usw.

---

## 📂 Repository-Struktur (GitHub)

```text
.
├── .github/               Verhaltenskodex und Issue-Vorlagen
├── docs/                  Dokumentation
├── build/                 Patch-Pipelines, Schlüsselwort-Stammdaten und Testsuites
├── README.md              Readme-Datei
└── LICENSE.txt            Lizenz
```

---

## 🚀 Umgebung und Testeinstieg

### 📦 Umgebungsanforderungen

- App ausführen: jeder moderne Browser / per HBuilderX verpackte APK;
- Build und Tests: Node.js ≥ 16 (Projekt auf Node 24 verifiziert); `build/node_modules` bringt die jsdom-Abhängigkeit mit.

### 🧪 Tests ausführen

```bash
node build/_extract099.js && node --check build/_check099.js   # Syntaxprüfung
node build/_sim099.js                                          # Simulation des Nutzerverhaltens (73 Assertions)
node build/_smoke099.js && node build/_smoke099b.js            # Regressionstests
```

Erst wenn alles `ALL PASS` und `uncaught errors: 0` ausgibt, gilt der Test als bestanden.

---

## 🛠️ Build-Pipeline und Entwicklungsworkflow

### 🔁 Versions-Patch-Pipeline

Ein Versionsupgrade = Node-Patch-Skripte auf die vorherige HTML-Version anwenden. Das `apply(old, new, count)` in jedem Skript prüft die Anzahl der Übereinstimmungen; schlägt eine fehl, wird das Schreiben abgebrochen.

| Skript | Zweck |
| --- | --- |
| `upgrade_v09.js` + `patch_v09_css.js` + `keywords_v09.js` + `embed_font_v09.js` + `rebuild_v09.js` | 0.8.0 → 0.9.0 |
| `upgrade_v095.js` / `upgrade_v095b.js` | → 0.9.5 |
| `upgrade_v096.js` / `upgrade_v096b.js` | → 0.9.6 |
| `upgrade_v097.js` | → 0.9.7 |
| `upgrade_v098.js` | → 0.9.8 |
| `upgrade_v099.js` + `upgrade_v099b.js` + `upgrade_v099c.js` + `remove_icons_v099.js` | → 0.9.9 |
| `upgrade_v100.js` | → 1.0.0 |

### ✏️ Der richtige Weg, Code zu ändern

1. Die HTML-Datei der Zielversion direkt bearbeiten (eine Datei, WYSIWYG);
2. Die Änderung **in das zugehörige `upgrade_vXXX.js` übernehmen** (damit aus alten Versionen mit einem Klick neu gebaut werden kann);
3. Erst committen, wenn Syntaxprüfung + Simulation/Regression komplett grün sind.

### 🎛️ Symbole und Schlüsselwörter hinzufügen/entfernen

- Symbolbibliothek: `ICON_LIBRARY` (Kategorieschlüssel `daily / travel / shopping / sports / leisure / food / health / work / other`);
- Symbol hinzufügen: Symbolnamen in das Kategorie-Array einfügen → in `build/keywords_v09.js` `[icon, {Sprache: 'Schlüsselwort|Schlüsselwort'}]` ergänzen → den `AUTO_ICON_KEYWORDS`-Block neu aufbauen;
- Symbol entfernen: sowohl aus der Bibliothek als auch aus den Schlüsselwortdaten löschen und dann neu aufbauen (siehe `remove_icons_v099.js`);
- Validierung: ≥ 200 Schlüsselwörter pro Sprache; jeder Symbolname muss in der eingebetteten Schriftart und in `ICON_LIBRARY` vorhanden sein.

### 🌍 Eine Sprache hinzufügen

Neues Wörterbuch in `I18N` ergänzen (gleicher Schlüsselsatz wie in den anderen Sprachen) → in `LANGUAGES` registrieren → Schlüsselwortbibliothek auf ≥ 200 Wörter auffüllen → `getLang()` (auto → exakte Übereinstimmung → Präfix-Übereinstimmung → Rückfall auf zh-CN).

---

## 🧩 Detaillierte Code-Struktur

### 🎨 Design-Tokens und CSS-Schichtung

```css
:root{
  --brand-1:#10172F; --brand-2:#283558; --brand-3:#525288; --brand-4:#A5A8BA;  /* vier Markenfarben */
  --md-primary:#525288; --md-primary-container:#E1E0FF; …                         /* aus MD3 abgeleitete Farbpalette */
  --md-easing-standard / emphasized / accelerated / decelerated;                  /* Motion-Tokens */
  --md-dur-short:150ms; --md-dur-medium:250ms; --md-dur-long:400ms;
}
```

CSS-Schichtung: Reset → Schriften → Tokens → Motion → Gerüst → obere Leiste → Seitencontainer → Listeneinträge → untere Leiste → Schaltflächen/FAB → Formulare → Suche → Einstellungen → Modals/Toast → Responsive. Der Dunkelmodus wird durch Überschreiben der Variablen über `[data-theme="dark"]` umgesetzt; alle Farbwechsel laufen über `*{transition-property:…;transition-duration:.25s}` fließend ab.

### ⚙️ JS-Modulkarte

| Bereich | Wichtige Funktionen |
| --- | --- |
| Zustand | `Store` (load/save/set) |
| Hilfsfunktionen | `$` `$$` `el` `uid` `attachRipple` `initGlobalRipple` |
| Symbolzuordnung | `normText` `latinMatch` `autoIconFor` `resolveIcon` |
| i18n | `getLang` `t` |
| Design/Layout | `applyTheme` `updateLayout` |
| Obere Leiste | `renderTopbar` `setTopbarTitle` |
| Startseite | `renderHome` `showHomeView` `completeItem` `resetChecklist` `checkAutoReset` |
| Untere Leiste/Seitenwechsel | `renderBottombar` `switchChecklist` `switchPage` |
| Formulare | `openForm` `renderForm` `renderFormItems` `appendFormItem` `refreshChecklistIconRow` |
| Datenaustausch | `handleExport` `downloadViaAnchor` `finishImport` `handleImport` |
| Einstellungen | `renderSettings` `toggleDropdown` `openLanguageMenu` |
| Modals | `openIconPicker` `renderIconPickerGrid` `selectIcon` |
| Navigation | `openSettingsFrom` `goBackFromSettings` `openExternal` |
| Animations-Hilfsfunktionen | `swapIcon` `popIcon` `smoothCenter` |
| Start | `bindEvents` `updateStaticLabels` `init` |

### ✨ Animationssystem

- **Interrupt-Token-Muster**: Alle unterbrechbaren Animationen (Seitenwechsel, Titel, Scrollen, Symbolwechsel) halten ein hochzählendes Token; Timer-Callbacks prüfen zuerst das Token und beenden sich still, sobald eine neue Animation sie unterbricht;
- **Seitenwechsel/Wechsel**: Der alte Inhalt gleitet in 150 ms beschleunigt um 40 px heraus + blende aus → der neue Inhalt gleitet aus der Gegenrichtung um 40 px in 300 ms abgebremst hinein (identisch in `switchPage` und `switchChecklist`);
- **Titel-Umdrehen**: Der gesamte Titel dreht in 140 ms heraus → in 240 ms abgebremst hinein; die Richtung ergibt sich aus der Seitenwechselrichtung (vorwärts = nach oben, zurück = nach unten);
- **Kaffee-Seite**: Ein-/Ausblenden per `@keyframes` (auf Android zuverlässig); beim Wechsel der Checkliste wird er als „spezieller Checklisteneintrag" behandelt und dreht mit dem Scrollbereich mit (der `instant`-Pfad deaktiviert seine eigene Animation);
- **FLIP**: Beim Abschließen eines Checklisteneintrags schrumpft die Höhe über CSS-Transitions, ohne dass neu gerendert wird.

---

## 📱 APK-Packaging (HBuilderX)

### 📦 Schritte

Neues 5+ App-Projekt anlegen (Paketname `com.crazysue.checklist`) → HTML als Einstiegsseite einfügen → manifest.json bearbeiten → Cloud-/Offline-Packaging → Zertifikat → Verpacken.

### 🔌 Verwendete plus-APIs

| API | Zweck |
| --- | --- |
| `plus.io.requestFileSystem(plus.io.PRIVATE_DOC, …)` | .checklist in das private App-Verzeichnis exportieren (**nicht wieder auf das öffentliche Verzeichnis zurückwechseln**) |
| `plus.runtime.openURL(url)` | Externe Links im Standardbrowser des Systems öffnen |
| `plus.os.name` | Plattform-Erkennung (beim Android-Import **ohne** accept-Filter) |

### ⚠️ Checkliste der Plattform-Fallstricke

- Der Android-Dateieingang muss das `accept`-Attribut weglassen, sonst ist in der Systemauswahl keine Datei auswählbar;
- Das Schreiben in den öffentlichen Download-Ordner unter Android 10+ (Dateipfad/MediaStore/SAF) schlägt auf manchen Geräten vollständig fehl (0-Byte-Dateien) – v1.0 fällt daher endgültig auf das private App-Verzeichnis zurück;
- `window.open(url,'_blank','noopener')` öffnet zwei Tabs – für externe Links Ankerlinks oder `plus.runtime.openURL` verwenden;
- `scrollTo({behavior:'smooth'})` scheitert in alten WebViews still – für benutzerdefiniertes Scrollen rAF + Easing verwenden und direkt in `scrollTop` schreiben;
- `screen.orientation` gibt den Monitor statt des Fensters wieder – Hoch-/Querformat wird nur über das Seitenverhältnis des Fensters selbst erkannt;
- Kritische Ein-/Ausblend-Animationen nutzen `@keyframes` statt „Anfangszustand → Klassenwechsel"-Transitions;
- inline-block kollabiert führende Leerzeichen – das Titel-Suffix bleibt inline;
- Wird die Welle direkt bei pointerup entfernt, wirkt das zu abrupt – nach dem Loslassen bis zum Ende weiter abspielen.

---

## 🧠 Wichtige technische Entscheidungen und Fallstricke

| Thema | Entscheidung | Begründung |
| --- | --- | --- |
| Seitenrichtungs-Modell | Neue-/Einstellungsseiten gleiten immer von rechts herein; Checklistenseiten von links; „Zurück" aus den Einstellungen zur Neuen-Seite kehrt die Richtung um | passt zum mentalen Modell der Nutzer |
| Endzustand der Titel-Animation | Der gesamte Titel (Name + „Checkliste") dreht auf allen Seiten gemeinsam nach oben/unten | Die frühere Zweispur-Lösung „Name dreht + Suffix bewegt sich" führte wiederholt zu Teleport-/Überlappungsproblemen |
| Kaffee-Seite | dreht beim Wechsel mit dem Scrollbereich mit; beim Zurücksetzen nach unten bewegen + ausblenden | einheitliches Seitenwechsel-Gefühl |
| Automatische Leerzeile | Am Ende steht immer eine automatische Zeile ohne Lösch-Schaltfläche; wird der vorherige Eintrag geleert, verschwindet sie per Animation; der erste Eintrag wird beim Leeren nie gelöscht | Balance zwischen Eingabekomfort und „keine unsichtbaren Schaltflächen" |
| Export | privates App-Verzeichnis (APK) / Ankerlink-Download (Web) | zuverlässig über alle Android-Versionen hinweg |
| Symbol-Schlüsselwörter | 630+ Wörter pro Sprache, aktuelle Sprache zuerst mit Rückfall auf Englisch, Ganzwortabgleich bei westlichen Schriften | Balance zwischen Trefferquote und Fehlalarmen |

---

## 🧪 Testleitfaden

### 🧰 Werkzeugkette

- **jsdom**: vor dem Laden der HTML-Datei base64-Ressourcen entfernen für mehr Tempo; `beforeParse` injiziert Zustands-Seeds und Polyfills (`scrollIntoView`/`matchMedia`/`URL.createObjectURL` usw.);
- **`_sim099.js`**: Verhaltenssimulation – echte DOM-Events treiben komplette Nutzerabläufe; animierte Zwischenzustände werden abgetastet, um das Timing zu prüfen;
- **`_smoke099.js` / `_smoke099b.js`**: Funktions-Regression + Prüfung auf Zeichenkettenebene im Code.

### 📝 Beispiel für einen Simulationsfall

```js
// beforeParse: Zustands-Seed + Mock der Layout-Geometrie
window.localStorage.setItem('checklist_app_state_v1', JSON.stringify(state));
window.Element.prototype.getBoundingClientRect = function(){ /* nach Bedarf zurückgeben */ };
// echte Events treiben den Ablauf + Assertions über abgetastete Zwischenzustände
input.focus(); input.value='Wasser trinken';
input.dispatchEvent(new w.Event('input', {bubbles:true}));
await sleep(60); check('automatische Leerzeile verschwindet per Animation', !!document.querySelector('.form-item.removing'));
```

### ✅ Checkliste vor der Veröffentlichung

- [ ] `node --check` besteht die Syntaxprüfung;
- [ ] `_sim099.js` zweimal in Folge komplett grün;
- [ ] `_smoke099.js` und `_smoke099b.js` komplett grün;
- [ ] per grep bestätigt: Versionsnummer, Überreste gelöschter Einträge, Kennzeichnungen wichtiger APIs;
- [ ] Verifikation am Gerät: Export/Import/externe Links/hell-dunkel/Hoch-Querformat/Titel-Umdrehen/Welle.

---

## 🎨 Design-Spezifikation im Schnellüberblick (MD3)

- Die vier Markenfarben: `#10172F` `#283558` `#525288` `#A5A8BA`; der helle Modus wird aus dem Seed `#525288`, der dunkle aus `#283558` abgeleitet;
- Zustandsebenen: hover 8% / active 12% transparentes Schwarz;
- Schriftart: HarmonyOS Sans SC (400/500/700, **kein Subsetting** – Nutzerinhalte können beliebige Han-Zeichen enthalten);
- Symbole: Material Symbols Rounded (variable Schriftart, `font-variation-settings` steuert FILL/wght), müssen aus Google Fonts stammen;
- Animationen: nur Eindrehen/Einblenden/Welle/Skalieren erlaubt; plötzliches Erscheinen/Verschwinden ist verboten; Easing und Dauern laufen ausschließlich über Tokens;
- Schalter: 0.8.0-Spezifikation (aus 12px / ein 24px), keine Press-Dehnung, nichtlinearer Übergang mit emphasized.

---

## 📜 Versionshistorie

| Version | Highlights |
| ----- | ------------------------------------------------------------------------- |
| 0.7.0 | Erste nutzbare Version (wegen zu großer Datei nicht auf GitHub hochladbar)                                              |
| 0.8.0 | Baseline für die erste Review                                                                    |
| 0.9.0 | Fokus auf der unteren Leiste, Kaffee-Seite beim Seitenwechsel, Navigation der Bearbeitungsseite, lokalisierte Symbolkategorien, 200+ Schlüsselwörter/Sprache, .checklist-Export, Sponsor-Schaltfläche, Wellen-Beschneidung, linke Leiste im Querformat, eingebettetes Bold |
| 0.9.5 | Regeln für die Seitenwechselrichtung, Wechsel Bearbeiten↔Neu, Schalter-Spezifikation, automatische Leerzeilen, Verschiebungs-Animation des Titels                                          |
| 0.9.6 | Zurück-Richtung aus den Einstellungen, Android-Export/-Import, vertikales Titel-Umdrehen, Dunkelmodus-Übergang, Neuimplementierung der Querformat-Erkennung                                         |
| 0.9.7 | Timing der Titel-Animation, Ausblenden der Kaffee-Seite, Entfernen leerer Zeilen, Schalter auf 0.8.0 zurückgeführt, Zusammenführung der Zuschreibungen                                          |
| 0.9.8 | Fokus-Zentrierung auf Android, Import ohne accept, dreistufige Exportkette, einheitliche Titel-Choreografie, schnellere Wellen, Leistungsoptimierung                                  |
| 0.9.9 | Gesamttitel-Umdrehen auf allen Seiten, einheitliche 40px-Seitenwechsel-Animation, Symbol-Bereinigung, Design-Übergänge für alle Elemente, fokussiertes Scrollen mit Easing, schnelle Unterbrechung                            |
| 1.0.0 | Export zurück in das private Verzeichnis, schnelle Unterbrechung im Dropdown, Dead-Code-Bereinigung, Startoptimierung – 🎉 offizielle Version                                      |
