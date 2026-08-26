// Checklist v0.9.0 -> v0.9.5 upgrade runner
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, '..', 'Checklist-v0.9.0.html');
const OUT = path.join(__dirname, '..', 'Checklist-v0.9.5.html');

let html = fs.readFileSync(SRC, 'utf8');
if (html.indexOf('\r') >= 0) { console.error('CRLF detected'); process.exit(1); }

let fail = 0;
function apply(oldStr, newStr, expect) {
  const c = html.split(oldStr).length - 1;
  if (c !== expect) { console.error('COUNT MISMATCH (expect ' + expect + ', got ' + c + '): ' + JSON.stringify(oldStr.slice(0, 90))); fail++; return; }
  html = html.split(oldStr).join(newStr);
}

// ---- 版本 ----
apply("const APP_VERSION = 'Release v0.9.0';", "const APP_VERSION = 'Release v0.9.5';", 1);

// ---- #1 重置时咖啡退出：更快、与其它动效协调 ----
apply(
".all-done.leaving{opacity:0;transform:translateY(56px);}",
".all-done.leaving{opacity:0;transform:translateY(64px);transition:opacity 180ms var(--md-easing-emphasized-accelerate),transform 220ms var(--md-easing-emphasized-accelerate);}",
1);
apply(
"    doneView.classList.add('leaving');\n    setTimeout(()=>{\n      renderHome(true);\n      renderBottombar();\n    }, 350);",
"    doneView.classList.add('leaving');\n    setTimeout(()=>{\n      renderHome(true);\n      renderBottombar();\n    }, 220);",
1);

// ---- #2 页面方向规则：新建/设置页始终从右侧滑入；检查单页从左侧滑入 ----
apply(
"  // 判断方向：home在左，form/settings在右\n  const order = ['home','form','settings'];\n  const curIdx = order.indexOf(currentPage);\n  const tgtIdx = order.indexOf(target);\n  const goRight = tgtIdx > curIdx;",
"  // 方向规则：新建/设置页始终从右侧滑入（向左滑），检查单页从左侧滑入（向右滑）\n  // （设置→检查单即为唯一的从左侧滑到右侧的情形）\n  const goRight = target !== 'home';",
1);

// ---- #3 横屏检测改为 JS 类名（竖屏用底栏、横屏用左栏、横屏占满页面） ----
apply(
"/* ===== 横屏模式：底栏移到左侧成为竖排导航栏（MD3 Navigation Rail 规范） ===== */\n@media (orientation:landscape){\n  #app{\n    display:grid;\n    grid-template-columns:84px minmax(0,1fr);\n    grid-template-rows:48px auto minmax(0,1fr);\n    grid-template-areas:\n      \"topbar topbar\"\n      \"search search\"\n      \"rail main\";\n  }\n  .topbar{grid-area:topbar;height:48px;flex-shrink:0;}\n  .search-bar{grid-area:search;}\n  .bottombar{\n    grid-area:rail;\n    flex-direction:column;width:84px;height:100%;\n    border-top:none;border-right:1px solid var(--md-outline-variant);\n    overflow:hidden;\n  }\n  .bottombar-scroll{flex-direction:column;overflow-x:hidden;overflow-y:auto;}\n  .nav-tab{width:84px;min-width:0;flex:0 0 auto;padding:10px 0 10px;gap:4px;}\n  .nav-tab .tab-label{font-size:11px;max-width:80px;}\n  .main-area{grid-area:main;min-width:0;min-height:0;}\n  /* 检查项宽度/高度不与左栏冲突 */\n  .check-item{margin-left:12px;margin-right:12px;}\n}",
"/* ===== 横屏模式（html.landscape）：底栏移到左侧成为竖排导航栏（MD3 Navigation Rail 规范），并占满页面 ===== */\nhtml.landscape #app{\n  display:grid;\n  grid-template-columns:84px minmax(0,1fr);\n  grid-template-rows:48px auto minmax(0,1fr);\n  grid-template-areas:\n    \"topbar topbar\"\n    \"search search\"\n    \"rail main\";\n  max-width:none;width:100%;\n}\nhtml.landscape .topbar{grid-area:topbar;height:48px;flex-shrink:0;}\nhtml.landscape .search-bar{grid-area:search;}\nhtml.landscape .bottombar{\n  grid-area:rail;\n  flex-direction:column;width:84px;height:100%;\n  border-top:none;border-right:1px solid var(--md-outline-variant);\n  overflow:hidden;\n}\nhtml.landscape .bottombar-scroll{flex-direction:column;overflow-x:hidden;overflow-y:auto;}\nhtml.landscape .nav-tab{width:84px;min-width:0;flex:0 0 auto;padding:10px 0 10px;gap:4px;}\nhtml.landscape .nav-tab .tab-label{font-size:11px;max-width:80px;}\nhtml.landscape .main-area{grid-area:main;min-width:0;min-height:0;}\n/* 检查项宽度/高度不与左栏冲突 */\nhtml.landscape .check-item{margin-left:12px;margin-right:12px;}",
1);
// updateLayout 函数
apply(
"  document.documentElement.setAttribute('data-theme', dark?'dark':'light');\n  const meta = document.querySelector('meta[name=theme-color]');\n  if(meta) meta.content = dark?'#131318':'#FCF8FF';\n}",
"  document.documentElement.setAttribute('data-theme', dark?'dark':'light');\n  const meta = document.querySelector('meta[name=theme-color]');\n  if(meta) meta.content = dark?'#131318':'#FCF8FF';\n}\n/* ---------- 横竖屏布局（横屏用左栏并占满页面，竖屏用底栏） ---------- */\nfunction updateLayout(){\n  let land = false;\n  // 1) 优先使用屏幕物理方向（不受软键盘收缩视口影响）\n  if(window.screen && screen.orientation && screen.orientation.type){\n    land = screen.orientation.type.indexOf('landscape') === 0;\n  }\n  // 2) 回退：媒体查询\n  else if(window.matchMedia && window.matchMedia('(orientation: landscape)').matches){\n    land = true;\n  }\n  // 3) 最终回退：视口宽高比较\n  else{\n    const w = window.innerWidth || document.documentElement.clientWidth || 0;\n    const h = window.innerHeight || document.documentElement.clientHeight || 0;\n    land = w > h;\n  }\n  document.documentElement.classList.toggle('landscape', land);\n}",
1);
apply(
"  // 系统主题变化\n  if(window.matchMedia){\n    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ()=>{\n      if(Store.state.settings.theme==='auto') applyTheme();\n    });\n  }",
"  // 系统主题变化\n  if(window.matchMedia){\n    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ()=>{\n      if(Store.state.settings.theme==='auto') applyTheme();\n    });\n  }\n\n  // 横竖屏切换：横屏用左栏，竖屏用底栏\n  window.addEventListener('resize', updateLayout);\n  window.addEventListener('orientationchange', ()=>setTimeout(updateLayout, 60));",
1);
apply(
"function init(){\n  Store.load();\n  applyTheme();\n  bindEvents();",
"function init(){\n  Store.load();\n  applyTheme();\n  updateLayout();\n  bindEvents();",
1);

// ---- #4 图标切换动画提速 + 只缩放图标不缩放按钮 ----
apply(
"function swapIcon(iconEl, nextIcon){\n  if(!iconEl || iconEl.textContent === nextIcon) return;\n  const token = (iconEl._swapT = (iconEl._swapT||0)+1);\n  const t = token;\n  iconEl.style.transition = 'transform 110ms var(--md-easing-standard-accelerate)';\n  iconEl.style.transform = 'scale(1.35)';\n  setTimeout(()=>{\n    if(iconEl._swapT !== t) return;\n    iconEl.textContent = nextIcon;\n    iconEl.style.transition = 'transform 240ms var(--md-easing-emphasized-decelerate)';\n    iconEl.style.transform = 'scale(1)';\n    setTimeout(()=>{\n      if(iconEl._swapT === t){ iconEl.style.transition=''; iconEl.style.transform=''; }\n    }, 250);\n  }, 110);\n}",
"function swapIcon(iconEl, nextIcon){\n  if(!iconEl || iconEl.textContent === nextIcon) return;\n  const token = (iconEl._swapT = (iconEl._swapT||0)+1);\n  const t = token;\n  iconEl.style.transition = 'transform 90ms var(--md-easing-standard-accelerate)';\n  iconEl.style.transform = 'scale(1.3)';\n  setTimeout(()=>{\n    if(iconEl._swapT !== t) return;\n    iconEl.textContent = nextIcon;\n    iconEl.style.transition = 'transform 180ms var(--md-easing-emphasized-decelerate)';\n    iconEl.style.transform = 'scale(1)';\n    setTimeout(()=>{\n      if(iconEl._swapT === t){ iconEl.style.transition=''; iconEl.style.transform=''; }\n    }, 200);\n  }, 90);\n}\n/* 图标弹跳（自动选中的常用图标提示） */\nfunction popIcon(iconEl){\n  if(!iconEl) return;\n  const token = (iconEl._popT = (iconEl._popT||0)+1);\n  const t = token;\n  iconEl.style.transition = 'transform 110ms var(--md-easing-emphasized-accelerate)';\n  iconEl.style.transform = 'scale(1.3)';\n  setTimeout(()=>{\n    if(iconEl._popT !== t) return;\n    iconEl.style.transition = 'transform 200ms var(--md-easing-emphasized-decelerate)';\n    iconEl.style.transform = 'scale(1)';\n    setTimeout(()=>{ if(iconEl._popT===t){ iconEl.style.transition=''; iconEl.style.transform=''; } }, 220);\n  }, 110);\n}",
1);
// 预览按钮：按钮只淡入，图标负责缩放
apply(
"/* 预览按钮放大淡入 */\n.icon-circle-btn.pop-in{animation:circle-pop-in var(--md-dur-medium) var(--md-easing-emphasized-decelerate);}\n@keyframes circle-pop-in{from{transform:scale(.6);opacity:0;}to{transform:scale(1);opacity:1;}}",
"/* 预览按钮：按钮只淡入，图标负责放大淡入（不缩放按钮） */\n.icon-circle-btn.preview-enter{animation:preview-fade var(--md-dur-medium) var(--md-easing-emphasized-decelerate);}\n@keyframes preview-fade{from{opacity:0;}to{opacity:1;}}\n.icon-circle-btn .icon.icon-pop{animation:icon-pop var(--md-dur-medium) var(--md-easing-emphasized-decelerate);}\n@keyframes icon-pop{from{transform:scale(.4);}to{transform:scale(1);}}",
1);

// ---- #5 新建页顶栏设置按钮颜色与检查单页一致 ----
apply("      setSettingsIcon('settings', 'settings', true);", "      setSettingsIcon('settings', 'settings', false);", 1);

// ---- #6/#9 表单页内切换（编辑↔新建）：翻动动画 + 重复点击新建无响应 ----
apply(
"function openForm(checklistId){\n  // checklistId 为 null 表示新建\n  Store.state._editing = checklistId;",
"function openForm(checklistId){\n  // 已在新建页再次点击新建：无响应\n  if(checklistId===null && currentPage==='form' && formMode==='new') return;\n  // checklistId 为 null 表示新建\n  Store.state._editing = checklistId;",
1);
apply(
"  if(currentPage === 'form'){\n    // 已在表单页（如从编辑切到新建）：用淡入动画过渡\n    const content = $('#formContent');\n    content.style.transition = 'opacity 150ms cubic-bezier(.3,0,.8,.15)';\n    content.style.opacity = '0';\n    setTimeout(()=>{\n      renderForm();\n      renderTopbar('form');\n      renderBottombar();\n      content.style.transition = 'none';\n      content.style.opacity = '0';\n      requestAnimationFrame(()=>{\n        content.style.transition = 'opacity 250ms cubic-bezier(.05,.7,.1,1)';\n        content.style.opacity = '1';\n      });\n    }, 150);\n  }else{",
"  if(currentPage === 'form'){\n    // 已在表单页（如从编辑切到新建）：与主页翻到新建页一致的翻动动画\n    // （旧内容左滑淡出，新内容从右侧滑入）\n    const content = $('#formContent');\n    content.style.transition = 'transform 150ms cubic-bezier(.3,0,.8,.15), opacity 120ms cubic-bezier(.3,0,.8,.15)';\n    content.style.transform = 'translateX(-40px)';\n    content.style.opacity = '0';\n    setTimeout(()=>{\n      renderForm();\n      renderTopbar('form');\n      renderBottombar();\n      content.style.transition = 'none';\n      content.style.transform = 'translateX(40px)';\n      content.style.opacity = '0';\n      requestAnimationFrame(()=>requestAnimationFrame(()=>{\n        content.style.transition = 'transform 300ms cubic-bezier(.05,.7,.1,1), opacity 250ms cubic-bezier(.05,.7,.1,1)';\n        content.style.transform = 'translateX(0)';\n        content.style.opacity = '1';\n        setTimeout(()=>{\n          content.style.transition=''; content.style.transform=''; content.style.opacity='';\n        }, 320);\n      }));\n    }, 150);\n  }else{",
1);

// ---- #7 赞助按钮图标颜色统一 + 简中使用闪电图标；语言按钮加水波 ----
apply(
".support-card .sc-icon{font-size:28px;color:var(--md-primary);flex-shrink:0;position:relative;z-index:1;}",
".support-card .sc-icon{font-size:28px;color:var(--md-on-surface-variant);flex-shrink:0;position:relative;z-index:1;}",
1);
apply(
"  coffeeBtn.appendChild(el('span', {class:'icon sc-icon'}, 'local_cafe'));",
"  coffeeBtn.appendChild(el('span', {class:'icon sc-icon'}, getLang()==='zh-CN' ? 'bolt' : 'local_cafe'));",
1);
apply(
"  const langItem = el('div', {class:'settings-item'});",
"  const langItem = el('div', {class:'settings-item clickable'});",
1);
apply("  langItem.style.cursor='pointer';\n", "", 1);

// ---- #12 下拉动画统一（MIT / OSS / 自动重置时间共用 toggleDropdown） ----
apply(
"/* ---------- 设置页面 ---------- */\nfunction renderSettings(){",
"/* 下拉展开/收起（统一动画：MIT / OSS / 自动重置时间共用） */\nfunction toggleDropdown(dd){\n  const willOpen = !dd.classList.contains('open');\n  const body = dd.querySelector('.dropdown-body');\n  if(!body) return;\n  if(willOpen){\n    dd.classList.add('open');\n    body.style.maxHeight = body.scrollHeight + 'px';\n  }else{\n    body.style.maxHeight = body.scrollHeight + 'px';\n    void body.offsetHeight;\n    body.style.maxHeight = '0px';\n    dd.classList.remove('open');\n  }\n}\n\n/* ---------- 设置页面 ---------- */\nfunction renderSettings(){",
1);
apply(
"      const header = el('div', {class:'dropdown-header clickable', onclick:()=>{\n        const willOpen = !dd.classList.contains('open');\n        const body = dd.querySelector('.dropdown-body');\n        if(willOpen){\n          dd.classList.add('open');\n          body.style.maxHeight = body.scrollHeight + 'px';\n        }else{\n          body.style.maxHeight = body.scrollHeight + 'px';\n          void body.offsetHeight;\n          body.style.maxHeight = '0px';\n          dd.classList.remove('open');\n        }\n      }});",
"      const header = el('div', {class:'dropdown-header clickable', onclick:()=>toggleDropdown(dd)});",
1);
apply(
"  const mitHeader = el('div', {class:'dropdown-header clickable', onclick:()=>{\n    const willOpen = !mitDd.classList.contains('open');\n    const body = mitDd.querySelector('.dropdown-body');\n    if(willOpen){\n      // 先展开：设为内容高度以触发过渡\n      mitDd.classList.add('open');\n      body.style.maxHeight = body.scrollHeight + 'px';\n    }else{\n      // 收起：先设回当前高度（覆盖 none），再强制重排，再设 0 触发过渡\n      body.style.maxHeight = body.scrollHeight + 'px';\n      void body.offsetHeight;\n      body.style.maxHeight = '0px';\n      mitDd.classList.remove('open');\n    }\n  }});",
"  const mitHeader = el('div', {class:'dropdown-header clickable', onclick:()=>toggleDropdown(mitDd)});",
1);
apply(
"  const ossHeader = el('div', {class:'dropdown-header clickable', onclick:()=>{\n    const willOpen = !ossDd.classList.contains('open');\n    const body = ossDd.querySelector('.dropdown-body');\n    if(willOpen){\n      ossDd.classList.add('open');\n      body.style.maxHeight = body.scrollHeight + 'px';\n    }else{\n      body.style.maxHeight = body.scrollHeight + 'px';\n      void body.offsetHeight;\n      body.style.maxHeight = '0px';\n      ossDd.classList.remove('open');\n    }\n  }});",
"  const ossHeader = el('div', {class:'dropdown-header clickable', onclick:()=>toggleDropdown(ossDd)});",
1);

// ---- #13 合并署名行 ----
apply(
"  about.appendChild(el('div', {class:'about-glm'}, t('made_by')));\n  about.appendChild(el('div', {class:'about-glm'}, t('maintained_by')));",
"  about.appendChild(el('div', {class:'about-glm'}, t('made_by') + ' ｜ ' + t('maintained_by')));",
1);

// ---- #17 CrazySue 链接使用真实 href + openExternal（已支持 APK 默认浏览器） ----
apply("  const link = el('a', {href:'#'}, 'Crazy Sue');", "  const link = el('a', {href:APP_AUTHOR_URL}, 'Crazy Sue');", 1);

// ---- #14 开关：去掉按压拉伸，改为非线性滑动+放大缩小 ----
apply(
".switch .switch-thumb{\n  position:absolute;\n  width:16px;height:16px;border-radius:50%;\n  background:var(--md-on-surface-variant);\n  /* 关闭：球在左侧，与左边缘保留 8px 空隙（MD3 规范） */\n  left:8px;\n  top:50%;transform:translateY(-50%);\n  transition:left var(--md-dur-medium) var(--md-easing-emphasized),\n             width var(--md-dur-medium) var(--md-easing-emphasized),\n             height var(--md-dur-medium) var(--md-easing-emphasized),\n             background-color var(--md-dur-medium) var(--md-easing-standard);\n}\n.switch.on{background:var(--md-primary);border-color:var(--md-primary);}\n/* 开启：球 24px，移到右侧，与右边缘保留 4px 空隙（MD3 规范） */\n.switch.on .switch-thumb{left:20px;width:24px;height:24px;background:var(--md-on-primary);}\n/* 按下时球横向拉伸（MD3 规范），拉伸时仍与边缘保留空隙 */\n.switch:active:not(.on) .switch-thumb{width:20px;}\n.switch.on:active .switch-thumb{left:16px;width:28px;}",
".switch .switch-thumb{\n  position:absolute;left:6px;top:50%;\n  width:24px;height:24px;margin-top:-12px;border-radius:50%;\n  background:var(--md-on-surface-variant);\n  transform:translateX(0) scale(.6667);\n  transform-origin:center;\n  transition:transform var(--md-dur-medium) var(--md-easing-emphasized),\n             background-color var(--md-dur-medium) var(--md-easing-standard);\n}\n.switch.on{background:var(--md-primary);border-color:var(--md-primary);}\n/* 开启：小球非线性滑动并放大（24px），与右边缘保留 4px 空隙；无按压拉伸 */\n.switch.on .switch-thumb{transform:translateX(14px) scale(1);background:var(--md-on-primary);}",
1);

console.log('0.9.5 patches done, fail =', fail);
if (fail > 0) { console.error('ABORT'); process.exit(1); }
fs.writeFileSync(OUT, html, 'utf8');
console.log('OK: v0.9.5 written, size =', html.length);
