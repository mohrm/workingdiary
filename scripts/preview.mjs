import { createServer } from 'http';
import { readFile, existsSync } from 'fs';
import { extname, join } from 'path';

const PORT = process.env.PORT || 5173;
const DIST = 'dist';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.map': 'application/json',
};

createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  const filePath = join(DIST, url);

  readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  });
}).listen(PORT, () => {
  console.log(`Preview server: http://localhost:${PORT}/`);
});
