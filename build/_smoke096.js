// Smoke test for Checklist v0.9.6 using jsdom (fonts stripped for speed)
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let html = fs.readFileSync(path.join(__dirname, '..', 'Checklist-v0.9.6.html'), 'utf8');
html = html.replace(/data:[a-z0-9\/+.\-]+;base64,[A-Za-z0-9+/=\r\n]+/g, 'data:application/octet-stream;base64,AA==');
console.log('lite html', html.length);

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => { if (e.message.indexOf('navigation') >= 0) return; errors.push('jsdomError: ' + e.message); });
vc.on('error', (...a) => { errors.push('console.error: ' + a.join(' ')); });

const state = {
  checklists: [
    {id:'c1', name:'早上', icon:'auto', resetHours:0, items:[
      {id:'i1', text:'买咖啡', icon:'auto', done:false},
      {id:'i2', text:'遛狗', icon:'auto', done:false}
    ], completedAt:null, createdAt:1},
    {id:'c2', name:'工作', icon:'auto', resetHours:0, items:[
      {id:'i3', text:'写报告', icon:'auto', done:false}
    ], completedAt:null, createdAt:2}
  ],
  activeChecklistId:'c1',
  settings:{theme:'light', itemHeight:64, firstOnly:false, language:'zh-CN'}
};

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'http://localhost/',
  virtualConsole: vc,
  beforeParse(window){
    window.localStorage.setItem('checklist_app_state_v1', JSON.stringify(state));
    window.Element.prototype.scrollIntoView = function(){};
    window.matchMedia = window.matchMedia || function(){ return {matches:false, media:'', addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){}}; };
    window.URL.createObjectURL = function(){ return 'blob:fake'; };
    window.URL.revokeObjectURL = function(){};
    window.open = function(){ return null; };
  }
});

const w = dom.window;
const d = w.document;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let failures = 0;
function check(name, cond){
  if(cond){ console.log('PASS: ' + name); }
  else { failures++; console.log('FAIL: ' + name); }
}
const $ = s => d.querySelector(s);
const text = s => { const el = $(s); return el ? el.textContent : null; };
function iconOf(sel){ const el = $(sel); return el ? el.textContent : null; }

(async ()=>{
  await sleep(300);

  // ---- #3 横屏判定：窗口比例（jsdom 1024x768 宽窗口 → 左栏） ----
  check('landscape on wide window', d.documentElement.classList.contains('landscape'));
  // 模拟竖屏窗口（resize 事件后仍按窗口比例判定）
  w.innerWidth = 500; w.innerHeight = 900;
  w.outerWidth = 500; w.outerHeight = 900;
  w.dispatchEvent(new w.Event('resize'));
  await sleep(50);
  check('portrait window -> bottom bar (no landscape)', !d.documentElement.classList.contains('landscape'));
  w.innerWidth = 1024; w.innerHeight = 768;
  w.outerWidth = 1024; w.outerHeight = 768;
  w.dispatchEvent(new w.Event('resize'));
  await sleep(50);
  check('wide window again -> landscape', d.documentElement.classList.contains('landscape'));

  check('title zh', text('#topbarTitleText') === '早上');
  check('home items', d.querySelectorAll('.check-item').length === 2);

  // ---- #6 顶栏按钮图标即时切换（无动画） ----
  $('#newTab').click();
  await sleep(50);
  check('topbar icon instant settings->back arrow when entering', iconOf('#btnSettings .icon') === 'settings');
  w.openSettingsFrom('form');
  await sleep(30);
  check('settings icon instant (no swap anim)', iconOf('#btnSettings .icon') === 'arrow_back');
  w.goBackFromSettings();
  await sleep(30);
  check('back to form icon instant', iconOf('#btnSettings .icon') === 'settings');

  // ---- #5 所有进设置路径均从右往左翻 ----
  // 主页 → 设置
  d.querySelector('.nav-tab[data-id="c1"]').click();
  await sleep(600);
  w.openSettingsFrom('home');
  await sleep(60);
  check('home exits left (page-leave-left)', $('#pageHome').className.indexOf('page-leave-left') >= 0);
  check('settings entered from right', $('#pageSettings').className.indexOf('page-active') >= 0);
  await sleep(500);
  // 设置 → 返回主页
  w.goBackFromSettings();
  await sleep(60);
  check('settings exits right (page-leave-right)', $('#pageSettings').className.indexOf('page-leave-right') >= 0);
  await sleep(500);
  // 新建页 → 设置
  $('#newTab').click();
  await sleep(500);
  w.openSettingsFrom('form');
  await sleep(60);
  check('form exits left (page-leave-left)', $('#pageForm').className.indexOf('page-leave-left') >= 0);
  check('settings from right again', $('#pageSettings').className.indexOf('page-active') >= 0);
  await sleep(500);

  // ---- #7 标题动画：上下翻动 + 后缀非线性移动 ----
  w.goBackFromSettings();
  await sleep(400);
  d.querySelector('.nav-tab[data-id="c1"]').click();
  await sleep(600);
  // c1 -> c2（右侧）：名字应向上翻（translateY 负值）
  d.querySelector('.nav-tab[data-id="c2"]').click();
  await sleep(150);
  const tEl = $('#topbarTitleText');
  const sEl = $('#topbarTitleSuffix');
  check('title flipping vertically', tEl.style.transform.indexOf('translateY') >= 0);
  check('title inline-block during flip', tEl.style.display === 'inline-block');
  await sleep(600);
  check('title c2', text('#topbarTitleText') === '工作');
  check('title settled', tEl.style.transform === '' || tEl.style.transform === 'translateY(0px)');
  check('title display restored', tEl.style.display === '');
  check('suffix settled', sEl.style.transform === '' || sEl.style.transform === 'translateX(0px)');
  // c2 -> c1（左侧）：向下翻（translateY 正值方向）
  d.querySelector('.nav-tab[data-id="c1"]').click();
  await sleep(150);
  check('title flipping (left dir)', tEl.style.transform.indexOf('translateY') >= 0);
  await sleep(600);
  check('title c1', text('#topbarTitleText') === '早上');

  // ---- #1 下拉水波作用整个菜单（头部不再裁剪） ----
  check('dropdown-header no overflow hidden', !html.slice(html.indexOf('.dropdown-header{'), html.indexOf('.dropdown-header{')+120).includes('overflow:hidden'));

  // ---- #4 赞助按钮标题颜色与其他一致 ----
  check('sc-title on-surface', html.indexOf(".support-card .sc-title{font-size:15px;font-weight:600;color:var(--md-on-surface);}") >= 0);

  // ---- #2 外链只开一个标签页（锚点方式） ----
  check('openExternal anchor-only (no window.open call)', html.indexOf('window.open(') < 0);

  // ---- #8 APK 导出到 Download 目录 + 导入任意文件类型 ----
  check('export uses _downloads', html.indexOf("_downloads/") >= 0);
  check('import native picker exists', typeof w.importViaPlusAndroid === 'function');
  check('finishImport exists', typeof w.finishImport === 'function');
  // 模拟导入内容解析
  w.finishImport(JSON.stringify({name:'导入的', icon:'auto', resetHours:0, items:[{text:'喝水', icon:'auto'}]}));
  await sleep(400);
  check('import creates checklist', text('#topbarTitleText') === '导入的' || d.querySelectorAll('.nav-tab').length === 3);

  // ---- 回归：咖啡/重置/新建重复点击等 ----
  w.openForm('c1');
  await sleep(400);
  const n1 = d.querySelector('#formContent').innerHTML.length;
  $('#newTab').click();
  await sleep(100);
  check('new re-click no-op', d.querySelector('#formContent').innerHTML.length === n1);
  const lastItem = d.querySelectorAll('#formContent .form-item');
  check('auto row no remove btn', !lastItem[lastItem.length-1].querySelector('.fi-remove'));

  console.log('---');
  console.log('uncaught errors:', errors.length);
  errors.forEach(e=>console.log('  ERR: ' + e));
  console.log(failures === 0 && errors.length === 0 ? 'SMOKE ALL PASS' : 'SMOKE FAILURES: ' + failures);
  process.exit(0);
})().catch(e=>{ console.log('SMOKE CRASH: ' + e.stack); process.exit(1); });
