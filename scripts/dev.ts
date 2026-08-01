import { existsSync, statSync, type WatchEventType, watch } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import * as http from 'node:http';
import * as path from 'node:path';
import { build as runBuild } from './build';

const PORT = 5173;
const DIST = '.dev-dist';
const SRC = 'src';

const clients: http.ServerResponse[] = [];

async function build(): Promise<void> {
  console.log('\nRebuilding...');
  const start = Date.now();

  await runBuild({ dev: true, outDir: DIST });

  console.log(`Build complete (${Date.now() - start}ms)`);
  clients.forEach((client) => {
    client.write('data: reload\n\n');
  });
}

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

const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse) => {
    if (req.url === '/__reload') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      clients.push(res);
      req.on('close', () => {
        const idx = clients.indexOf(res);
        if (idx >= 0) clients.splice(idx, 1);
      });
      return;
    }

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
    const DIST_RESOLVED = path.resolve(DIST) + path.sep;
    const filePath = path.resolve(DIST + url);
    if (!filePath.startsWith(DIST_RESOLVED)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    try {
      if (!existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const content = readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      if (ext === '.html') {
        content.then((buf) => {
          const htmlContent = buf.toString();
          const injected = htmlContent.replace(
            '</body>',
            '<script>new EventSource("/__reload").onmessage=()=>location.reload()</script></body>',
          );
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(injected);
        });
      } else {
        content.then((buf) => {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(buf);
        });
      }
    } catch {
      res.writeHead(500);
      res.end('Server error');
    }
  },
);

server.listen(PORT, () => {
  console.log(`Dev server: http://localhost:${PORT}/`);
  console.log('Watching src/ for changes...');
});

const watchedDirs = new Set<string>();
let buildTimeout: NodeJS.Timeout | undefined;

async function watchDir(dir: string): Promise<void> {
  if (watchedDirs.has(dir)) return;
  watchedDirs.add(dir);

  const handler = (_event: WatchEventType, filename: string | null): void => {
    if (!filename) return;
    const fullPath = path.join(dir, filename);
    try {
      if (
        existsSync(fullPath) &&
        statSync(fullPath).isDirectory() &&
        !watchedDirs.has(fullPath)
      ) {
        watchDir(fullPath);
      }
    } catch {}
    const relPath = path.relative(SRC, fullPath);
    if (/\.(scss|ts|js)$/.test(relPath)) {
      clearTimeout(buildTimeout);
      buildTimeout = setTimeout(build, 100);
    }
  };

  watch(dir, handler);

  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        await watchDir(path.join(dir, entry.name));
      }
    }
  } catch {}
}

await build();
await watchDir(SRC);
