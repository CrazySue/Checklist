const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('E:\\WorkSpace\\Checklist\\Checklist-v0.9.3.html', 'utf8');
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push('jsdomError: ' + ((e.detail && e.detail.message) || e.message)));
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc, url: 'http://localhost/' });
const { window } = dom;
window.matchMedia = window.matchMedia || (q => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} }));
const wait = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const check = (name, cond) => results.push((cond ? 'PASS ' : 'FAIL ') + name);

(async () => {
  await wait(2500);
  const w = window, doc = w.document;
  const evalW = (code) => w.eval(code);

  check('init no errors', errors.length === 0);

  evalW(`
    Store.state.checklists = [{id:'c1', name:'晨练', icon:'auto', resetHours:0,
      items:[{id:'i1', text:'跑步', icon:'auto', done:true},{id:'i2', text:'跳绳', icon:'auto', done:true}],
      completedAt:Date.now(), createdAt:Date.now()}];
    Store.state.activeChecklistId='c1';
    Store.state._editing=null;
    Store.save();
  `);
  evalW(`renderHome(); renderBottombar(); renderTopbar('home');`);
  await wait(50);

  // ===== 问题3：宽屏/横屏 CSS =====
  const css = doc.querySelector('style').textContent;
  check('rail layout at min-width:600px', css.includes('@media(min-width:600px)') && css.includes('grid-template-areas:"topbar topbar" "rail main"'));
  check('orientation media still present for short landscape', css.includes('@media(orientation:landscape) and (max-height:560px)'));

  // ===== 问题4：图标切换动画 =====
  const swapOk = evalW(`
    (function(){
      const el0 = document.createElement('span');
      el0.textContent = 'home';
      animateIconSwap(el0, 'work');
      const hadAnim = !!el0._swapAnim;
      return hadAnim && el0.textContent === 'home'; // 动画进行中文字尚未替换
    })()
  `);
  check('animateIconSwap starts animation, old glyph kept at peak', swapOk === true);
  await wait(300);
  const swapped = evalW(`(()=>{ const s=document.createElement('span'); s.textContent='home'; animateIconSwap(s,'work'); return new Promise(r=>setTimeout(()=>r(s.textContent),300)); })()`);
  const glyphAfter = await swapped;
  check('animateIconSwap swaps glyph after animation', glyphAfter === 'work');

  // ===== 问题5：新建页设置按钮颜色 =====
  evalW(`openForm(null);`);
  await wait(50);
  check('new page settings icon not is-active', !doc.querySelector('#btnSettings').classList.contains('is-active'));

  // ===== 问题8：空检查项无隐形删除按钮 =====
  const rmState = evalW(`
    (function(){
      const items = document.querySelectorAll('#formContent .form-item');
      const last = items[items.length-1];
      const btn = last.querySelector('.fi-remove');
      const cs = getComputedStyle(btn);
      return {hidden: cs.visibility==='hidden', width: cs.width};
    })()
  `);
  check('empty trailing item remove btn hidden', rmState.hidden === true);
  check('empty trailing item remove btn no width', parseFloat(rmState.width) === 0);

  // ===== 问题9：新建页再点新建无响应 =====
  const before = evalW(`currentPage`);
  evalW(`document.querySelector('#newTab').click();`);
  await wait(50);
  check('clicking new tab while on new page: no page change', evalW(`currentPage`) === before);
  check('no re-transition triggered (formContent transform unchanged)', !doc.querySelector('#formContent').style.transform);

  // ===== 问题10：重置后检查项入场动画 =====
  evalW(`renderHome(); renderBottombar();`);
  await wait(50);
  evalW(`resetChecklist('c1');`);
  await wait(50);
  const entering = doc.querySelectorAll('#listContainer .check-item.item-enter').length;
  check('reset: items get entrance animation (' + entering + ')', entering >= 1);
  await wait(700);

  // ===== 回归：编辑页返回按钮 / 设置返回 / 导出文件名 / 关键词数 =====
  evalW(`openForm('c1');`);
  await wait(50);
  check('edit page top bar back arrow', doc.querySelector('#btnSettings .icon').textContent === 'arrow_back');
  evalW(`settingsFromPage='home'; renderSettings(); switchPage('settings'); renderTopbar('settings');`);
  await wait(30);
  check('settings top bar back arrow', doc.querySelector('#btnSettings .icon').textContent === 'arrow_back');
  check('support button exists', !!doc.querySelector('.support-btn'));
  check('support btn in RIPPLE_SELECTOR', evalW(`RIPPLE_SELECTOR.includes('.support-btn')`));
  check('lang item clickable for ripple', !!doc.querySelector('.settings-item.clickable .si-icon'));
  evalW(`goBackFromSettings();`);
  await wait(50);
  check('back from settings -> home with bottombar focus', evalW('currentPage') === 'home');
  const fn = evalW(`sanitizeFileName('我的 检查单/ABC') + '.checklist'`);
  check('export filename .checklist', fn === '我的 检查单_ABC.checklist');
  const kw = evalW(`AUTO_ICON_KEYWORDS.length`);
  check('keyword rows >= 200 (' + kw + ')', kw >= 200);
  const zhKw = evalW(`AUTO_ICON_KEYWORDS.reduce((n,r)=>n+r[0].split('|').length,0)`);
  check('zh keywords >= 200 (' + zhKw + ')', zhKw >= 200);
  // 图标分类本地化
  evalW(`openIconPicker('item','i1');`);
  await wait(30);
  const cat0 = doc.querySelector('.icon-category-title')?.textContent;
  check('icon category localized zh-CN: ' + cat0, cat0 === '日常');

  console.log(results.join('\n'));
  console.log('--- errors ---');
  console.log(errors.length ? errors.slice(0, 15).join('\n') : '(none)');
  process.exit(0);
})().catch(e => { console.error('TEST CRASH:', e); process.exit(2); });
