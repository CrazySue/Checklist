const fs = require('fs');
const p = 'E:\\WorkSpace\\Checklist\\Checklist-v0.9.3.html';
const html = fs.readFileSync(p, 'utf8');
console.log('size:', html.length);

// 版本
console.log('version ok:', html.includes("APP_VERSION = 'Release v0.9.3'"));

// 标签平衡（粗略）
const tags = ['<html','</html>','<head>','</head>','<body>','</body>','<style','</style>','<script>','</script>'];
for (const t of tags) {
  const n = html.split(t).length - 1;
  if (n === 0) console.log('MISSING TAG:', t);
}
console.log('tag scan done');

// 关键特性标记
const marks = [
  ['grid rail media query', '@media(min-width:600px), (orientation:landscape) and (max-height:560px)'],
  ['compact topbar query', '@media(orientation:landscape) and (max-height:560px){'],
  ['direction rule', "const goRight = target !== 'home'"],
  ['currentHomeView reset', 'currentHomeView = null;'],
  ['coffee height 100%', "container.style.height='100%'"],
  ['entrance 240ms', 'opacity 240ms var(--md-easing-emphasized-decelerate)'],
  ['leaving 280ms', 'opacity 280ms var(--md-easing-emphasized-accelerate)'],
  ['removing 300ms', 'height 300ms var(--md-easing-emphasized)'],
  ['item entrance keyframes', '@keyframes check-item-in'],
  ['animateItemsIn', 'function animateItemsIn()'],
  ['swap rewrite', 'iconEl._swapTimer = setTimeout'],
  ['fi-remove collapse', '.form-item:not(.has-content) .fi-remove{width:0;padding:0;}'],
  ['newTab no-op', "if(currentPage==='form' && !Store.state._editing) return"],
  ['settings icon uniform', "classList.remove('is-active');\n    }\n  }else if(pageType==='settings')"],
  ['support ripple selector', "RIPPLE_SELECTOR.includes('.support-btn') || RIPPLE_SELECTOR.indexOf('.support-btn') >= 0"],
  ['lang clickable', "class:'settings-item clickable'"],
  ['support icon color', '.support-btn .icon{font-size:24px;color:var(--md-on-surface-variant)'],
  ['export .checklist', "sanitizeFileName(cl.name) + '.checklist'"],
];
let fail = 0;
for (const [name, needle] of marks) {
  const ok = html.includes(needle);
  if (!ok) { fail++; console.log('MISSING MARK:', name); }
}
console.log(fail === 0 ? 'ALL ' + marks.length + ' MARKS PRESENT' : fail + ' MARKS MISSING');

// 关键 CSS/JS 语法（script 部分）
const m = html.match(/<script>([\s\S]*?)<\/script>/);
try { new Function(m[1]); console.log('JS SYNTAX OK'); }
catch (e) { console.log('JS SYNTAX ERROR:', e.message); }
