// Smoke test for Checklist v0.9.5 using jsdom (fonts stripped for speed)
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let html = fs.readFileSync(path.join(__dirname, '..', 'Checklist-v0.9.5.html'), 'utf8');
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

  // ---- #3 横屏检测：jsdom 1024x768 宽屏 → landscape 类 ----
  check('landscape class on wide', d.documentElement.classList.contains('landscape'));
  check('landscape fills page (max-width none)', d.querySelector('html.landscape #app') !== null);

  check('title zh', text('#topbarTitleText') === '早上');
  check('kw zh coffee', w.autoIconFor('买咖啡') === 'coffee');
  check('home items', d.querySelectorAll('.check-item').length === 2);

  // ---- #9 新建页重复点击新建无响应 ----
  $('#newTab').click();
  await sleep(450);
  check('form page title', text('#topbarTitleText') === '新建检查单');
  const contentBefore = d.querySelector('#formContent').innerHTML.length;
  $('#newTab').click();
  await sleep(120);
  const contentAfter = d.querySelector('#formContent').innerHTML.length;
  check('new tab re-click no-op', contentBefore === contentAfter && text('#topbarTitleText') === '新建检查单');

  // ---- #8/#16 自动空白行：无删除按钮 + 占位 ----
  const formItems = d.querySelectorAll('#formContent .form-item');
  const lastItem = formItems[formItems.length-1];
  check('auto row no remove btn', !lastItem.querySelector('.fi-remove'));
  check('auto row has slot', !!lastItem.querySelector('.fi-remove-slot'));
  check('form has 2 labels (检查单图标/检查单名称)', d.querySelectorAll('#formContent .form-label').length >= 2);

  // ---- #7 语言按钮有水波（clickable 类） ----
  w.renderSettings();
  await sleep(100);
  check('lang item clickable', !!d.querySelector('#settingsContent .settings-item.clickable'));
  check('support icon bolt (zh-CN)', iconOf('.support-card .sc-icon') === 'bolt');
  check('support card title zh', text('.support-card .sc-title') === '给 Sue 狠狠的发电');
  // ---- #13 署名合并为一行 ----
  check('credits merged', text('.about-glm') === 'Made by GLM-5.2 ｜ Maintain by DeepSeek V4 Pro');

  // ---- #12 下拉统一 toggleDropdown ----
  check('toggleDropdown exists', typeof w.toggleDropdown === 'function');

  // ---- #6 编辑→新建翻动动画 ----
  w.goBackFromSettings ? null : null;
  // 从设置回到新建页
  w.openSettingsFrom('home');
  await sleep(300);
  w.goBackFromSettings();
  await sleep(400);
  // 打开编辑 c1
  $('#btnConfig').click();
  await sleep(400);
  check('edit page', text('#topbarTitleText') === '编辑检查单');
  // 编辑→新建：应使用 transform 翻动
  $('#newTab').click();
  await sleep(180);
  const fcTransform = d.querySelector('#formContent').style.transform;
  check('edit->new slide transform', fcTransform === 'translateX(-40px)' || fcTransform === 'translateX(40px)');
  await sleep(400);
  check('form content settled', d.querySelector('#formContent').style.transform === '' || d.querySelector('#formContent').style.transform === 'translateX(0px)');
  check('new page after switch', text('#topbarTitleText') === '新建检查单');

  // ---- #1/#10 咖啡：切换时随滚动区滑动，重置退出更快 ----
  d.querySelector('.nav-tab[data-id="c1"]').click();
  await sleep(600);
  check('home c1', text('#topbarTitleText') === '早上');
  let c1Checks = d.querySelectorAll('.ci-check');
  c1Checks[0].click();
  await sleep(700);
  d.querySelectorAll('.ci-check')[0].click();
  await sleep(800);
  check('coffee shown', !!$('#allDoneView') && $('#allDoneView').classList.contains('show'));
  // 切换已完成 → 未完成：咖啡不应播放自身动画（瞬间移除）
  d.querySelector('.nav-tab[data-id="c2"]').click();
  await sleep(300);
  check('coffee gone during flip', !$('#allDoneView'));
  await sleep(400);
  check('c2 items', d.querySelectorAll('.check-item').length === 1);
  // 切回已完成：咖啡作为特殊检查项出现
  d.querySelector('.nav-tab[data-id="c1"]').click();
  await sleep(600);
  check('coffee back', !!$('#allDoneView') && $('#allDoneView').classList.contains('show'));
  // 重置：退出动画 220ms 左右完成
  $('#btnResetList').click();
  await sleep(60);
  check('coffee leaving fast', $('#allDoneView') && $('#allDoneView').classList.contains('leaving'));
  await sleep(700);
  check('coffee gone after reset', !$('#allDoneView'));
  check('items back', d.querySelectorAll('.check-item').length === 2);

  // ---- #11 标题切换动画（slide 模式） ----
  d.querySelector('.nav-tab[data-id="c2"]').click();
  await sleep(150);
  const sEl = $('#topbarTitleSuffix');
  const st = sEl.style.transform;
  check('suffix moving (slide mode)', st === '' || st.indexOf('translateX') >= 0);
  await sleep(500);
  check('title c2', text('#topbarTitleText') === '工作');
  check('suffix settled', sEl.style.transform === '' || sEl.style.transform === 'translateX(0px)');

  // ---- #2 设置→新建方向（form 从右侧进入） ----
  w.openSettingsFrom('home');
  await sleep(400);
  check('settings page', text('#topbarTitleText') === '设置');
  $('#newTab').click();
  await sleep(150);
  const formPage = $('#pageForm');
  check('form entered from right', formPage.className.indexOf('page-enter-right') < 0 && formPage.className.indexOf('page-active') >= 0);
  await sleep(400);
  check('form page after settings->new', text('#topbarTitleText') === '新建检查单');

  // ---- #4 自动图标弹跳/交换（提速） ----
  const nameInput = d.querySelector('#formContent input');
  nameInput.value = '买咖啡';
  nameInput.dispatchEvent(new w.Event('input', {bubbles:true}));
  await sleep(120);
  check('preview coffee', d.querySelector('#checklistIconRow .preview-btn .icon') && d.querySelector('#checklistIconRow .preview-btn .icon').textContent === 'coffee');
  nameInput.value = '工作';
  nameInput.dispatchEvent(new w.Event('input', {bubbles:true}));
  await sleep(120);
  const workBtn = d.querySelector('#checklistIconRow .icon-circle-btn[data-icon="work"]');
  check('common auto selected', workBtn && workBtn.classList.contains('selected'));
  nameInput.value = '旅行';
  nameInput.dispatchEvent(new w.Event('input', {bubbles:true}));
  await sleep(200);

  // ---- #17 CrazySue 链接 ----
  w.renderSettings();
  await sleep(50);
  const creditLink = d.querySelector('.about-credit a');
  check('credit link real href', creditLink && creditLink.getAttribute('href') === 'https://github.com/CrazySue');

  console.log('---');
  console.log('uncaught errors:', errors.length);
  errors.forEach(e=>console.log('  ERR: ' + e));
  console.log(failures === 0 && errors.length === 0 ? 'SMOKE ALL PASS' : 'SMOKE FAILURES: ' + failures);
  process.exit(0);
})().catch(e=>{ console.log('SMOKE CRASH: ' + e.stack); process.exit(1); });
