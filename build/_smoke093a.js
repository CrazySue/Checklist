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
  const ev = (code) => w.eval(code);

  check('init no errors', errors.length === 0);

  ev(`
    Store.state.checklists = [
      {id:'c1', name:'买菜', icon:'auto', resetHours:0,
       items:[{id:'i1', text:'苹果', icon:'auto', done:false},{id:'i2', text:'牛奶', icon:'auto', done:false}],
       completedAt:null, createdAt:Date.now()},
      {id:'c2', name:'晨练', icon:'auto', resetHours:0,
       items:[{id:'i3', text:'跑步', icon:'auto', done:true}],
       completedAt:Date.now(), createdAt:Date.now()},
      {id:'c3', name:'读书', icon:'auto', resetHours:0,
       items:[{id:'i4', text:'阅读', icon:'auto', done:true}],
       completedAt:Date.now(), createdAt:Date.now()}
    ];
    Store.state.activeChecklistId='c1';
    Store.state._editing=null;
    Store.save();
  `);
  ev(`renderHome(); renderBottombar(); renderTopbar('home');`);
  await wait(50);

  // ===== 问题6：咖啡视图在切换场景下必须正确显示 =====
  ev(`completeItem('c1','i1');`);
  await wait(500);
  ev(`completeItem('c1','i2');`);
  await wait(500);
  check('6a: coffee shown after completing last item', !!doc.querySelector('#listContainer #allDoneView.show'));

  // 已完成 -> 新建页 -> 切回已完成
  ev(`openForm(null);`);
  await wait(250);
  ev(`switchChecklist('c2');`);
  await wait(500);
  check('6b: completed -> new -> completed shows coffee', !!doc.querySelector('#listContainer #allDoneView.show'));

  // 编辑页 -> 已完成检查单
  ev(`openForm('c1');`);
  await wait(250);
  ev(`switchChecklist('c3');`);
  await wait(500);
  check('6c: edit -> completed shows coffee', !!doc.querySelector('#listContainer #allDoneView.show'));

  // 已完成 -> 已完成
  ev(`switchChecklist('c2');`);
  await wait(500);
  check('6d: completed -> completed shows coffee', !!doc.querySelector('#listContainer #allDoneView.show'));

  // ===== 问题2：翻页方向 =====
  const pf = () => doc.getElementById('pageForm').className;
  const ph = () => doc.getElementById('pageHome').className;
  const pformEnter = () => pf().includes('page-enter-right') ? 'right' : (pf().includes('page-enter-left') ? 'left' : 'none');
  const phomeEnter = () => ph().includes('page-enter-left') ? 'left' : (ph().includes('page-enter-right') ? 'right' : 'none');

  ev(`settingsFromPage='home'; renderSettings(); switchPage('settings');`);
  check('2a: settings enters from right', doc.getElementById('pageSettings').className.includes('page-enter-right'));
  ev(`goBackFromSettings();`);
  check('2b: settings -> home enters from left (exception)', phomeEnter() === 'left');
  ev(`openForm(null);`);
  check('2c: new page enters from right after settings roundtrip', pformEnter() === 'right');

  ev(`settingsFromPage='form'; switchPage('settings');`);
  await wait(30);
  ev(`goBackFromSettings();`);
  check('2d: settings -> new page enters from right', pformEnter() === 'right');

  ev(`switchPage('home');`);
  await wait(30);
  ev(`openForm('c1');`);
  check('2e: edit page enters from right', pformEnter() === 'right');
  ev(`Store.state._editing=null; switchPage('home');`);
  check('2f: edit -> home enters from left', phomeEnter() === 'left');
  await wait(30);

  // ===== 问题1：咖啡动效节奏（CSS 时长 + completeItem 时序）=====
  const css = doc.querySelector('style').textContent;
  check('1: coffee entrance 240ms', css.includes('opacity 240ms var(--md-easing-emphasized-decelerate)'));
  check('1b: coffee leaving 280ms', css.includes('opacity 280ms var(--md-easing-emphasized-accelerate)'));
  const src = ev(`completeItem.toString()`);
  check('1c: completion timing 150/300ms', src.includes('}, 150);') && src.includes('}, 300);'));

  console.log(results.join('\n'));
  console.log('--- errors ---');
  console.log(errors.length ? errors.slice(0, 15).join('\n') : '(none)');
  process.exit(0);
})().catch(e => { console.error('TEST CRASH:', e); process.exit(2); });
