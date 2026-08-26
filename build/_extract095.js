const fs = require('fs');
const path = require('path');
let html = fs.readFileSync(path.join(__dirname, '..', 'Checklist-v0.9.5.html'), 'utf8');
const s = html.lastIndexOf('<script>');
const e = html.lastIndexOf('</scr' + 'ipt>');
if (s < 0 || e < 0) { console.error('script tag not found'); process.exit(1); }
const js = html.slice(s + '<script>'.length, e);
fs.writeFileSync(path.join(__dirname, '_check095.js'), js);
console.log('script extracted, length', js.length);
let d=0, min=0; for (const ch of js){ if(ch==='{')d++; if(ch==='}')d--; if(d<min)min=d; }
console.log('brace balance final', d, 'min', min);
