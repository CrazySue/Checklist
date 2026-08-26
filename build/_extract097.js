const fs = require('fs');
const path = require('path');
let html = fs.readFileSync(path.join(__dirname, '..', 'Checklist-v0.9.7.html'), 'utf8');
const s0 = html.lastIndexOf('<script>');
const e = html.lastIndexOf('</scr' + 'ipt>');
const js = html.slice(s0 + '<script>'.length, e);
fs.writeFileSync(path.join(__dirname, '_check097.js'), js);
console.log('script extracted, length', js.length);
