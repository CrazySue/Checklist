const fs = require('fs');
const html = fs.readFileSync('E:\\WorkSpace\\Checklist\\Checklist-v0.9.3.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.log('NO SCRIPT FOUND'); process.exit(1); }
try {
  new Function(m[1]);
  console.log('JS SYNTAX OK, script length=' + m[1].length);
  // 快速统计
  const kw = (m[1].match(/^\s*\['/gm) || []).length;
  console.log('AUTO_ICON_KEYWORDS rows approx=' + kw);
} catch (e) {
  console.log('SYNTAX ERROR: ' + e.message);
  process.exit(1);
}
