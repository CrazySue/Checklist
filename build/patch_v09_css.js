// CSS patches for v0.9.0 upgrade. Each: [old, new, expectedCount]
module.exports = [
// 10. 底栏水波局限在药丸区域
[
'.nav-tab .tab-icon-pill{\n  width:64px;height:32px;border-radius:16px;\n  display:flex;align-items:center;justify-content:center;\n  transition:background-color var(--md-dur-medium) var(--md-easing-standard);\n  position:relative;\n}',
'.nav-tab .tab-icon-pill{\n  width:64px;height:32px;border-radius:16px;\n  display:flex;align-items:center;justify-content:center;\n  transition:background-color var(--md-dur-medium) var(--md-easing-standard);\n  position:relative;overflow:hidden;\n}',
1],
// 10. 下拉菜单头部水波裁剪一致（新建/编辑页自动重置时间 & 设置页 MIT）
[
'.dropdown-header{\n  display:flex;align-items:center;gap:12px;padding:16px;cursor:pointer;\n  position:relative;transition:background-color var(--md-dur-short);\n}',
'.dropdown-header{\n  display:flex;align-items:center;gap:12px;padding:16px;cursor:pointer;\n  position:relative;overflow:hidden;transition:background-color var(--md-dur-short);\n}',
1],
// 2. 咖啡态重置时向下移动并淡出
[
'.all-done.show{opacity:1;transform:scale(1);}',
'.all-done.show{opacity:1;transform:scale(1);}\n.all-done.leaving{opacity:0;transform:translateY(56px);}',
1],
// 2. 重置后列表项进入动画
[
'.check-item.is-search-match{background:var(--md-secondary-container);color:var(--md-on-secondary-container);}',
'.check-item.is-search-match{background:var(--md-secondary-container);color:var(--md-on-secondary-container);}\n/* 重置后列表项进入动画（逐条上浮淡入） */\n.check-item.item-enter{animation:item-enter var(--md-dur-medium) var(--md-easing-emphasized-decelerate) backwards;}\n@keyframes item-enter{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}',
1],
// 6. 自动图标预览按钮弹出动画
[
'.icon-circle-btn.preview-btn .icon{font-variation-settings:\'FILL\' 1,\'wght\' 400,\'GRAD\' 0,\'opsz\' 24;}',
'.icon-circle-btn.preview-btn .icon{font-variation-settings:\'FILL\' 1,\'wght\' 400,\'GRAD\' 0,\'opsz\' 24;}\n/* 预览按钮放大淡入 */\n.icon-circle-btn.pop-in{animation:circle-pop-in var(--md-dur-medium) var(--md-easing-emphasized-decelerate);}\n@keyframes circle-pop-in{from{transform:scale(.6);opacity:0;}to{transform:scale(1);opacity:1;}}',
1],
// 9. 请作者喝咖啡按钮样式
[
'.about-glm{font-size:14px;color:var(--md-on-surface-variant);}',
'.about-glm{font-size:14px;color:var(--md-on-surface-variant);}\n/* 请作者喝咖啡按钮 */\n.support-card{\n  display:flex;align-items:center;gap:12px;\n  margin:0 16px 16px;padding:16px;border-radius:16px;\n  width:calc(100% - 32px);\n  background:var(--md-surface-container-low);color:var(--md-on-surface);\n  text-align:left;position:relative;overflow:hidden;\n  transition:background-color var(--md-dur-short) var(--md-easing-standard);\n}\n.support-card::before{\n  content:"";position:absolute;inset:0;background:currentColor;opacity:0;\n  border-radius:inherit;pointer-events:none;\n  transition:opacity var(--md-dur-short) var(--md-easing-standard);\n}\n.support-card:hover::before{opacity:.08;}\n.support-card:active::before{opacity:.12;}\n.support-card .sc-icon{font-size:28px;color:var(--md-primary);flex-shrink:0;position:relative;z-index:1;}\n.support-card .sc-text{flex:1;position:relative;z-index:1;}\n.support-card .sc-title{font-size:15px;font-weight:600;color:var(--md-primary);}\n.support-card .sc-sub{font-size:12px;color:var(--md-on-surface-variant);margin-top:2px;}\n.support-card .sc-arrow{font-size:20px;color:var(--md-on-surface-variant);flex-shrink:0;position:relative;z-index:1;}',
1],
// 开关：MD3 规格（小球不紧贴两端，保留空隙）
[
'.switch .switch-thumb{\n  position:absolute;\n  width:12px;height:12px;border-radius:50%;\n  background:var(--md-outline);\n  /* 关闭：球在左侧，距左 border 6px（8-2border），用 left 定位 */\n  left:6px;',
'.switch .switch-thumb{\n  position:absolute;\n  width:16px;height:16px;border-radius:50%;\n  background:var(--md-on-surface-variant);\n  /* 关闭：球在左侧，与左边缘保留 8px 空隙（MD3 规范） */\n  left:8px;',
1],
[
'/* 开启：球 24px，移到右侧。left = 52 - 2(border) - 24 - 6 = 20px */\n.switch.on .switch-thumb{left:22px;width:24px;height:24px;background:var(--md-on-primary);}',
'/* 开启：球 24px，移到右侧，与右边缘保留 4px 空隙（MD3 规范） */\n.switch.on .switch-thumb{left:20px;width:24px;height:24px;background:var(--md-on-primary);}',
1],
[
'/* 按下时球横向拉伸（MD3 规范） */\n.switch:active:not(.on) .switch-thumb{width:18px;}\n.switch.on:active .switch-thumb{width:28px;}',
'/* 按下时球横向拉伸（MD3 规范），拉伸时仍与边缘保留空隙 */\n.switch:active:not(.on) .switch-thumb{width:20px;}\n.switch.on:active .switch-thumb{left:16px;width:28px;}',
1],
// 触屏禁用 hover 时同样禁用咖啡按钮
[
'  .fab:hover::before{opacity:0 !important;}\n}',
'  .fab:hover::before,\n  .support-card:hover::before{opacity:0 !important;}\n}',
1],
// 11. 横屏：底栏变左侧竖排导航栏（MD3 Navigation Rail）
[
'/* ===== 横屏模式：底栏移到左侧成为导航栏（MD3 Navigation Drawer 规范） ===== */\n@media(orientation:landscape) and (max-height:480px){\n  #app{flex-direction:row;}\n  .topbar{height:48px;flex-shrink:0;width:100%;}\n  /* 横屏时顶栏横跨上方，底栏变为左侧竖栏 */\n  #app{display:flex;flex-direction:column;}\n  .main-area{flex:1;display:flex;flex-direction:row;overflow:hidden;}\n  .bottombar{flex-direction:column;width:auto;max-width:80px;border-top:none;border-right:1px solid var(--md-outline-variant);overflow-y:auto;overflow-x:hidden;}\n  .bottombar-scroll{flex-direction:column;overflow-x:hidden;overflow-y:auto;}\n  .nav-tab{min-width:auto;padding:8px 4px;}\n  .nav-tab .tab-label{font-size:10px;max-width:64px;}\n  .nav-tab .tab-icon-pill{width:48px;height:32px;}\n  /* 主区域在横屏时占满剩余空间 */\n  .page{flex:1;}\n}',
'/* ===== 横屏模式：底栏移到左侧成为竖排导航栏（MD3 Navigation Rail 规范） ===== */\n@media (orientation:landscape){\n  #app{\n    display:grid;\n    grid-template-columns:84px minmax(0,1fr);\n    grid-template-rows:48px auto minmax(0,1fr);\n    grid-template-areas:\n      "topbar topbar"\n      "search search"\n      "rail main";\n  }\n  .topbar{grid-area:topbar;height:48px;flex-shrink:0;}\n  .search-bar{grid-area:search;}\n  .bottombar{\n    grid-area:rail;\n    flex-direction:column;width:84px;height:100%;\n    border-top:none;border-right:1px solid var(--md-outline-variant);\n    overflow:hidden;\n  }\n  .bottombar-scroll{flex-direction:column;overflow-x:hidden;overflow-y:auto;}\n  .nav-tab{width:84px;min-width:0;flex:0 0 auto;padding:10px 0 10px;gap:4px;}\n  .nav-tab .tab-label{font-size:11px;max-width:80px;}\n  .main-area{grid-area:main;min-width:0;min-height:0;}\n  /* 检查项宽度/高度不与左栏冲突 */\n  .check-item{margin-left:12px;margin-right:12px;}\n}',
1],
];
