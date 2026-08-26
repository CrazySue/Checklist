const fs = require('fs');
const path = require('path');
const a = fs.readFileSync(path.join(__dirname, '..', 'Checklist-v0.8.0.html'), 'utf8');
const b = fs.readFileSync(path.join(__dirname, '..', 'Checklist-v0.9.5.html'), 'utf8');
function block(s, from, to){ const i = s.indexOf(from); const j = s.indexOf(to, i); return s.slice(i, j); }
// 0.9.5: 搜索段以新增的辅助注释为终点（辅助函数在搜索段之后插入）
const jsA = block(a, '/* ---------- 搜索 ---------- */', '/* ---------- 页面切换 ---------- */');
const jsB = block(b, '/* ---------- 搜索 ---------- */', '/* ---------- 顶栏返回/设置跳转辅助 ---------- */');
console.log('search JS identical:', jsA === jsB);
// 0.9.5: 搜索函数到 ESC 键部分对比（bindEvents 内搜索部分）
const b1 = block(b, "  // 搜索\n  $('#sbBack')", "  // 重置 FAB");
const a1 = block(a, "  // 搜索\n  $('#sbBack')", "  // 重置 FAB");
console.log('bindEvents search part identical:', a1 === b1);
