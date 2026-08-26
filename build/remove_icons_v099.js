// 删除 7 个图标及其索引关键词（glasses/skiing/puzzle/spa/vaccumes/gardening/farming）
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'Checklist-v0.9.9.html');
const KW_FILE = path.join(__dirname, 'keywords_v09.js');

let html = fs.readFileSync(FILE, 'utf8');
let fail = 0;
function apply(oldStr, newStr, expect) {
  const c = html.split(oldStr).length - 1;
  if (c !== expect) { console.error('COUNT MISMATCH (expect ' + expect + ', got ' + c + '): ' + JSON.stringify(oldStr)); fail++; return; }
  html = html.split(oldStr).join(newStr);
}
apply("'glasses',", "", 1);
apply("'skiing',", "", 1);
apply("'puzzle',", "", 1);
apply("'spa',", "", 2);
apply("'vaccumes',", "", 1);
apply("'gardening',", "", 1);
apply("'farming',", "", 1);

// 关键词数据：移除对应行
const REMOVE_ICONS = ['glasses','skiing','puzzle','spa','gardening','farming'];
let kwSrc = fs.readFileSync(KW_FILE, 'utf8');
const ROWS = eval(kwSrc.replace(/module.exportss*=s*/, 'return '));
const filtered = ROWS.filter(row => !REMOVE_ICONS.includes(row[0]));
console.log('rows before:', ROWS.length, 'after:', filtered.length, 'removed:', ROWS.length - filtered.length);

const LANGS = ['zh-CN','zh-TW','en','ja','ko','fr','de','es','ru','pt'];
const out = {};
LANGS.forEach(l=>{ out[l] = []; });
filtered.forEach(([icon, cells])=>{
  LANGS.forEach(l=>{
    cells[l].split('|').forEach(kw=>{
      kw = kw.trim();
      if(kw) out[l].push([kw.toLowerCase(), icon]);
    });
  });
});
const counts = {};
LANGS.forEach(l=>{ counts[l] = out[l].length; });
console.log('keywords per language:', JSON.stringify(counts));
LANGS.forEach(l=>{ if(counts[l] < 200){ console.error('LANG ' + l + ' below 200'); fail++; } });

// 重新生成 AUTO_ICON_KEYWORDS 块
let block = '/* ---------- 自动图标映射（按语言索引的关键词库） ----------\n   每种语言至少 200 个关键词（zh-CN/zh-TW/en/ja/ko/fr/de/es/ru/pt）。\n   匹配时先查当前语言，再回退英语；西文关键词按整词边界匹配（忽略大小写与重音），\n   中文、日文、韩文、俄文等按子串包含匹配。 */\nconst AUTO_ICON_KEYWORDS = {\n';
LANGS.forEach((l, i)=>{
  block += "  '" + l + "': " + JSON.stringify(out[l]) + (i < LANGS.length-1 ? ',\n' : '\n');
});
block += '};';
const s = html.indexOf('/* ---------- 自动图标映射（按语言索引的关键词库）');
const e = html.indexOf('/* ---------- 多语言 i18n ---------- */');
if (s < 0 || e < 0 || s >= e) { console.error('AUTO block not found'); fail++; }
else { html = html.slice(0, s) + block + '\n\n' + html.slice(e); }

if (fail > 0) { console.error('ABORT'); process.exit(1); }
fs.writeFileSync(FILE, html, 'utf8');
// 同步更新 keywords_v09.js
const newKw = 'module.exports = ' + JSON.stringify(filtered, null, 0) + ';\n';
fs.writeFileSync(KW_FILE, newKw, 'utf8');
console.log('OK: icons removed, size =', html.length);
