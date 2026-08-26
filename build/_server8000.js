const http = require('http');
const fs = require('fs');
const path = require('path');
const root = 'E:\\WorkSpace\\Checklist';
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'};
const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/' || urlPath === '') urlPath = '/Checklist-v0.9.3.html';
  const file = path.join(root, urlPath);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found: ' + urlPath); return; }
    res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream'});
    res.end(data);
  });
});
server.listen(8000, () => console.log('serving on http://localhost:8000'));
