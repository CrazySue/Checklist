// Smoke test for Checklist v0.9.0 using jsdom (fonts stripped for speed)
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let html = fs.readFileSync(path.join(__dirname, '..', 'Checklist-v0.9.0.html'), 'utf8');
// 去掉巨型 base64 资源，加快 jsdom 解析（逻辑不受影响）
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
  await sleep(300); // wait init

  // ---- i18n & 关键词 ----
  check('title zh', text('#topbarTitleText') === '早上');
  check('suffix', text('#topbarTitleSuffix') === '检查单');
  check('kw zh coffee', w.autoIconFor('买咖啡') === 'coffee');
  check('kw zh water', w.autoIconFor('喝水') === 'water_full');
  check('kw zh pet', w.autoIconFor('遛狗') === 'pets');
  check('kw en fallback', w.autoIconFor('buy milk') === 'shopping_bag');
  check('kw boundary car', w.autoIconFor('car') === 'directions_car');
  check('kw boundary cart', w.autoIconFor('cart') === 'shopping_cart');
  check('kw boundary cardboard-no-match', w.autoIconFor('cardboard') === 'checklist');
  check('kw en direct', w.autoIconFor('coffee time') === 'coffee');

  check('home items', d.querySelectorAll('.check-item').length === 2);
  check('active tab c1', d.querySelector('.nav-tab.is-active') && d.querySelector('.nav-tab.is-active').dataset.id === 'c1');

  // ---- issue 1/8: new form -> settings -> back -> form (focus on New) ----
  $('#newTab').click();
  await sleep(500);
  check('form page title', text('#topbarTitleText') === '新建检查单');
  check('form icon settings', iconOf('#btnSettings .icon') === 'settings');
  $('#btnSettings').click();
  await sleep(500);
  check('settings page', text('#topbarTitleText') === '设置');
  check('settings icon back', iconOf('#btnSettings .icon') === 'arrow_back');
  $('#btnSettings').click();
  await sleep(500);
  check('back to form', text('#topbarTitleText') === '新建检查单');
  check('focus on New', d.querySelector('.nav-tab.is-active') && d.querySelector('.nav-tab.is-active').id === 'newTab');

  // home -> settings -> back -> home (focus c1)
  d.querySelector('.nav-tab[data-id="c1"]').click();
  await sleep(600);
  check('home again', text('#topbarTitleText') === '早上');
  $('#btnSettings').click();
  await sleep(400);
  check('settings from home', text('#topbarTitleText') === '设置');
  $('#btnSettings').click();
  await sleep(600);
  check('back to home', text('#topbarTitleText') === '早上');
  check('focus c1', d.querySelector('.nav-tab.is-active') && d.querySelector('.nav-tab.is-active').dataset.id === 'c1');

  // ---- issue 3: edit page back arrow & editing persistence ----
  $('#btnConfig').click();
  await sleep(500);
  check('edit page', text('#topbarTitleText') === '编辑检查单');
  check('edit icon back', iconOf('#btnSettings .icon') === 'arrow_back');
  // switch to c2 via bottombar while editing c1
  d.querySelector('.nav-tab[data-id="c2"]').click();
  await sleep(600);
  check('home shows c2', text('#topbarTitleText') === '工作');
  // click c1 tab -> edit page again
  d.querySelector('.nav-tab[data-id="c1"]').click();
  await sleep(500);
  check('c1 tab reopens edit', text('#topbarTitleText') === '编辑检查单');
  // back arrow -> home c1
  $('#btnSettings').click();
  await sleep(500);
  check('edit back to home', text('#topbarTitleText') === '早上');
  check('home icon settings again', iconOf('#btnSettings .icon') === 'settings');

  // ---- issue 2: complete all -> coffee; switch animations; reset ----
  let c1Checks = d.querySelectorAll('.ci-check');
  c1Checks[0].click();
  await sleep(700);
  d.querySelectorAll('.ci-check')[0].click();
  await sleep(800);
  check('coffee shown', !!$('#allDoneView') && $('#allDoneView').classList.contains('show'));
  check('reset fab visible', $('#btnResetList').classList.contains('visible'));
  // switch to c2 (incomplete) -> scroller flip applies & coffee removed
  d.querySelector('.nav-tab[data-id="c2"]').click();
  await sleep(250);
  const midTransform = $('#listScroll').style.transform;
  check('scroller animating', midTransform !== '' && midTransform !== 'translateX(0px)');
  await sleep(500);
  check('scroller cleared', $('#listScroll').style.transform === '' || $('#listScroll').style.transform === 'translateX(0px)');
  check('coffee removed', !$('#allDoneView'));
  check('c2 items', d.querySelectorAll('.check-item').length === 1);
  // switch back to done c1 -> coffee participates in flip
  d.querySelector('.nav-tab[data-id="c1"]').click();
  await sleep(600);
  check('coffee back', !!$('#allDoneView') && $('#allDoneView').classList.contains('show'));
  // reset: coffee moves down & fades (leaving), items enter with animation
  $('#btnResetList').click();
  await sleep(120);
  check('coffee leaving', $('#allDoneView') && $('#allDoneView').classList.contains('leaving'));
  await sleep(1000);
  check('coffee gone after reset', !$('#allDoneView'));
  check('items back', d.querySelectorAll('.check-item').length === 2);

  // ---- issue 4/6: icon picker categories localized + swap ----
  $('#btnConfig').click();
  await sleep(400);
  const moreBtn = d.querySelector('#checklistIconRow [data-more]');
  moreBtn.click();
  await sleep(300);
  check('picker open', $('#iconPickerModal').classList.contains('visible'));
  check('cat zh', text('.icon-category-title') === '日常');
  $('#iconPickerCancel').click();
  await sleep(200);
  // auto icon swap: type name that changes icon
  const nameInput = d.querySelector('#formContent input');
  nameInput.value = '买咖啡';
  nameInput.dispatchEvent(new w.Event('input', {bubbles:true}));
  await sleep(100);
  check('preview coffee', d.querySelector('#checklistIconRow .preview-btn .icon') && d.querySelector('#checklistIconRow .preview-btn .icon').textContent === 'coffee');
  nameInput.value = '遛狗';
  nameInput.dispatchEvent(new w.Event('input', {bubbles:true}));
  await sleep(150);
  const prevIcon = d.querySelector('#checklistIconRow .preview-btn .icon');
  check('preview swapped to pets', prevIcon && prevIcon.textContent === 'pets');

  // ---- issue 9: support card + maintain line ----
  w.renderSettings();
  await sleep(100);
  check('support card exists', !!$('.support-card'));
  check('support card title', text('.support-card .sc-title') === '给 Sue 狠狠的发电');
  check('maintain line', d.body.textContent.indexOf('Maintain by DeepSeek V4 Pro') >= 0);
  $('.support-card').click();
  await sleep(100);

  // ---- issue 7: export .checklist ----
  w.openForm('c1');
  await sleep(400);
  check('edit again for export', text('#topbarTitleText') === '编辑检查单');
  w.handleExport();
  await sleep(200);
  check('export toast', $('#toast').classList.contains('visible'));

  // ---- language switch to en ----
  w.openSettingsFrom('home');
  await sleep(300);
  d.querySelector('#settingsContent .settings-item[style*="cursor"]').click();
  await sleep(300);
  const enItem = [...d.querySelectorAll('#langModalBody .lang-item')].find(i=>i.textContent.includes('English'));
  enItem.click();
  await sleep(500);
  check('english UI title', text('#topbarTitleText') === 'Settings');
  w.renderSettings();
  await sleep(100);
  check('en coffee title', text('.support-card .sc-title') === 'Buy Sue a Coffee');
  w.openForm(null);
  await sleep(300);
  d.querySelector('#checklistIconRow [data-more]').click();
  await sleep(200);
  check('cat en', text('.icon-category-title') === 'Daily');
  // 切到法语验证法语关键词
  w.closeIconPicker();
  await sleep(200);
  w.openSettingsFrom('form');
  await sleep(300);
  d.querySelector('#settingsContent .settings-item[style*="cursor"]').click();
  await sleep(300);
  const frItem = [...d.querySelectorAll('#langModalBody .lang-item')].find(i=>i.textContent.includes('Français'));
  frItem.click();
  await sleep(500);
  check('french UI', text('#topbarTitleText') === 'Paramètres');
  check('kw fr acheter', w.autoIconFor('acheter') === 'shopping_bag');
  check('kw fr pain', w.autoIconFor('du pain') === 'bakery_dining');

  console.log('---');
  console.log('uncaught errors:', errors.length);
  errors.forEach(e=>console.log('  ERR: ' + e));
  console.log(failures === 0 && errors.length === 0 ? 'SMOKE ALL PASS' : 'SMOKE FAILURES: ' + failures);
  process.exit(0);
})().catch(e=>{ console.log('SMOKE CRASH: ' + e.stack); process.exit(1); });
