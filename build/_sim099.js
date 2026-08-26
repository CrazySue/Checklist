// 0.9.9 用户行为模拟测试（模拟真实布局几何）
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let html = fs.readFileSync(path.join(__dirname, '..', 'Checklist-v0.9.9.html'), 'utf8');
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
    ], completedAt:null, createdAt:2},
    {id:'c3', name:'早上', icon:'auto', resetHours:0, items:[
      {id:'i4', text:'喝水', icon:'auto', done:false}
    ], completedAt:null, createdAt:3}
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
  check('设置页从右滑入（40px 起滑）', $('#pageSettings').style.transform === 'translateX(40px)');
  check('新建页向左滑出（-40px）', $('#pageForm').style.transform === 'translateX(-40px)');
  await sleep(500);
  check('设置页标题', text('#topbarTitleText') === '设置');
  await sleep(500);
  check('翻页完成：设置页进入状态', $('#pageSettings').className.indexOf('page-active') >= 0 && $('#pageSettings').style.transform === '');
  check('新建页保持隐藏（leave 类）', $('#pageForm').className.indexOf('page-leave-left') >= 0);

  console.log('=== 场景2：设置 → 返回新建页（新建从右滑入），再进设置（方向不变） ===');
  $('#btnSettings').click(); await sleep(40);
  check('返回时新建页从左滑入（-40px 起滑）', $('#pageForm').style.transform === 'translateX(-40px)');
  check('设置页向右滑出（返回新建页，40px）', $('#pageSettings').style.transform === 'translateX(40px)');
  await sleep(500);
  $('#btnSettings').click(); await sleep(40);
  check('再次进设置：设置页从右滑入（40px 起滑）', $('#pageSettings').style.transform === 'translateX(40px)');
  check('新建页再次向左滑出', $('#pageForm').style.transform === 'translateX(-40px)');
  await sleep(500);

  console.log('=== 场景3：设置 → 底栏切检查单（home 从左滑入，唯一特例） ===');
  d.querySelector('.nav-tab[data-id="c1"]').click(); await sleep(40);
  check('home 从左滑入（-40px 起点）', $('#pageHome').style.transform === 'translateX(-40px)');
  check('设置页向右滑出（40px）', $('#pageSettings').style.transform === 'translateX(40px)');
  await sleep(500);
  check('home 显示 c1', text('#topbarTitleText') === '早上');

  console.log('=== 场景4：标题动画（短名 c1 → 长名 c2） ===');
  const tEl = $('#topbarTitleText'), sEl = $('#topbarTitleSuffix');
  // 埋点：追踪 setTopbarTitle 调用
  const origTitle = w.setTopbarTitle;
  w.setTopbarTitle = function(a, b, c){ console.log('CALL setTopbarTitle:', JSON.stringify(a), JSON.stringify(b), JSON.stringify(c)); return origTitle.apply(this, arguments); };
  d.querySelector('.nav-tab[data-id="c2"]').click();
  await sleep(30);
  // 短名 '早上'=2字 → oldLeft=24；长名 13字 → newLeft=156；delta=132
  // 整个标题（名字+「检查单」）一起向上翻（下一个检查单 = 从右往左翻）
  const wrap = $('#topbarTitle');
  check('整个标题向上翻出（translateY(-100%)）', wrap.style.transform === 'translateY(-100%)');
  await sleep(200);
  check('新标题已换入', text('#topbarTitleText') === '这是一个非常长的检查单名字');
  await sleep(400);
  check('标题复位', wrap.style.transform === '');
  // 长名 → 短名（从右往左翻 → 整个标题向下翻）
  d.querySelector('.nav-tab[data-id="c1"]').click();
  await sleep(30);
  check('整个标题向下翻出（translateY(100%)）', wrap.style.transform === 'translateY(100%)');
  await sleep(200);
  check('短名已显示', text('#topbarTitleText') === '早上');
  await sleep(400);
  check('标题复位', wrap.style.transform === '');
  // 同名检查单（c1 → c3，名字都是"早上"）切换时也播放翻动动画
  d.querySelector('.nav-tab[data-id="c3"]').click();
  await sleep(30);
  check('同名切换也播放翻动', wrap.style.transform === 'translateY(-100%)');
  await sleep(600);
  check('同名切换后复位', wrap.style.transform === '');
  // 快速连续切换：标题动画支持打断
  d.querySelector('.nav-tab[data-id="c2"]').click();
  await sleep(40);
  d.querySelector('.nav-tab[data-id="c1"]').click();
  await sleep(600);
  check('快速切换打断后标题正确', text('#topbarTitleText') === '早上');
  check('快速切换打断后复位', wrap.style.transform === '');

  console.log('=== 场景5：完成全部 → 咖啡动画（keyframes，出现/重置退出） ===');
  // 切回 c1（2 个检查项）再完成全部
  d.querySelector('.nav-tab[data-id="c1"]').click();
  await sleep(600);
  let checks = $$('.ci-check');
  checks[0].click(); await sleep(700);
  $$('.ci-check')[0].click(); await sleep(800);
  check('咖啡出现且带动画类', !!$('#allDoneView') && $('#allDoneView').classList.contains('show'));
  check('keyframes 存在', html.indexOf('@keyframes all-done-in') >= 0 && html.indexOf('@keyframes all-done-fade') >= 0 && html.indexOf('@keyframes all-done-move') >= 0);
  $('#btnResetList').click();
  await sleep(60);
  check('重置时咖啡播放退出动画', $('#allDoneView') && $('#allDoneView').classList.contains('leaving'));
  check('淡出动画与下移动画分开', html.indexOf('@keyframes all-done-fade') >= 0 && html.indexOf('@keyframes all-done-move') >= 0);
  check('下移动画 200ms（提速）', html.indexOf('all-done-move 200ms') >= 0);
  await sleep(900);
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
  // 新规则：清空最后一个有内容的检查项 → 移除下方自动空行，焦点保持在当前输入框
  check('焦点保持在当前输入框（新规则）', d.activeElement === inputs[1]);
  // 清空最后一个有内容的检查项 → 动画移除其下方的自动空行（聚焦不变）
  inputs[0].focus(); inputs[0].value=''; inputs[0].dispatchEvent(new w.Event('input',{bubbles:true}));
  await sleep(60);
  check('自动空行以动画移除（removing 类）', !!d.querySelector('#formContent .form-item.removing'));
  check('焦点保持在当前输入框', d.activeElement === inputs[0]);
  await sleep(500);
  inputs = $$('#formContent .form-item input');
  check('自动空行已移除（仅剩 1 行）', inputs.length === 1);
  check('首行保留为空', inputs[0].value === '');

  console.log('=== 场景7：聚焦时自动滚动到中间（不崩溃） ===');
  const scroller = $('#formContent');
  inputs[inputs.length-1].focus();
  inputs[inputs.length-1].dispatchEvent(new w.FocusEvent('focusin',{bubbles:true}));
  await sleep(100);
  check('滚动逻辑执行不崩溃', typeof scroller.scrollTop === 'number');

  console.log('=== 场景8：横屏搜索框避开左栏（CSS 网格） ===');
  check('search 区域只占右列', html.indexOf('\"rail search\"') >= 0);

  console.log('=== 场景9：导出链（MediaStore 优先） ===');
  check('导出保存到应用私有目录（PRIVATE_DOC）', html.indexOf('plus.io.PRIVATE_DOC') >= 0);
  check('死代码已清理（SAF/IS_PENDING/FileWriter 等）', html.indexOf('exportViaSAF') < 0 && html.indexOf('IS_PENDING') < 0 && html.indexOf('exportViaFileWriter') < 0);
  check('确认对话框已移除', html.indexOf('confirmDialog') < 0);
  check('未使用 i18n 键已移除', html.indexOf('back_home') < 0 && html.indexOf('pull_to_reset') < 0 && html.indexOf('empty_title') < 0);
  check('Store 订阅接口已移除', html.indexOf('Store.subscribe') < 0);
  check('版本 v1.0.0', html.indexOf('Release v1.0.0') >= 0);
  check('安卓导入不带 accept（isAndroidApp）', html.indexOf('isAndroidApp') >= 0);
  check('水波时长 750ms', html.indexOf('md-ripple-anim 750ms') >= 0);
  check('page 移除 will-change', html.indexOf('will-change:transform,opacity') < 0);
  check('主区域深色过渡', html.indexOf('.main-area') >= 0 && /main-area\{[\s\S]*?transition:background-color \.25s/.test(html));
  check('所有元素颜色统一过渡（* 规则）', html.indexOf('transition-property:background-color,color,border-color,background') >= 0);
  check('图标已删除：glasses/skiing/puzzle/spa/vaccumes/gardening/farming', ["'glasses'","'skiing'","'puzzle'","'spa'","'vaccumes'","'gardening'","'farming'"].every(n => html.indexOf(n) < 0));
  check('积木图标 blocks 已删除', html.indexOf("'blocks'") < 0 && html.indexOf('["blocks",') < 0);
  check('标题后缀不再 inline-block（空格正常渲染）', html.indexOf('title-suffix{opacity:.6;font-weight:400;display:inline-block}') < 0);
  check('标题动画打断 token 存在', html.indexOf('titleAnimToken') >= 0);
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
  check('sc-title 与 si-title 样式一致', html.indexOf('.support-card .sc-title{font-size:16px;color:var(--md-on-surface);}') >= 0);
  // 切到英文：名称与后缀之间有空格（如 早上 Checklist）
  w.openSettingsFrom('home');
  await sleep(300);
  d.querySelector('#settingsContent .settings-item.clickable').click();
  await sleep(300);
  const enItem = [...d.querySelectorAll('#langModalBody .lang-item')].find(i=>i.textContent.includes('English'));
  enItem.click();
  await sleep(500);
  w.goBackFromSettings();
  await sleep(500);
  check('英文标题名称与后缀间有空格', $('#topbarTitleText').textContent === '早上' && $('#topbarTitleSuffix').textContent === ' Checklist');
  // 下拉菜单快速打断：连点仍响应
  const mitHeader = d.querySelector('#mitDropdown .dropdown-header');
  mitHeader.click();
  await sleep(60);
  check('下拉打开', d.querySelector('#mitDropdown').classList.contains('open'));
  mitHeader.click();
  await sleep(60);
  check('下拉快速打断后闭合', !d.querySelector('#mitDropdown').classList.contains('open'));
  mitHeader.click();
  await sleep(500);
  check('下拉再次打开', d.querySelector('#mitDropdown').classList.contains('open'));

  console.log('---');
  console.log('uncaught errors:', errors.length);
  errors.forEach(e=>console.log('  ERR: ' + e));
  console.log(failures === 0 && errors.length === 0 ? 'SIMULATION ALL PASS' : 'SIMULATION FAILURES: ' + failures);
  process.exit(0);
})().catch(e=>{ console.log('SIM CRASH: ' + e.stack); process.exit(1); });