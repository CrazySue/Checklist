const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const root = path.join(__dirname, '..');
// 1. fresh copy
fs.copyFileSync(path.join(root, 'Checklist-v0.8.0.html'), path.join(root, 'Checklist-v0.9.0.html'));
console.log('copied');
// 2. embed bold font
execSync('node "' + path.join(__dirname, 'embed_font_v09.js') + '"', {stdio:'inherit'});
// 3. run upgrade
execSync('node "' + path.join(__dirname, 'upgrade_v09.js') + '"', {stdio:'inherit'});
console.log('rebuild done');
