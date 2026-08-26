const fs = require('fs');
let html = fs.readFileSync(require('path').join(__dirname, '..', 'Checklist-v0.9.0.html'), 'utf8');
const renames = [["  '日常': [","  daily: ["],["  '出行': [","  travel: ["],["  '购物': [","  shopping: ["],["  '运动': [","  sports: ["],["  '休闲': [","  leisure: ["],["  '饮食': [","  food: ["],["  '健康': [","  health: ["],["  '工作': [","  work: ["],["  '其他': [","  other: ["]];
renames.forEach(([o,n])=>{ const c = html.split(o).length-1; console.log('rename count', JSON.stringify(o), c); html = html.split(o).join(n); });
const libStart = html.indexOf('const ICON_LIBRARY = {');
const libEnd = html.indexOf('\n};', libStart);
const slice = html.slice(libStart + 'const ICON_LIBRARY = '.length, libEnd);
console.log('slice tail:', JSON.stringify(slice.slice(-80)));
try { const obj = eval('(' + slice + ')'); console.log('eval OK, keys:', Object.keys(obj).join(',')); }
catch(e){ console.log('eval FAILED:', e.message); }
