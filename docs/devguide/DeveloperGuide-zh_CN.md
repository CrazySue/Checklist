# 检查单开发指北

> [!TIP]
> 本文档是面向开发者的技术文档：架构、构建管线、测试与踩坑记录。  
> 项目介绍、特性与下载方式请见 [README](https://github.com/CrazySue/Checklist/blob/main/docs/readme/README-zh_CN.md)。  

> 当前版本：`Release v1.0.0` ｜ 仓库：https://github.com/CrazySue/Checklist

---

## 🏗️ 架构总览

### 🧱 单文件结构

应用是**一个 HTML 文件**（约 40 MB），内部自上而下分为四层：

| 区域 | 内容 |
| --- | --- |
| `<head>` 内 `<style id="embedded-fonts">` | 3 段 `@font-face`（HarmonyOS Sans SC 400/500/700 + Material Symbols Rounded），base64 内嵌、`font-display:swap` |
| `<head>` 内主 `<style>` | 全部 CSS：设计令牌 → 组件样式 → 动画 → 响应式（含 `html.landscape` 横屏左栏） |
| `<body>` | 应用骨架：顶栏 / 搜索栏 / 三个绝对定位叠加的页面容器 / 底栏 + 弹窗（图标选择、语言选择、Toast） |
| `<script>` | 全部 JavaScript（约 3800 行）：状态 → 工具 → i18n → 主题/布局 → 渲染 → 表单 → 数据交换 → 设置 → 启动 |

### 🔀 数据流

**「状态集中 + 渲染函数 + DOM 直操作动画」** 的混合模型：

```text
用户交互
   │
   ├── 数据变更 ──→ Store.save()（localStorage 持久化）
   │                   └──→ 显式调用 renderXxx() 重新渲染对应区域
   │
   └── 纯视觉变更（勾选、翻页、水波）──→ 直接操作 DOM / 内联样式（不重渲染）
```

> [!WARNING]
> 凡涉及动画的状态变化必须**直接操作 DOM**，不要触发整体重渲染。

### 🗂️ 状态模型

持久化于 `localStorage` 键 `checklist_app_state_v1`：

```js
state = {
  checklists: [
    { id, name, icon, resetHours,          // icon: 'auto' | 图标名
      items: [{ id, text, icon, done }],
      completedAt, createdAt }
  ],
  activeChecklistId: id | null,
  settings: {
    theme: 'auto' | 'light' | 'dark',
    itemHeight: 64,        // 56~120
    firstOnly: false,      // 仅首项应用自定义高度
    language: 'auto' | 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru' | 'pt'
  }
}
```

临时态（不持久化）为模块级变量：`currentPage`、`formMode`（`'new'|'edit'`）、`formState`、`settingsFromPage`、`titleFlipDir`、`titleAnimToken`、`switchAnimToken`、`currentHomeView` 等。

---

## 📂 仓库结构（GitHub）

```text
.
├── .github/              行为准则与 Issue 模板
├── docs/                 文档
├── build/                补丁管线、关键词主数据与测试套件
├── README.md             自述文件
└── LICENSE.txt           许可证
```

---

## 🚀 环境与测试起步

### 📦 环境要求

- 运行应用：任何现代浏览器 / HBuilderX 打包的 APK；
- 构建与测试：Node.js ≥ 16（项目在 Node 24 验证）；`build/node_modules` 内置 jsdom 依赖。

### 🧪 跑一遍测试

```bash
node build/_extract099.js && node --check build/_check099.js   # 语法检查
node build/_sim099.js                                          # 用户行为仿真（73 项断言）
node build/_smoke099.js && node build/_smoke099b.js            # 回归测试
```

全部输出 `ALL PASS` 且 `uncaught errors: 0` 才算通过。

---

## 🛠️ 构建管线与开发工作流

### 🔁 版本补丁管线

版本升级 = 对上一版 HTML 应用 Node 补丁脚本。每个脚本内的 `apply(old, new, count)` 会校验匹配次数，任一不匹配即中止写入。

| 脚本 | 作用 |
| --- | --- |
| `upgrade_v09.js` + `patch_v09_css.js` + `keywords_v09.js` + `embed_font_v09.js` + `rebuild_v09.js` | 0.8.0 → 0.9.0 |
| `upgrade_v095.js` / `upgrade_v095b.js` | → 0.9.5 |
| `upgrade_v096.js` / `upgrade_v096b.js` | → 0.9.6 |
| `upgrade_v097.js` | → 0.9.7 |
| `upgrade_v098.js` | → 0.9.8 |
| `upgrade_v099.js` + `upgrade_v099b.js` + `upgrade_v099c.js` + `remove_icons_v099.js` | → 0.9.9 |
| `upgrade_v100.js` | → 1.0.0 |

### ✏️ 修改代码的正确姿势

1. 直接编辑目标版本的 HTML（单文件，所见即所得）；
2. 将修改**同步进对应 `upgrade_vXXX.js`**（保证从旧版本可一键重建）；
3. 语法检查 + 仿真/回归全绿后提交。

### 🎛️ 增删图标与关键词

- 图标库：`ICON_LIBRARY`（分类键 `daily / travel / shopping / sports / leisure / food / health / work / other`）；
- 新增图标：分类数组追加图标名 → `build/keywords_v09.js` 追加 `[icon, {语言: '关键词|关键词'}]` → 重建 `AUTO_ICON_KEYWORDS` 块；
- 删除图标：库与关键词数据同步删除后重建（参考 `remove_icons_v099.js`）；
- 校验：各语言关键词 ≥ 200；图标名必须存在于内嵌字体与 `ICON_LIBRARY`。

### 🌍 添加语言

`I18N` 新增字典（键集合与其它语言一致）→ `LANGUAGES` 注册 → 关键词库补齐 ≥ 200 词 → `getLang()`（auto → 精确匹配 → 前缀匹配 → 回退 zh-CN）。

---

## 🧩 代码结构详解

### 🎨 设计令牌与 CSS 分层

```css
:root{
  --brand-1:#10172F; --brand-2:#283558; --brand-3:#525288; --brand-4:#A5A8BA;  /* 品牌四色 */
  --md-primary:#525288; --md-primary-container:#E1E0FF; …                         /* MD3 派生色板 */
  --md-easing-standard / emphasized / accelerated / decelerated;                  /* 动效令牌 */
  --md-dur-short:150ms; --md-dur-medium:250ms; --md-dur-long:400ms;
}
```

CSS 分层：重置 → 字体 → 令牌 → 动效 → 骨架 → 顶栏 → 页面容器 → 列表项 → 底栏 → 按钮/FAB → 表单 → 搜索 → 设置 → 弹窗/Toast → 响应式。深色主题经 `[data-theme="dark"]` 覆盖变量实现；所有颜色变化走 `*{transition-property:…;transition-duration:.25s}` 平滑过渡。

### ⚙️ JS 模块地图

| 区块 | 关键函数 |
| --- | --- |
| 状态 | `Store`（load/save/set） |
| 工具 | `$` `$$` `el` `uid` `attachRipple` `initGlobalRipple` |
| 图标匹配 | `normText` `latinMatch` `autoIconFor` `resolveIcon` |
| i18n | `getLang` `t` |
| 主题/布局 | `applyTheme` `updateLayout` |
| 顶栏 | `renderTopbar` `setTopbarTitle` |
| 主页 | `renderHome` `showHomeView` `completeItem` `resetChecklist` `checkAutoReset` |
| 底栏/翻页 | `renderBottombar` `switchChecklist` `switchPage` |
| 表单 | `openForm` `renderForm` `renderFormItems` `appendFormItem` `refreshChecklistIconRow` |
| 数据交换 | `handleExport` `downloadViaAnchor` `finishImport` `handleImport` |
| 设置 | `renderSettings` `toggleDropdown` `openLanguageMenu` |
| 弹窗 | `openIconPicker` `renderIconPickerGrid` `selectIcon` |
| 跳转 | `openSettingsFrom` `goBackFromSettings` `openExternal` |
| 动画工具 | `swapIcon` `popIcon` `smoothCenter` |
| 启动 | `bindEvents` `updateStaticLabels` `init` |

### ✨ 动画系统

- **打断 token 模式**：所有可打断动画（翻页、标题、滚动、图标交换）持有递增 token，定时回调先校验 token，被新动画打断即静默退出；
- **翻页/切换**：旧内容 150ms 加速滑出 40px + 淡出 → 新内容从反方向 40px 300ms 减速滑入（`switchPage` 与 `switchChecklist` 同款）；
- **标题翻动**：整个标题 140ms 翻出 → 240ms 减速翻入，方向由翻页方向决定（前进向上、后退向下）；
- **喝咖啡页面**：出现/退出用 `@keyframes`（Android 可靠）；检查单切换时视为"特殊检查项"随滚动区翻动（`instant` 路径禁用自身动画）；
- **FLIP**：完成检查项时由 CSS transition 驱动高度收缩，不做整体重渲染。

---

## 📱 APK 打包（HBuilderX）

### 📦 步骤

新建 5+ App 项目（包名 `com.crazysue.checklist`）→ 放入 HTML 作为入口页 → 编辑 manifest.json → 云打包/离线打包 → 证书 → 打包。

### 🔌 用到的 plus API

| API | 用途 |
| --- | --- |
| `plus.io.requestFileSystem(plus.io.PRIVATE_DOC, …)` | 导出 .checklist 到应用私有目录（**不要再改回公共目录方案**） |
| `plus.runtime.openURL(url)` | 外链跳系统默认浏览器 |
| `plus.os.name` | 平台判断（安卓导入时**不带 accept** 过滤） |

### ⚠️ 平台坑位清单

- Android 文件输入必须去掉 `accept`，否则系统选择器中所有文件都不可选；
- Android 10+ 公共 Download 写入（File 路径/MediaStore/SAF）在部分设备全部失败（0 字节文件）——v1.0 最终回退应用私有目录；
- `window.open(url,'_blank','noopener')` 会开两个标签页——外链用锚点或 `plus.runtime.openURL`；
- `scrollTo({behavior:'smooth'})` 在旧 WebView 静默失败——自定义滚动用 rAF + 缓动直写 `scrollTop`；
- `screen.orientation` 反映显示器而非窗口——横竖屏只用窗口自身比例判定；
- 关键出现/退出动画用 `@keyframes` 而非"初始态→类切换" transition；
- inline-block 会折叠前导空格——标题后缀保持 inline；
- 水波在 pointerup 立即移除显得过快——松手后继续播放至结束。

---

## 🧠 关键技术决策与踩坑记录

| 主题 | 决策 | 理由 |
| --- | --- | --- |
| 页面方向模型 | 新建/设置页恒从右滑入；检查单页从左滑入；从设置"返回"新建页方向反转 | 与用户心智模型一致 |
| 标题动画终态 | 整标题（名字+「检查单」）一起上下翻动，应用于所有页面 | 早期"名字翻动+后缀移动"双轨方案瞬移/重叠问题反复 |
| 喝咖啡页面 | 切换时随滚动区翻动；重置时向下移出+淡出 | 统一翻页观感 |
| 自动空白行 | 末尾恒有一个无删除按钮的自动行；上一项清空时动画移除；首项清空不删除 | 输入体验与"无隐形按钮"的平衡 |
| 导出 | 应用私有目录（APK）/锚点下载（Web） | 跨 Android 版本可靠 |
| 图标关键词 | 每语言 630+ 词，当前语言优先、回退英语，西文整词匹配 | 命中率与误报的平衡 |

---

## 🧪 测试指南

### 🧰 工具链

- **jsdom**：加载 HTML 前剥掉 base64 资源提速，`beforeParse` 注入状态种子与 polyfill（`scrollIntoView`/`matchMedia`/`URL.createObjectURL` 等）；
- **`_sim099.js`**：行为仿真——真实 DOM 事件驱动完整用户流程，并采样动画中间态断言时序；
- **`_smoke099.js` / `_smoke099b.js`**：功能回归 + 代码字符串级检查。

### 📝 模拟用例示例

```js
// beforeParse：状态种子 + 布局几何 mock
window.localStorage.setItem('checklist_app_state_v1', JSON.stringify(state));
window.Element.prototype.getBoundingClientRect = function(){ /* 按需返回 */ };
// 真实事件驱动 + 中间态采样断言
input.focus(); input.value='喝水';
input.dispatchEvent(new w.Event('input', {bubbles:true}));
await sleep(60); check('自动空行动画移除', !!document.querySelector('.form-item.removing'));
```

### ✅ 发布前检查清单

- [ ] `node --check` 语法通过；
- [ ] `_sim099.js` 连续 2 次全绿；
- [ ] `_smoke099.js`、`_smoke099b.js` 全绿；
- [ ] 版本号、删除项残留、关键 API 标记 grep 确认；
- [ ] 真机验证：导出/导入/外链/深浅色/横竖屏/标题翻动/水波。

---

## 🎨 设计规范速查（MD3）

- 主题四色：`#10172F` `#283558` `#525288` `#A5A8BA`；浅色以 `#525288`、深色以 `#283558` 为种子派生；
- 状态层：hover 8% / active 12% 透明黑；
- 字体：HarmonyOS Sans SC（400/500/700，**不要子集化**——用户内容可为任意汉字）；
- 图标：Material Symbols Rounded（可变字体，`font-variation-settings` 控制 FILL/wght），必须来自 Google Fonts；
- 动效：只允许翻入/淡入/水波/缩放，禁止凭空出现/消失；缓动与时长一律走令牌；
- 开关：0.8.0 规格（关 12px / 开 24px），无按压拉伸，emphasized 非线性过渡。

---

## 📜 版本历史

| 版本    | 要点                                                                        |
| ----- | ------------------------------------------------------------------------- |
| 0.7.0 | 首个可用版本（由于文件体积过大无法上传至 GitHub）                                              |
| 0.8.0 | 初版评审基线                                                                    |
| 0.9.0 | 底栏聚焦、喝咖啡页面翻页、编辑页导航、图标分类本地化、200+ 关键词/语言、.checklist 导出、赞助按钮、水波裁剪、横屏左栏、嵌入 Bold |
| 0.9.5 | 翻页方向规则、编辑↔新建翻动、开关规格、自动空白行、标题位移动画                                          |
| 0.9.6 | 设置返回方向、安卓导出/导入、标题上下翻动、深色过渡、横屏判定重写                                         |
| 0.9.7 | 标题动画时序、喝咖啡页面淡出、空行裁剪、开关回归 0.8.0、署名合并                                          |
| 0.9.8 | 安卓聚焦居中、导入去 accept、导出三级链、标题统一编排、水波提速、性能优化                                  |
| 0.9.9 | 整标题翻动全页面化、翻页动画统一 40px、图标清理、全元素主题过渡、聚焦缓动滚动、快速打断                            |
| 1.0.0 | 导出回归私有目录、下拉快速打断、死代码清理、启动优化 —— 🎉 正式版                                      |
