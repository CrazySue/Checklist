const fs = require('fs');
const path = require('path');
let html = fs.readFileSync(path.join(__dirname, '..', 'Checklist-v0.9.9.html'), 'utf8');
const s0 = html.lastIndexOf('<script>');
const e = html.lastIndexOf('</scr' + 'ipt>');
fs.writeFileSync(path.join(__dirname, '_check099.js'), html.slice(s0 + '<script>'.length, e));
console.log('script extracted');
