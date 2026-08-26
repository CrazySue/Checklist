# Checklist Developer Guide

> [!TIP]
> This document is a technical guide for developers: architecture, build pipeline, testing, and pitfalls.  
> For the project introduction, features, and downloads, see the [README](https://github.com/CrazySue/Checklist/blob/main/docs/readme/README-en.md).  

> Current version: `Release v1.0.0` ｜ Repository: https://github.com/CrazySue/Checklist

---

## 🏗️ Architecture Overview

### 🧱 Single-File Structure

The app is **a single HTML file** (about 40 MB), divided into four layers from top to bottom:

| Area | Contents |
| --- | --- |
| `<style id="embedded-fonts">` in `<head>` | 3 `@font-face` blocks (HarmonyOS Sans SC 400/500/700 + Material Symbols Rounded), base64-embedded, `font-display:swap` |
| Main `<style>` in `<head>` | All CSS: design tokens → component styles → animations → responsive layout (including the `html.landscape` left sidebar) |
| `<body>` | App skeleton: top bar / search bar / three absolutely-positioned stacked page containers / bottom bar + modals (icon picker, language picker, Toast) |
| `<script>` | All JavaScript (about 3800 lines): state → utilities → i18n → theme/layout → rendering → forms → data exchange → settings → startup |

### 🔀 Data Flow

A hybrid model of **"centralised state + render functions + direct DOM animation"**:

```text
User interaction
   │
   ├── Data change ──→ Store.save() (persisted to localStorage)
   │                   └──→ Explicitly call renderXxx() to re-render the affected area
   │
   └── Pure visual change (checking, page turns, ripples) ──→ manipulate DOM / inline styles directly (no re-render)
```

> [!WARNING]
> Any state change involving animation **must manipulate the DOM directly** — do not trigger a full re-render.

### 🗂️ State Model

Persisted under the `localStorage` key `checklist_app_state_v1`:

```js
state = {
  checklists: [
    { id, name, icon, resetHours,          // icon: 'auto' | icon name
      items: [{ id, text, icon, done }],
      completedAt, createdAt }
  ],
  activeChecklistId: id | null,
  settings: {
    theme: 'auto' | 'light' | 'dark',
    itemHeight: 64,        // 56~120
    firstOnly: false,      // apply the custom height to the first item only
    language: 'auto' | 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru' | 'pt'
  }
}
```

Transient state (not persisted) lives in module-level variables: `currentPage`, `formMode` (`'new'|'edit'`), `formState`, `settingsFromPage`, `titleFlipDir`, `titleAnimToken`, `switchAnimToken`, `currentHomeView`, etc.

---

## 📂 Repository Structure (GitHub)

```text
.
├── .github/              Code of Conduct and Issue templates
├── docs/                 Documentation
├── build/                Patch pipelines, keyword master data, and test suites
├── README.md             Readme file
└── LICENSE.txt           License
```

---

## 🚀 Environment and Getting Started with Testing

### 📦 Environment Requirements

- Running the app: any modern browser / APK packaged with HBuilderX;
- Building and testing: Node.js ≥ 16 (validated on Node 24); `build/node_modules` ships the jsdom dependency.

### 🧪 Run the Tests

```bash
node build/_extract099.js && node --check build/_check099.js   # syntax check
node build/_sim099.js                                          # user-behaviour simulation (73 assertions)
node build/_smoke099.js && node build/_smoke099b.js            # regression tests
```

All must output `ALL PASS` with `uncaught errors: 0` to be considered passing.

---

## 🛠️ Build Pipeline and Development Workflow

### 🔁 Version Patch Pipeline

A version upgrade = applying Node patch scripts to the previous HTML version. Each script's `apply(old, new, count)` validates the match count and aborts the write if any match fails.

| Script | Purpose |
| --- | --- |
| `upgrade_v09.js` + `patch_v09_css.js` + `keywords_v09.js` + `embed_font_v09.js` + `rebuild_v09.js` | 0.8.0 → 0.9.0 |
| `upgrade_v095.js` / `upgrade_v095b.js` | → 0.9.5 |
| `upgrade_v096.js` / `upgrade_v096b.js` | → 0.9.6 |
| `upgrade_v097.js` | → 0.9.7 |
| `upgrade_v098.js` | → 0.9.8 |
| `upgrade_v099.js` + `upgrade_v099b.js` + `upgrade_v099c.js` + `remove_icons_v099.js` | → 0.9.9 |
| `upgrade_v100.js` | → 1.0.0 |

### ✏️ The Right Way to Modify Code

1. Edit the target version's HTML directly (single file, WYSIWYG);
2. **Mirror the change into the corresponding `upgrade_vXXX.js`** (so old versions can be rebuilt in one go);
3. Only commit after the syntax check and simulation/regression tests are all green.

### 🎛️ Adding/Removing Icons and Keywords

- Icon library: `ICON_LIBRARY` (category keys `daily / travel / shopping / sports / leisure / food / health / work / other`);
- Adding an icon: append the icon name to its category array → append `[icon, {language: 'keyword|keyword'}]` in `build/keywords_v09.js` → rebuild the `AUTO_ICON_KEYWORDS` block;
- Removing an icon: delete it from both the library and the keyword data, then rebuild (see `remove_icons_v099.js`);
- Validation: ≥ 200 keywords per language; every icon name must exist in the embedded font and in `ICON_LIBRARY`.

### 🌍 Adding a Language

Add a new dictionary to `I18N` (same key set as the other languages) → register it in `LANGUAGES` → fill the keyword library with ≥ 200 words → `getLang()` (auto → exact match → prefix match → fall back to zh-CN).

---

## 🧩 Detailed Code Structure

### 🎨 Design Tokens and CSS Layering

```css
:root{
  --brand-1:#10172F; --brand-2:#283558; --brand-3:#525288; --brand-4:#A5A8BA;  /* four brand colours */
  --md-primary:#525288; --md-primary-container:#E1E0FF; …                         /* MD3-derived palette */
  --md-easing-standard / emphasized / accelerated / decelerated;                  /* motion tokens */
  --md-dur-short:150ms; --md-dur-medium:250ms; --md-dur-long:400ms;
}
```

CSS layering: reset → fonts → tokens → motion → skeleton → top bar → page containers → list items → bottom bar → buttons/FAB → forms → search → settings → modals/Toast → responsive. The dark theme is implemented by overriding variables via `[data-theme="dark"]`; all colour changes transition smoothly through `*{transition-property:…;transition-duration:.25s}`.

### ⚙️ JS Module Map

| Area | Key functions |
| --- | --- |
| State | `Store` (load/save/set) |
| Utilities | `$` `$$` `el` `uid` `attachRipple` `initGlobalRipple` |
| Icon matching | `normText` `latinMatch` `autoIconFor` `resolveIcon` |
| i18n | `getLang` `t` |
| Theme/layout | `applyTheme` `updateLayout` |
| Top bar | `renderTopbar` `setTopbarTitle` |
| Home | `renderHome` `showHomeView` `completeItem` `resetChecklist` `checkAutoReset` |
| Bottom bar/page turns | `renderBottombar` `switchChecklist` `switchPage` |
| Forms | `openForm` `renderForm` `renderFormItems` `appendFormItem` `refreshChecklistIconRow` |
| Data exchange | `handleExport` `downloadViaAnchor` `finishImport` `handleImport` |
| Settings | `renderSettings` `toggleDropdown` `openLanguageMenu` |
| Modals | `openIconPicker` `renderIconPickerGrid` `selectIcon` |
| Navigation | `openSettingsFrom` `goBackFromSettings` `openExternal` |
| Animation utilities | `swapIcon` `popIcon` `smoothCenter` |
| Startup | `bindEvents` `updateStaticLabels` `init` |

### ✨ Animation System

- **Interruption-token pattern**: every interruptible animation (page turns, title, scrolling, icon swaps) holds an incrementing token; timer callbacks validate the token first and silently exit when a newer animation interrupts;
- **Page turn/switch**: old content slides out 40px with acceleration over 150ms + fades out → new content slides in 40px from the opposite direction with deceleration over 300ms (the same pattern in `switchPage` and `switchChecklist`);
- **Title flip**: the whole title flips out over 140ms → flips back in with deceleration over 240ms, direction decided by the page-turn direction (forward = up, back = down);
- **Coffee page**: enter/exit uses `@keyframes` (reliable on Android); when switching checklists it is treated as a "special checklist item" and flips with the scroll area (the `instant` path disables its own animation);
- **FLIP**: completing a checklist item drives height collapse via CSS transitions, without a full re-render.

---

## 📱 APK Packaging (HBuilderX)

### 📦 Steps

Create a new 5+ App project (package name `com.crazysue.checklist`) → put the HTML in as the entry page → edit manifest.json → cloud/offline packaging → certificate → package.

### 🔌 plus APIs Used

| API | Purpose |
| --- | --- |
| `plus.io.requestFileSystem(plus.io.PRIVATE_DOC, …)` | Export .checklist to the app's private directory (**do not switch back to the public-directory approach**) |
| `plus.runtime.openURL(url)` | Open external links in the system's default browser |
| `plus.os.name` | Platform detection (Android import does **not** filter with `accept`) |

### ⚠️ Platform Pitfall Checklist

- Android file input must drop the `accept` attribute, otherwise no files are selectable in the system picker;
- Writing to the public Download folder on Android 10+ (File path / MediaStore / SAF) fails on some devices entirely (0-byte files) — v1.0 finally fell back to the app's private directory;
- `window.open(url,'_blank','noopener')` opens two tabs — use anchor links or `plus.runtime.openURL` for external links;
- `scrollTo({behavior:'smooth'})` silently fails in old WebViews — custom scrolling uses rAF + easing writing straight to `scrollTop`;
- `screen.orientation` reflects the monitor rather than the window — only the window's own aspect ratio is used for portrait/landscape detection;
- Critical enter/exit animations use `@keyframes` instead of "initial state → class switch" transitions;
- inline-block collapses leading whitespace — title suffixes stay inline;
- Removing the ripple immediately on pointerup feels too fast — let it keep playing until it finishes after release.

---

## 🧠 Key Technical Decisions and Pitfall Notes

| Topic | Decision | Rationale |
| --- | --- | --- |
| Page direction model | New/Settings pages always slide in from the right; checklist pages slide in from the left; "back" from Settings to New reverses the direction | Matches the user's mental model |
| Title animation end state | The whole title (name + "Checklist") flips up/down together, applied on all pages | The early "name flip + suffix move" dual-track approach had recurring teleport/overlap issues |
| Coffee page | Flips with the scroll area on switch; moves down and fades out on reset | Unified page-turn look and feel |
| Automatic blank row | The end always has an auto row without a delete button; clearing the previous item removes it with an animation; clearing the first item never deletes it | Balance between input experience and "no invisible buttons" |
| Export | App private directory (APK) / anchor download (Web) | Reliable across Android versions |
| Icon keywords | 630+ words per language, current language first with English fallback, whole-word matching for Western scripts | Balance between hit rate and false positives |

---

## 🧪 Testing Guide

### 🧰 Toolchain

- **jsdom**: strips base64 assets before loading the HTML for speed; `beforeParse` injects state seeds and polyfills (`scrollIntoView`/`matchMedia`/`URL.createObjectURL`, etc.);
- **`_sim099.js`**: behaviour simulation — real DOM events drive complete user flows, and animation intermediate states are sampled to assert timing;
- **`_smoke099.js` / `_smoke099b.js`**: functional regression + code string-level checks.

### 📝 Example Simulation Case

```js
// beforeParse: state seed + layout geometry mock
window.localStorage.setItem('checklist_app_state_v1', JSON.stringify(state));
window.Element.prototype.getBoundingClientRect = function(){ /* return per need */ };
// real events drive the flow + intermediate-state sampling assertions
input.focus(); input.value='drink water';
input.dispatchEvent(new w.Event('input', {bubbles:true}));
await sleep(60); check('auto blank row animates away', !!document.querySelector('.form-item.removing'));
```

### ✅ Pre-Release Checklist

- [ ] `node --check` passes;
- [ ] `_sim099.js` green twice in a row;
- [ ] `_smoke099.js` and `_smoke099b.js` all green;
- [ ] grep confirms version number, leftover deleted items, and key API markers;
- [ ] On-device verification: export/import/external links/light-dark/portrait-landscape/title flip/ripple.

---

## 🎨 MD3 Design Specification Quick Reference

- Theme colours: `#10172F` `#283558` `#525288` `#A5A8BA`; light theme seeds from `#525288`, dark theme from `#283558`;
- State layers: hover 8% / active 12% transparent black;
- Font: HarmonyOS Sans SC (400/500/700, **do not subset** — user content can contain any Han character);
- Icons: Material Symbols Rounded (variable font, `font-variation-settings` controls FILL/wght), must come from Google Fonts;
- Motion: only flip-in/fade-in/ripple/scale allowed; appearing/disappearing out of nowhere is forbidden; easing and durations always use tokens;
- Switch: 0.8.0 spec (off 12px / on 24px), no press-stretch, emphasized non-linear transition.

---

## 📜 Version History

| Version | Highlights |
| ----- | ------------------------------------------------------------------------- |
| 0.7.0 | First usable version (too large to upload to GitHub)                                              |
| 0.8.0 | Initial review baseline                                                                    |
| 0.9.0 | Bottom bar focus, coffee page transitions, edit page navigation, localised icon categories, 200+ keywords/language, .checklist export, sponsor button, ripple clipping, landscape left sidebar, embedded Bold |
| 0.9.5 | Page-turn direction rules, edit↔new flipping, switch spec, automatic blank rows, title shift animation                                          |
| 0.9.6 | Settings back direction, Android export/import, title up/down flip, dark transition, portrait/landscape detection rewrite                                         |
| 0.9.7 | Title animation timing, coffee page fade-out, empty-row trimming, switch regression to 0.8.0, attribution merge                                          |
| 0.9.8 | Android focus centring, import without accept, three-tier export chain, unified title choreography, faster ripples, performance optimisation                                  |
| 0.9.9 | Whole-title flip on all pages, unified 40px page-turn animation, icon cleanup, full-element theme transitions, focus easing scroll, fast interruption                            |
| 1.0.0 | Export back to private directory, dropdown fast interruption, dead code cleanup, startup optimisation —— 🎉 official release                                      |
