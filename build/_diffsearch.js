const fs = require('fs');
const path = require('path');
const a = fs.readFileSync(path.join(__dirname, '..', 'Checklist-v0.8.0.html'), 'utf8');
const b = fs.readFileSync(path.join(__dirname, '..', 'Checklist-v0.9.5.html'), 'utf8');
function block(s, from, to){ const i = s.indexOf(from); const j = s.indexOf(to, i); return s.slice(i, j); }
const cssA = block(a, '/* ---------- 搜索栏 ---------- */', '/* ---------- 设置页面 ---------- */');
const cssB = block(b, '/* ---------- 搜索栏 ---------- */', '/* ---------- 设置页面 ---------- */');
console.log('search CSS identical:', cssA === cssB);
const jsA = block(a, '/* ---------- 搜索 ---------- */', '/* ---------- 页面切换 ---------- */');
const jsB = block(b, '/* ---------- 搜索 ---------- */', '/* ---------- 页面切换 ---------- */');
console.log('search JS identical:', jsA === jsB);
const htmlA = block(a, '<!-- 搜索栏 -->', '<!-- 主区域');
const htmlB = block(b, '<!-- 搜索栏 -->', '<!-- 主区域');
console.log('search HTML identical:', htmlA === htmlB);
// switch css final
const sw = block(b, '.switch .switch-thumb{', '/* 单选按钮组');
console.log('--- switch thumb css ---');
console.log(sw.slice(0, 700));
