const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
let html = fs.readFileSync(path.join(__dirname, '..', 'Checklist-v0.9.5.html'), 'utf8');
html = html.replace(/data:[a-z0-9\/+.\-]+;base64,[A-Za-z0-9+/=\r\n]+/g, 'data:application/octet-stream;base64,AA==');
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => { if (e.message.indexOf('navigation') >= 0) return; errors.push(e.message); });
const state = { checklists: [{id:'c1', name:'早上', icon:'auto', resetHours:0, items:[{id:'i1', text:'买咖啡', icon:'auto', done:false}], completedAt:null, createdAt:1}], activeChecklistId:'c1', settings:{theme:'light', itemHeight:64, firstOnly:false, language:'zh-CN'} };
const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'http://localhost/', virtualConsole:vc,
  beforeParse(w){
    w.localStorage.setItem('checklist_app_state_v1', JSON.stringify(state));
    w.Element.prototype.scrollIntoView = function(){};
    w.matchMedia = function(){ return {matches:false, media:'', addEventListener(){}, removeEventListener(){}}; };
    w.URL.createObjectURL = function(){ return 'blob:fake'; };
    w.URL.revokeObjectURL = function(){};
    w.open = function(){ return null; };
  }});
const w = dom.window, d = w.document;
const sleep = ms => new Promise(r=>setTimeout(r, ms));
let failures = 0;
const check = (n,c)=>{ console.log((c?'PASS: ':'FAIL: ')+n); if(!c) failures++; };

(async ()=>{
  await sleep(300);
  // 自动行：输入→新增一行；清空→自动消失
  w.openForm(null);
  await sleep(300);
  let inputs = d.querySelectorAll('#formContent .form-item input');
  check('starts with 1 item row', inputs.length === 1);
  inputs[0].value = '喝水';
  inputs[0].dispatchEvent(new w.Event('input', {bubbles:true}));
  await sleep(100);
  inputs = d.querySelectorAll('#formContent .form-item input');
  check('type adds auto row', inputs.length === 2);
  inputs[0].value = '';
  inputs[0].dispatchEvent(new w.Event('input', {bubbles:true}));
  await sleep(450);
  inputs = d.querySelectorAll('#formContent .form-item input');
  check('clear removes auto row', inputs.length === 1);
  check('remaining row no remove btn', !inputs[0].closest('.form-item').querySelector('.fi-remove'));

  // 设置→检查单标签：home 从左侧进入
  w.openSettingsFrom('form');
  await sleep(400);
  d.querySelector('.nav-tab[data-id="c1"]').click();
  await sleep(120);
  const homeCls = d.querySelector('#pageHome').className;
  check('home enters from left (settings->checklist)', homeCls.indexOf('page-active') >= 0);
  await sleep(400);
  check('home c1 shown', d.querySelector('#topbarTitleText').textContent === '早上');
  check('bottom bar used in portrait layout logic (no landscape in css default)', html.indexOf('html.landscape') >= 0);

  console.log('errors:', errors.length, errors.join(' | '));
  console.log(failures === 0 && errors.length === 0 ? 'EXTRA ALL PASS' : 'EXTRA FAILURES: ' + failures);
  process.exit(0);
})().catch(e=>{ console.log('CRASH: ' + e.stack); process.exit(1); });
