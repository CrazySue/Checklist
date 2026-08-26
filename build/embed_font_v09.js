// Embeds HarmonyOS Sans SC Bold (700) into Checklist-v0.9.0.html after the 500 face.
const fs = require('fs');
const path = require('path');
const htmlPath = path.join(__dirname, '..', 'Checklist-v0.9.0.html');
const ttfPath = path.join(__dirname, '..', 'HarmonyOS_Sans_SC', 'HarmonyOS_Sans_SC_Bold.ttf');

let html = fs.readFileSync(htmlPath, 'utf8');
const b64 = fs.readFileSync(ttfPath).toString('base64');
const face = "@font-face{font-family:'HarmonyOS Sans SC';font-style:normal;font-weight:700;font-display:swap;src:url(data:font/ttf;base64," + b64 + ")}";

// Insert after the weight-500 @font-face line
const marker = "font-weight:500;font-display:swap;src:url(data:font/ttf;base64,";
const idx = html.indexOf(marker);
if (idx < 0) { console.error('marker not found'); process.exit(1); }
const lineEnd = html.indexOf('\n', idx);
if (lineEnd < 0) { console.error('line end not found'); process.exit(1); }
html = html.slice(0, lineEnd + 1) + face + '\n' + html.slice(lineEnd + 1);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('inserted 700 face, new size:', html.length);
