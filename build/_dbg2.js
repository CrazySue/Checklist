process.on('uncaughtException', e=>{ console.log('UNCAUGHT: ' + e.message); console.log(e.stack.split('\n').slice(0,6).join('\n')); process.exit(2); });
try {
  const fs = require('fs');
  const path = require('path');
  const { JSDOM } = require('jsdom');
  const html = fs.readFileSync(path.join(__dirname, '..', 'Checklist-v0.9.0.html'), 'utf8');
  console.log('html loaded', html.length);
  const dom = new JSDOM(html, {runScripts:'dangerously', pretendToBeVisual:true, url:'http://localhost/', beforeParse(w){ w.Element.prototype.scrollIntoView=function(){}; }});
  console.log('dom created');
  setTimeout(()=>{ console.log('title:', dom.window.document.querySelector('#topbarTitleText') && dom.window.document.querySelector('#topbarTitleText').textContent); process.exit(0); }, 500);
} catch(e) { console.log('CAUGHT: ' + e.message); console.log(e.stack.split('\n').slice(0,8).join('\n')); process.exit(3); }
