// Checklist v0.9.9 最终修复（原地更新）
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'Checklist-v0.9.9.html');
const KW_FILE = path.join(__dirname, 'keywords_v09.js');

let html = fs.readFileSync(FILE, 'utf8');
let fail = 0;
function apply(oldStr, newStr, expect) {
  const c = html.split(oldStr).length - 1;
  if (c !== expect) { console.error('COUNT MISMATCH (expect ' + expect + ', got ' + c + '): ' + JSON.stringify(oldStr.slice(0, 80))); fail++; return; }
  html = html.split(oldStr).join(newStr);
}

// ================= #1 非中文语言：后缀与名称之间的空格保证渲染（去掉 inline-block，空格不再被折叠） =================
apply(
".topbar-title .title-suffix{opacity:.6;font-weight:400;display:inline-block;}",
".topbar-title .title-suffix{opacity:.6;font-weight:400;}",
1);

// ================= #3 标题翻动支持打断（快速切换页面） =================
apply(
"function setTopbarTitle(text, suffix, mode){\n  const wrap = $('#topbarTitle');\n  const tEl = $('#topbarTitleText');\n  const sEl = $('#topbarTitleSuffix');\n  if(mode!=='flip-up' && mode!=='flip-down' && tEl.textContent===text && sEl.textContent===suffix) return;\n  if(mode==='flip-up' || mode==='flip-down'){\n    // 整个标题（名字+「检查单」）一起上下翻动；\n    // 页面从左向右翻入（后退）→ 向下翻；从右向左翻入（前进）→ 向上翻；同名也播放\n    const dirUp = mode==='flip-up';\n    wrap.style.transition = 'transform 140ms var(--md-easing-emphasized-accelerate), opacity 140ms var(--md-easing-standard-accelerate)';\n    wrap.style.transform = 'translateY('+(dirUp?-1:1)*100+'%)';\n    wrap.style.opacity = '0';\n    setTimeout(()=>{\n      tEl.textContent = text;\n      sEl.textContent = suffix;\n      wrap.style.transition = 'none';\n      wrap.style.transform = 'translateY('+(dirUp?1:-1)*100+'%)';\n      void wrap.offsetWidth;\n      wrap.style.transition = 'transform 240ms var(--md-easing-emphasized-decelerate), opacity 200ms var(--md-easing-emphasized-decelerate)';\n      wrap.style.transform = 'translateY(0)';\n      wrap.style.opacity = '1';\n      setTimeout(()=>{\n        wrap.style.transition=''; wrap.style.transform=''; wrap.style.opacity='';\n      }, 260);\n    }, 140);\n    return;\n  }",
"function setTopbarTitle(text, suffix, mode){\n  const wrap = $('#topbarTitle');\n  const tEl = $('#topbarTitleText');\n  const sEl = $('#topbarTitleSuffix');\n  if(mode!=='flip-up' && mode!=='flip-down' && tEl.textContent===text && sEl.textContent===suffix) return;\n  // 支持打断：新的动画会取消旧动画（与检查单快速切换一致）\n  const myToken = ++titleAnimToken;\n  if(mode==='flip-up' || mode==='flip-down'){\n    // 整个标题（名字+「检查单」）一起上下翻动；\n    // 页面从左向右翻入（后退）→ 向下翻；从右向左翻入（前进）→ 向上翻；同名也播放\n    const dirUp = mode==='flip-up';\n    wrap.style.transition = 'transform 140ms var(--md-easing-emphasized-accelerate), opacity 140ms var(--md-easing-standard-accelerate)';\n    wrap.style.transform = 'translateY('+(dirUp?-1:1)*100+'%)';\n    wrap.style.opacity = '0';\n    setTimeout(()=>{\n      if(myToken !== titleAnimToken) return; // 已被打断\n      tEl.textContent = text;\n      sEl.textContent = suffix;\n      wrap.style.transition = 'none';\n      wrap.style.transform = 'translateY('+(dirUp?1:-1)*100+'%)';\n      void wrap.offsetWidth;\n      wrap.style.transition = 'transform 240ms var(--md-easing-emphasized-decelerate), opacity 200ms var(--md-easing-emphasized-decelerate)';\n      wrap.style.transform = 'translateY(0)';\n      wrap.style.opacity = '1';\n      setTimeout(()=>{\n        if(myToken !== titleAnimToken) return;\n        wrap.style.transition=''; wrap.style.transform=''; wrap.style.opacity='';\n      }, 260);\n    }, 140);\n    return;\n  }",
1);
apply(
"let titleFlipDir = 'fade'; // 顶栏标题翻动方向（up=页面从左向右翻入，down=从右向左翻入，fade=淡入淡出）",
"let titleFlipDir = 'fade'; // 顶栏标题翻动方向（up=页面从左向右翻入，down=从右向左翻入，fade=淡入淡出）\nlet titleAnimToken = 0; // 标题动画打断 token",
1);

// ================= #2 删除积木图标 blocks（显示为"0S"的错误图标）及其关键词 =================
apply("'blocks',", "", 1);

// 关键词数据：移除 blocks 行并重新生成 AUTO_ICON_KEYWORDS 块
const REMOVE_ICONS = ['blocks'];
const ROWS = require(KW_FILE);
const filtered = ROWS.filter(row => !REMOVE_ICONS.includes(row[0]));
console.log('keyword rows:', ROWS.length, '->', filtered.length);
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
fs.writeFileSync(KW_FILE, 'module.exports = ' + JSON.stringify(filtered, null, 0) + ';\n', 'utf8');
console.log('OK: v0.9.9 updated, size =', html.length);
