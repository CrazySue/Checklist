# 檢查單開發指北

> [!TIP]
> 本文件是面向開發者的技術文件：架構、建置管線、測試與踩雷紀錄。  
> 專案介紹、特色與下載方式請見 [README](https://github.com/CrazySue/Checklist/blob/main/docs/readme/README-zh_TW.md)。  

> 目前版本：`Release v1.0.0` ｜ 倉庫：https://github.com/CrazySue/Checklist

---

## 🏗️ 架構總覽

### 🧱 單一檔案結構

應用程式是**一個 HTML 檔案**（約 40 MB），內部自上而下分為四層：

| 區域 | 內容 |
| --- | --- |
| `<head>` 內 `<style id="embedded-fonts">` | 3 段 `@font-face`（HarmonyOS Sans SC 400/500/700 + Material Symbols Rounded），base64 內嵌、`font-display:swap` |
| `<head>` 內主 `<style>` | 全部 CSS：設計權杖 → 元件樣式 → 動畫 → 響應式（含 `html.landscape` 橫式左欄） |
| `<body>` | 應用程式骨架：頂欄 / 搜尋列 / 三個絕對定位疊加的頁面容器 / 底欄 + 彈窗（圖示選擇、語言選擇、Toast） |
| `<script>` | 全部 JavaScript（約 3800 行）：狀態 → 工具 → i18n → 主題/版面 → 渲染 → 表單 → 資料交換 → 設定 → 啟動 |

### 🔀 資料流

**「狀態集中 + 渲染函式 + DOM 直操作動畫」** 的混合模型：

```text
使用者互動
   │
   ├── 資料變更 ──→ Store.save()（localStorage 持久化）
   │                   └──→ 明確呼叫 renderXxx() 重新渲染對應區域
   │
   └── 純視覺變更（勾選、翻頁、漣漪）──→ 直接操作 DOM / 內嵌樣式（不重新渲染）
```

> [!WARNING]
> 凡涉及動畫的狀態變化必須**直接操作 DOM**，不要觸發整體重新渲染。

### 🗂️ 狀態模型

持久化於 `localStorage` 鍵 `checklist_app_state_v1`：

```js
state = {
  checklists: [
    { id, name, icon, resetHours,          // icon: 'auto' | 圖示名稱
      items: [{ id, text, icon, done }],
      completedAt, createdAt }
  ],
  activeChecklistId: id | null,
  settings: {
    theme: 'auto' | 'light' | 'dark',
    itemHeight: 64,        // 56~120
    firstOnly: false,      // 僅首項套用自訂高度
    language: 'auto' | 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru' | 'pt'
  }
}
```

暫存態（不持久化）為模組層級變數：`currentPage`、`formMode`（`'new'|'edit'`）、`formState`、`settingsFromPage`、`titleFlipDir`、`titleAnimToken`、`switchAnimToken`、`currentHomeView` 等。

---

## 📂 倉庫結構（GitHub）

```text
.
├── .github/              行為準則與 Issue 範本
├── docs/                 文件
├── build/                修補程式管線、關鍵字主資料與測試套件
├── README.md             自述檔案
└── LICENSE.txt           授權條款
```

---

## 🚀 環境與測試起步

### 📦 環境需求

- 執行應用程式：任何現代瀏覽器 / HBuilderX 打包的 APK；
- 建置與測試：Node.js ≥ 16（專案在 Node 24 驗證）；`build/node_modules` 內建 jsdom 相依套件。

### 🧪 跑一遍測試

```bash
node build/_extract099.js && node --check build/_check099.js   # 語法檢查
node build/_sim099.js                                          # 使用者行為模擬（73 項斷言）
node build/_smoke099.js && node build/_smoke099b.js            # 回歸測試
```

全部輸出 `ALL PASS` 且 `uncaught errors: 0` 才算通過。

---

## 🛠️ 建置管線與開發工作流程

### 🔁 版本修補程式管線

版本升級 = 對上一版 HTML 套用 Node 修補程式指令碼。每個指令碼內的 `apply(old, new, count)` 會校驗匹配次數，任一不匹配即中止寫入。

| 指令碼 | 作用 |
| --- | --- |
| `upgrade_v09.js` + `patch_v09_css.js` + `keywords_v09.js` + `embed_font_v09.js` + `rebuild_v09.js` | 0.8.0 → 0.9.0 |
| `upgrade_v095.js` / `upgrade_v095b.js` | → 0.9.5 |
| `upgrade_v096.js` / `upgrade_v096b.js` | → 0.9.6 |
| `upgrade_v097.js` | → 0.9.7 |
| `upgrade_v098.js` | → 0.9.8 |
| `upgrade_v099.js` + `upgrade_v099b.js` + `upgrade_v099c.js` + `remove_icons_v099.js` | → 0.9.9 |
| `upgrade_v100.js` | → 1.0.0 |

### ✏️ 修改程式碼的正確姿勢

1. 直接編輯目標版本的 HTML（單一檔案，所見即所得）；
2. 將修改**同步進對應 `upgrade_vXXX.js`**（保證從舊版本可一鍵重建）；
3. 語法檢查 + 模擬/回歸全綠後再提交。

### 🎛️ 增刪圖示與關鍵字

- 圖示庫：`ICON_LIBRARY`（分類鍵 `daily / travel / shopping / sports / leisure / food / health / work / other`）；
- 新增圖示：分類陣列追加圖示名稱 → `build/keywords_v09.js` 追加 `[icon, {語言: '關鍵字|關鍵字'}]` → 重建 `AUTO_ICON_KEYWORDS` 區塊；
- 刪除圖示：圖示庫與關鍵字資料同步刪除後重建（參考 `remove_icons_v099.js`）；
- 校驗：各語言關鍵字 ≥ 200；圖示名稱必須存在於內嵌字型與 `ICON_LIBRARY`。

### 🌍 新增語言

`I18N` 新增字典（鍵集合與其他語言一致）→ `LANGUAGES` 註冊 → 關鍵字庫補齊 ≥ 200 詞 → `getLang()`（auto → 精確比對 → 前綴比對 → 回退 zh-CN）。

---

## 🧩 程式碼結構詳解

### 🎨 設計權杖與 CSS 分層

```css
:root{
  --brand-1:#10172F; --brand-2:#283558; --brand-3:#525288; --brand-4:#A5A8BA;  /* 品牌四色 */
  --md-primary:#525288; --md-primary-container:#E1E0FF; …                         /* MD3 衍生色板 */
  --md-easing-standard / emphasized / accelerated / decelerated;                  /* 動效權杖 */
  --md-dur-short:150ms; --md-dur-medium:250ms; --md-dur-long:400ms;
}
```

CSS 分層：重置 → 字型 → 權杖 → 動效 → 骨架 → 頂欄 → 頁面容器 → 清單項目 → 底欄 → 按鈕/FAB → 表單 → 搜尋 → 設定 → 彈窗/Toast → 響應式。深色主題經 `[data-theme="dark"]` 覆寫變數實現；所有顏色變化走 `*{transition-property:…;transition-duration:.25s}` 平滑過渡。

### ⚙️ JS 模組地圖

| 區塊 | 關鍵函式 |
| --- | --- |
| 狀態 | `Store`（load/save/set） |
| 工具 | `$` `$$` `el` `uid` `attachRipple` `initGlobalRipple` |
| 圖示比對 | `normText` `latinMatch` `autoIconFor` `resolveIcon` |
| i18n | `getLang` `t` |
| 主題/版面 | `applyTheme` `updateLayout` |
| 頂欄 | `renderTopbar` `setTopbarTitle` |
| 主頁 | `renderHome` `showHomeView` `completeItem` `resetChecklist` `checkAutoReset` |
| 底欄/翻頁 | `renderBottombar` `switchChecklist` `switchPage` |
| 表單 | `openForm` `renderForm` `renderFormItems` `appendFormItem` `refreshChecklistIconRow` |
| 資料交換 | `handleExport` `downloadViaAnchor` `finishImport` `handleImport` |
| 設定 | `renderSettings` `toggleDropdown` `openLanguageMenu` |
| 彈窗 | `openIconPicker` `renderIconPickerGrid` `selectIcon` |
| 跳轉 | `openSettingsFrom` `goBackFromSettings` `openExternal` |
| 動畫工具 | `swapIcon` `popIcon` `smoothCenter` |
| 啟動 | `bindEvents` `updateStaticLabels` `init` |

### ✨ 動畫系統

- **中斷權杖模式**：所有可中斷動畫（翻頁、標題、捲動、圖示交換）持有遞增權杖，計時器回呼先校驗權杖，被新動畫中斷即靜默退出；
- **翻頁/切換**：舊內容 150ms 加速滑出 40px + 淡出 → 新內容從反方向 40px 300ms 減速滑入（`switchPage` 與 `switchChecklist` 同款）；
- **標題翻動**：整個標題 140ms 翻出 → 240ms 減速翻入，方向由翻頁方向決定（前進向上、後退向下）；
- **喝咖啡頁面**：出現/退出用 `@keyframes`（Android 可靠）；檢查單切換時視為「特殊檢查項」隨捲動區翻動（`instant` 路徑停用自身動畫）；
- **FLIP**：完成檢查項時由 CSS transition 驅動高度收縮，不做整體重新渲染。

---

## 📱 APK 打包（HBuilderX）

### 📦 步驟

新建 5+ App 專案（套件名稱 `com.crazysue.checklist`）→ 放入 HTML 作為入口頁面 → 編輯 manifest.json → 雲打包/離線打包 → 憑證 → 打包。

### 🔌 用到的 plus API

| API | 用途 |
| --- | --- |
| `plus.io.requestFileSystem(plus.io.PRIVATE_DOC, …)` | 匯出 .checklist 到應用程式私有目錄（**不要再改回公開目錄方案**） |
| `plus.runtime.openURL(url)` | 外部連結跳系統預設瀏覽器 |
| `plus.os.name` | 平台判斷（安卓匯入時**不帶 accept** 過濾） |

### ⚠️ 平台坑位清單

- Android 檔案輸入必須去掉 `accept`，否則系統選擇器中所有檔案都不可選；
- Android 10+ 公開 Download 寫入（File 路徑/MediaStore/SAF）在部分裝置全部失敗（0 位元組檔案）——v1.0 最終回退應用程式私有目錄；
- `window.open(url,'_blank','noopener')` 會開兩個分頁——外部連結用錨點或 `plus.runtime.openURL`；
- `scrollTo({behavior:'smooth'})` 在舊版 WebView 靜默失敗——自訂捲動用 rAF + 緩動直寫 `scrollTop`；
- `screen.orientation` 反映顯示器而非視窗——直橫向只用視窗自身比例判定；
- 關鍵出現/退出動畫用 `@keyframes` 而非「初始態→類別切換」transition；
- inline-block 會收合前導空白——標題後綴保持 inline；
- 漣漪在 pointerup 立即移除顯得太快——放手後繼續播放至結束。

---

## 🧠 關鍵技術決策與踩雷紀錄

| 主題 | 決策 | 理由 |
| --- | --- | --- |
| 頁面方向模型 | 新建/設定頁恆從右滑入；檢查單頁從左滑入；從設定「返回」新建頁方向反轉 | 與使用者心智模型一致 |
| 標題動畫終態 | 整標題（名稱+「檢查單」）一起上下翻動，套用於所有頁面 | 早期「名稱翻動+後綴移動」雙軌方案瞬移/重疊問題反覆 |
| 喝咖啡頁面 | 切換時隨捲動區翻動；重置時向下移出+淡出 | 統一翻頁觀感 |
| 自動空行 | 末尾恆有一個無刪除按鈕的自動行；上一項清空時動畫移除；首項清空不刪除 | 輸入體驗與「無隱形按鈕」的平衡 |
| 匯出 | 應用程式私有目錄（APK）/錨點下載（Web） | 跨 Android 版本可靠 |
| 圖示關鍵字 | 每語言 630+ 詞，目前語言優先、回退英語，西文整詞比對 | 命中率與誤報的平衡 |

---

## 🧪 測試指南

### 🧰 工具鏈

- **jsdom**：載入 HTML 前剝離 base64 資源加速，`beforeParse` 注入狀態種子與 polyfill（`scrollIntoView`/`matchMedia`/`URL.createObjectURL` 等）；
- **`_sim099.js`**：行為模擬——真實 DOM 事件驅動完整使用者流程，並取樣動畫中間態斷言時序；
- **`_smoke099.js` / `_smoke099b.js`**：功能回歸 + 程式碼字串層級檢查。

### 📝 模擬用例範例

```js
// beforeParse：狀態種子 + 版面幾何 mock
window.localStorage.setItem('checklist_app_state_v1', JSON.stringify(state));
window.Element.prototype.getBoundingClientRect = function(){ /* 依需求回傳 */ };
// 真實事件驅動 + 中間態取樣斷言
input.focus(); input.value='喝水';
input.dispatchEvent(new w.Event('input', {bubbles:true}));
await sleep(60); check('自動空行動畫移除', !!document.querySelector('.form-item.removing'));
```

### ✅ 發佈前檢查清單

- [ ] `node --check` 語法通過；
- [ ] `_sim099.js` 連續 2 次全綠；
- [ ] `_smoke099.js`、`_smoke099b.js` 全綠；
- [ ] 版本號、刪除項殘留、關鍵 API 標記 grep 確認；
- [ ] 實機驗證：匯出/匯入/外部連結/深淺色/直橫向/標題翻動/漣漪。

---

## 🎨 設計規範速查（MD3）

- 主題四色：`#10172F` `#283558` `#525288` `#A5A8BA`；淺色以 `#525288`、深色以 `#283558` 為種子衍生；
- 狀態層：hover 8% / active 12% 透明黑；
- 字型：HarmonyOS Sans SC（400/500/700，**不要子集化**——使用者內容可為任意漢字）；
- 圖示：Material Symbols Rounded（可變字型，`font-variation-settings` 控制 FILL/wght），必須來自 Google Fonts；
- 動效：僅允許翻入/淡入/漣漪/縮放，禁止憑空出現/消失；緩動與時長一律走權杖；
- 開關：0.8.0 規格（關 12px / 開 24px），無按壓拉伸，emphasized 非線性過渡。

---

## 📜 版本歷史

| 版本    | 重點                                                                        |
| ----- | ------------------------------------------------------------------------- |
| 0.7.0 | 首個可用版本（由於檔案體積過大無法上傳至 GitHub）                                              |
| 0.8.0 | 初版評審基線                                                                    |
| 0.9.0 | 底欄聚焦、喝咖啡頁面翻頁、編輯頁導覽、圖示分類在地化、200+ 關鍵字/語言、.checklist 匯出、贊助按鈕、漣漪裁剪、橫式左欄、內嵌 Bold |
| 0.9.5 | 翻頁方向規則、編輯↔新建翻動、開關規格、自動空行、標題位移動畫                                          |
| 0.9.6 | 設定返回方向、安卓匯出/匯入、標題上下翻動、深色過渡、直橫判定重寫                                         |
| 0.9.7 | 標題動畫時序、喝咖啡頁面淡出、空行裁剪、開關回歸 0.8.0、署名合併                                          |
| 0.9.8 | 安卓聚焦置中、匯入去 accept、匯出三級鏈、標題統一編排、漣漪提速、效能最佳化                                  |
| 0.9.9 | 整標題翻動全頁面化、翻頁動畫統一 40px、圖示清理、全元素主題過渡、聚焦緩動捲動、快速中斷                            |
| 1.0.0 | 匯出回歸私有目錄、下拉快速中斷、無用程式碼清理、啟動最佳化 —— 🎉 正式版                                      |
