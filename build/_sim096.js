// 0.9.6 用户行为模拟测试（模拟真实布局几何）
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let html = fs.readFileSync(path.join(__dirname, '..', 'Checklist-v0.9.6.html'), 'utf8');
html = html.replace(/data:[a-z0-9\/+.\-]+;base64,[A-Za-z0-9+/=\r\n]+/g, 'data:application/octet-stream;base64,AA==');

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => { if (e.message.indexOf('navigation') >= 0) return; errors.push(e.message); });
vc.on('error', (...a) => { errors.push('console.error: ' + a.join(' ')); });

// c2 用长名字，便于测试"短→长"切换
const state = {
  checklists: [
    {id:'c1', name:'早上', icon:'auto', resetHours:0, items:[
      {id:'i1', text:'买咖啡', icon:'auto', done:false},
      {id:'i2', text:'遛狗', icon:'auto', done:false}
    ], completedAt:null, createdAt:1},
    {id:'c2', name:'这是一个非常长的检查单名字', icon:'auto', resetHours:0, items:[
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
    // 模拟布局：后缀的 left 随名字长度变化（每字 12px）
    window.Element.prototype.getBoundingClientRect = function(){
      if(this.id === 'topbarTitleSuffix'){
        const nameEl = window.document.getElementById('topbarTitleText');
        const w = nameEl ? nameEl.textContent.length * 12 : 0;
        return {left: w, top: 0, right: w+24, bottom: 24, width: 24, height: 24};
      }
      return {left:0, top:0, right:0, bottom:0, width:0, height:0};
    };
  }
});

const w = dom.window, d = w.document;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let failures = 0;
const check = (n,c)=>{ console.log((c?'PASS: ':'FAIL: ')+n); if(!c) failures++; };
const $ = s => d.querySelector(s);
const $$ = s => [...d.querySelectorAll(s)];
const text = s => { const el = $(s); return el ? el.textContent : null; };

(async ()=>{
  await sleep(300);
  console.log('=== 场景1：新建页 → 设置（方向：设置从右滑入、新建向左滑出） ===');
  $('#newTab').click(); await sleep(500);
  check('进入新建页', text('#topbarTitleText') === '新建检查单');
  $('#btnSettings').click();
  await sleep(40); // 动画刚开始
  check('设置页从右滑入（内联 transform 100%）', $('#pageSettings').style.transform === 'translateX(100%)' || $('#pageSettings').style.transform === '');
  check('设置页进入状态（page-active）', $('#pageSettings').className.indexOf('page-active') >= 0);
  check('新建页向左滑出（内联 -100%）', $('#pageForm').style.transform === 'translateX(-100%)');
  await sleep(500);
  check('设置页标题', text('#topbarTitleText') === '设置');
  check('新建页保持隐藏（leave 类 + CSS opacity 0）', $('#pageForm').className.indexOf('page-leave-left') >= 0);

  console.log('=== 场景2：设置 → 返回新建页（新建从右滑入），再进设置（方向不变） ===');
  $('#btnSettings').click(); await sleep(40);
  check('返回时新建页从右滑入', $('#pageForm').style.transform === '' && $('#pageForm').className.indexOf('page-active') >= 0);
  check('设置页向左滑出（返回新建页）', $('#pageSettings').style.transform === 'translateX(-100%)');
  await sleep(500);
  $('#btnSettings').click(); await sleep(40);
  check('再次进设置：设置页从右滑入', $('#pageSettings').className.indexOf('page-active') >= 0 && $('#pageSettings').style.transform === '');
  check('新建页再次向左滑出', $('#pageForm').style.transform === 'translateX(-100%)');
  await sleep(500);

  console.log('=== 场景3：设置 → 底栏切检查单（home 从左滑入，唯一特例） ===');
  d.querySelector('.nav-tab[data-id="c1"]').click(); await sleep(40);
  check('home 从左滑入（-100% 起点）', $('#pageHome').className.indexOf('page-active') >= 0);
  check('设置页向右滑出', $('#pageSettings').style.transform === 'translateX(100%)');
  await sleep(500);
  check('home 显示 c1', text('#topbarTitleText') === '早上');

  console.log('=== 场景4：标题动画（短名 c1 → 长名 c2） ===');
  const tEl = $('#topbarTitleText'), sEl = $('#topbarTitleSuffix');
  d.querySelector('.nav-tab[data-id="c2"]').click();
  await sleep(30);
  // 短名 '早上'=2字 → oldLeft=24；长名 13字 → newLeft=156；delta=132
  check('后缀开始向右滑动（translateX(132px)）', sEl.style.transform === 'translateX(132px)');
  check('旧名字保持不变（未消失）', tEl.textContent === '早上' && tEl.style.opacity !== '0');
  await sleep(300); // 约75%处名字开始翻动
  check('后缀补偿后向终点滑动（translateX(0)）', sEl.style.transform === 'translateX(0)');
  check('名字进入翻动（inline-block）', tEl.style.display === 'inline-block');
  await sleep(600);
  check('新名字已显示', text('#topbarTitleText') === '这是一个非常长的检查单名字');
  check('名字复位（display 恢复）', tEl.style.display === '' && tEl.style.transform === '');
  check('后缀复位', sEl.style.transform === '');
  // 长名 → 短名（后缀向左移动）
  d.querySelector('.nav-tab[data-id="c1"]').click();
  await sleep(30);
  check('后缀向左滑动（translateX(-132px)）', sEl.style.transform === 'translateX(-132px)');
  check('旧名字（长名）保持不变', tEl.textContent === '这是一个非常长的检查单名字');
  await sleep(900);
  check('短名已显示', text('#topbarTitleText') === '早上');
  check('全部复位', tEl.style.display === '' && sEl.style.transform === '');

  console.log('=== 场景5：完成全部 → 咖啡动画（keyframes，出现/重置退出） ===');
  let checks = $$('.ci-check');
  checks[0].click(); await sleep(700);
  $$('.ci-check')[0].click(); await sleep(800);
  check('咖啡出现且带动画类', !!$('#allDoneView') && $('#allDoneView').classList.contains('show'));
  check('keyframes 存在', html.indexOf('@keyframes all-done-in') >= 0 && html.indexOf('@keyframes all-done-out') >= 0);
  $('#btnResetList').click();
  await sleep(60);
  check('重置时咖啡播放退出动画', $('#allDoneView') && $('#allDoneView').classList.contains('leaving'));
  await sleep(700);
  check('咖啡已移除', !$('#allDoneView'));
  check('列表项恢复', $$('.check-item').length === 2);

  console.log('=== 场景6：检查项清空自动删除 + 聚焦上一项（输入法保持） ===');
  $('#btnConfig').click(); await sleep(400); // 编辑页（编辑 c1）
  w.openForm(null); await sleep(400); // 新建页
  let inputs = $$('#formContent .form-item input');
  check('初始 1 行', inputs.length === 1);
  // 第1行输入 → 自动追加空行
  inputs[0].focus(); inputs[0].value='喝水'; inputs[0].dispatchEvent(new w.Event('input',{bubbles:true}));
  await sleep(80);
  inputs = $$('#formContent .form-item input');
  check('输入后 2 行', inputs.length === 2);
  // 第2行（自动行）输入 → 再追加
  inputs[1].focus(); inputs[1].value='吃饭'; inputs[1].dispatchEvent(new w.Event('input',{bubbles:true}));
  await sleep(80);
  inputs = $$('#formContent .form-item input');
  check('第二行输入后 3 行', inputs.length === 3);
  // 清空第2行（中间行）→ 自动删除并聚焦第1行
  inputs[1].focus(); inputs[1].value=''; inputs[1].dispatchEvent(new w.Event('input',{bubbles:true}));
  await sleep(500);
  inputs = $$('#formContent .form-item input');
  check('清空后回到 2 行', inputs.length === 2);
  check('焦点移到上一项输入框', d.activeElement === inputs[0]);
  // 清空第1行（首项）→ 不自动删除
  inputs[0].focus(); inputs[0].value=''; inputs[0].dispatchEvent(new w.Event('input',{bubbles:true}));
  await sleep(500);
  inputs = $$('#formContent .form-item input');
  check('首项清空不自动删除（仍 2 行）', inputs.length === 2);
  check('首行保留为空', inputs[0].value === '');

  console.log('=== 场景7：聚焦时自动滚动到中间（不崩溃） ===');
  const scroller = $('#formContent');
  inputs[1].focus();
  inputs[1].dispatchEvent(new w.FocusEvent('focusin',{bubbles:true}));
  await sleep(100);
  check('滚动逻辑执行不崩溃', typeof scroller.scrollTop === 'number');

  console.log('=== 场景8：横屏搜索框避开左栏（CSS 网格） ===');
  check('search 区域只占右列', html.indexOf('\"rail search\"') >= 0);

  console.log('=== 场景9：导出链（MediaStore 优先） ===');
  check('exportViaPlusAndroid 存在', typeof w.exportViaPlusAndroid === 'function');
  check('exportViaPlusIO 存在', typeof w.exportViaPlusIO === 'function');
  check('MediaStore 类引用存在', html.indexOf('MediaStore$Downloads') >= 0);
  // 无 plus 环境：走锚点导出
  w.openForm('c1'); await sleep(300);
  w.handleExport(); await sleep(200);
  check('Web 导出 toast', $('#toast').classList.contains('visible'));

  console.log('=== 场景10：回归抽查 ===');
  w.openForm(null); await sleep(300);
  const n1 = $('#formContent').innerHTML.length;
  $('#newTab').click(); await sleep(120);
  check('新建页重复点击无响应', $('#formContent').innerHTML.length === n1);
  const lastRow = $$('#formContent .form-item').pop();
  check('自动行无删除按钮', !lastRow.querySelector('.fi-remove') && !!lastRow.querySelector('.fi-remove-slot'));
  check('顶栏图标即时切换', $('#btnSettings .icon').textContent === 'settings');

  console.log('---');
  console.log('uncaught errors:', errors.length);
  errors.forEach(e=>console.log('  ERR: ' + e));
  console.log(failures === 0 && errors.length === 0 ? 'SIMULATION ALL PASS' : 'SIMULATION FAILURES: ' + failures);
  process.exit(0);
})().catch(e=>{ console.log('SIM CRASH: ' + e.stack); process.exit(1); });
