import { createServer } from 'http';
import { readFile } from 'fs';
import { extname, resolve, join, sep } from 'path';

const PORT = process.env.PORT || 5173;
const DIST = resolve('dist');

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

function safePath(url) {
  const filePath = resolve(join(DIST, url === '/' ? '/index.html' : url));
  if (filePath !== DIST && !filePath.startsWith(DIST + sep)) return null;
  return filePath;
}

createServer((req, res) => {
  const filePath = safePath(req.url);
  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

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
