import { readFile } from 'node:fs';
import * as http from 'node:http';
import { extname, resolve } from 'node:path';

const PORT = Number(process.env.PORT) || 5173;
const DIST = `${resolve('dist')}/`;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.map': 'application/json',
};

http
  .createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    const reqUrl = req.url;
    if (!reqUrl) {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }
    const url = reqUrl === '/' ? '/index.html' : reqUrl;
    if (url.includes('..')) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    const filePath = resolve(`dist${url}`);

    if (!filePath.startsWith(DIST)) {
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
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      });
      res.end(content);
    });
  })
  .listen(PORT, () => {
    console.log(`Preview server: http://localhost:${PORT}/`);
  });
