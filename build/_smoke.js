const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('E:\\WorkSpace\\Checklist\\Checklist-v0.9.0.html', 'utf8');
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push('jsdomError: ' + (e.detail && e.detail.message || e.message)));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc,
  url: 'http://localhost/',
});

const { window } = dom;
window.matchMedia = window.matchMedia || (q => ({ matches: false, addListener(){}, removeListener(){} , addEventListener(){}, removeEventListener(){} }));

function wait(ms){ return new Promise(r => setTimeout(r, ms)); }

(async () => {
  await wait(2500); // allow DOMContentLoaded + init + fonts decode attempt
  const w = window;
  const doc = w.document;
  const out = [];
  const check = (name, cond) => out.push((cond ? 'PASS ' : 'FAIL ') + name);

  check('no errors during init', errors.length === 0);
  check('bottombar has new tab', doc.querySelectorAll('#newTab').length === 1);
  check('topbar title set', (doc.querySelector('#topbarTitleText').textContent || '').length > 0);

  // 创建两个检查单：一个未完成、一个全部完成
  w.eval(`
    Store.state.checklists.push({
      id:'c1', name:'买菜', icon:'auto', resetHours:0,
      items:[{id:'i1', text:'买苹果', icon:'auto', done:false},{id:'i2', text:'买牛奶', icon:'auto', done:false}],
      completedAt:null, createdAt:Date.now()
    });
    Store.state.checklists.push({
      id:'c2', name:'晨练', icon:'auto', resetHours:0,
      items:[{id:'i3', text:'跑步', icon:'auto', done:true}],
      completedAt:Date.now(), createdAt:Date.now()
    });
    Store.state.activeChecklistId='c1';
    Store.state._editing=null;
    Store.save();
  `);
  await wait(100);

  // 主页渲染
  w.eval(`renderHome(); renderBottombar(); renderTopbar('home');`);
  await wait(50);
  check('home renders 2 check items', doc.querySelectorAll('#listContainer .check-item').length === 2);
  check('bottom bar renders 2 checklist tabs + new', doc.querySelectorAll('.nav-tab').length === 3);

  // 完成一个检查项 → 还剩1个
  w.eval(`completeItem('c1','i1');`);
  await wait(700);
  check('after completing one item, 1 item remains', doc.querySelectorAll('#listContainer .check-item').length === 1);

  // 完成最后一个 → 咖啡页出现（且在 listContainer 内）
  w.eval(`completeItem('c1','i2');`);
  await wait(700);
  check('coffee view shown inside listContainer', !!doc.querySelector('#listContainer #allDoneView'));
  check('coffee view has .show', doc.querySelector('#listContainer #allDoneView')?.classList.contains('show') === true);
  check('reset FAB visible', doc.querySelector('#btnResetList').classList.contains('visible'));

  // 切换到已完成的 c2 → 咖啡页仍应在容器内
  w.eval(`switchChecklist('c2');`);
  await wait(600);
  check('switch to completed checklist shows coffee', !!doc.querySelector('#listContainer #allDoneView'));

  // 重置动画路径
  w.eval(`resetChecklist('c2');`);
  await wait(100);
  check('coffee gets leaving class on reset', doc.querySelector('#allDoneView')?.classList.contains('leaving') === true);
  await wait(500);
  check('after reset, coffee gone and list shown', doc.querySelectorAll('#listContainer .check-item').length >= 1);

  // 编辑页：顶栏应为返回按钮
  w.eval(`openForm('c1');`);
  await wait(300);
  const btnIcon = doc.querySelector('#btnSettings .icon').textContent;
  check('edit page top bar shows back arrow', btnIcon === 'arrow_back');

  // 从编辑页通过底栏切到 c2（_editing 保留）
  w.eval(`switchChecklist('c2');`);
  await wait(300);
  check('switch from edit to other checklist lands on home', w.eval('currentPage') === 'home');
  check('_editing preserved', w.eval('Store.state._editing') === 'c1');

  // 再点正在编辑的 c1 标签 → 回到编辑页（不重新加载）
  w.eval(`document.querySelector('.nav-tab[data-id="c1"]').click();`);
  await wait(300);
  check('clicking edited checklist tab reopens edit page', w.eval('currentPage') === 'form');

  // 设置页返回
  w.eval(`settingsFromPage='home'; renderSettings(); switchPage('settings'); renderTopbar('settings');`);
  await wait(100);
  check('settings top bar shows back arrow', doc.querySelector('#btnSettings .icon').textContent === 'arrow_back');
  check('settings has support button', !!doc.querySelector('.support-btn'));
  const supportTitle = doc.querySelector('.support-title')?.textContent || '';
  check('support button title non-empty', supportTitle.length > 0);
  w.eval(`goBackFromSettings();`);
  await wait(200);
  check('back from settings returns home', w.eval('currentPage') === 'home');

  // 图标选择弹窗分类本地化（zh-CN 默认）
  w.eval(`openIconPicker('item','i1');`);
  await wait(50);
  const catTitles = [...doc.querySelectorAll('.icon-category-title')].map(n => n.textContent);
  check('icon picker categories localized (zh-CN)', catTitles.length >= 5 && catTitles[0] === '日常');
  w.eval(`closeIconPicker();`);

  // 导出文件名逻辑
  const fn = w.eval(`sanitizeFileName('我的 检查单/ABC') + '.checklist'`);
  check('export filename sanitized .checklist', fn === '我的 检查单_ABC.checklist');

  // 横屏 CSS 存在
  const css = doc.querySelector('style').textContent;
  check('landscape grid layout present', css.includes('grid-template-areas:"topbar topbar" "rail main"'));

  // 自动图标关键词数量
  const kwCount = w.eval(`AUTO_ICON_KEYWORDS.length`);
  check('keyword rows >= 200 (' + kwCount + ')', kwCount >= 200);
  const zhKw = w.eval(`AUTO_ICON_KEYWORDS.reduce((n,r)=>n+r[0].split('|').length,0)`);
  check('zh keywords >= 200 (' + zhKw + ')', zhKw >= 200);

  console.log(out.join('\n'));
  console.log('--- errors ---');
  console.log(errors.length ? errors.slice(0, 20).join('\n') : '(none)');
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error('TEST CRASH:', e); process.exit(2); });
