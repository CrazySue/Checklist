const http = require('http');
const fs = require('fs');
const path = require('path');
const root = 'E:\\WorkSpace\\Checklist';
const server = http.createServer((req, res) => {
  const file = path.join(root, req.url === '/' ? 'Checklist-v0.9.0.html' : decodeURIComponent(req.url.slice(1)));
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(data);
  });
});
server.listen(8931, () => console.log('serving on 8931'));
