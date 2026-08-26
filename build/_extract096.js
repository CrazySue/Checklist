const fs = require('fs');
const path = require('path');
let html = fs.readFileSync(path.join(__dirname, '..', 'Checklist-v0.9.6.html'), 'utf8');
const s = html.lastIndexOf('<script>');
const e = html.lastIndexOf('</scr' + 'ipt>');
const js = html.slice(s + '<script>'.length, e);
fs.writeFileSync(path.join(__dirname, '_check096.js'), js);
console.log('script extracted, length', js.length);
