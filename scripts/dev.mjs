import { execSync } from 'child_process';
import { watch, existsSync, statSync } from 'fs';
import { mkdir, readdir, writeFile, readFile } from 'fs/promises';
import * as esbuild from 'esbuild';
import * as http from 'http';
import * as path from 'path';
import * as sass from 'sass-embedded';

const PORT = 5173;
const DIST = 'dist';
const SRC = 'src';
const PUBLIC = 'public';

const clients = [];

async function build() {
  console.log('\nRebuilding...');
  const start = Date.now();

  execSync('node scripts/update-version.cjs', { stdio: 'inherit' });

  execSync(`rm -rf ${DIST}`, { stdio: 'inherit' });
  await mkdir(`${DIST}/assets`, { recursive: true });

  const cssResult = sass.compile(`${SRC}/main.scss`, {
    style: 'expanded',
    sourceMap: true,
    sourceMapIncludeSources: true,
    loadPaths: [SRC],
  });
  await writeFile(`${DIST}/assets/index.css`, cssResult.css);
  if (cssResult.sourceMap) {
    await writeFile(`${DIST}/assets/index.css.map`, JSON.stringify(cssResult.sourceMap));
  }

  await esbuild.build({
    entryPoints: ['src/main.ts'],
    outdir: 'dist/assets',
    entryNames: '[name]',
    format: 'esm',
    bundle: true,
    minify: false,
    sourcemap: true,
    loader: { '.ts': 'ts' },
    plugins: [{
      name: 'ignore-scss',
      setup(build) {
        build.onResolve({ filter: /\.scss$/ }, args => ({
          path: args.path,
          namespace: 'scss-ignored',
        }));
        build.onLoad({ filter: /.*/, namespace: 'scss-ignored' }, () => ({
          contents: '',
          loader: 'js',
        }));
      },
    }],
  });

  execSync(`cp -r ${PUBLIC}/* ${DIST}/`, { stdio: 'inherit' });

  const manifest = {
    name: 'Workingdiary',
    short_name: 'Workingdiary',
    description: 'Time tracking application',
    theme_color: '#1976d2',
    display: 'standalone',
    icons: [
      { src: 'icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { src: 'icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { src: 'icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { src: 'icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { src: 'icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
  await writeFile(`${DIST}/manifest.webmanifest`, JSON.stringify(manifest, null, 2));

  const registerSw = `if('serviceWorker'in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js',{scope:'/'})})}`;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Workingdiary</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <meta name="theme-color" content="#1976d2">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="stylesheet" href="/assets/index.css">
  <script>${registerSw}</script>
</head>
<body>
  <app-root style="display: flex; flex-direction: column; width: 100%; height: 100%"></app-root>
  <noscript>Please enable JavaScript to continue using this application.</noscript>
  <script type="module" src="/assets/main.js"></script>
</body>
</html>`;
  await writeFile(`${DIST}/index.html`, html);

  const precacheFiles = ['/index.html', '/assets/main.js', '/assets/index.css', ...(await scanDirFiles(`${DIST}/icons`, '/icons')), '/favicon.ico', '/manifest.webmanifest'];
  const sw = `const PRECACHE='workingdiary-dev';const PRECACHE_URLS=${JSON.stringify(precacheFiles)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(PRECACHE).then(c=>c.addAll(PRECACHE_URLS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(k=>k!==PRECACHE).map(k=>caches.delete(k)))));self.clientsClaim()});
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate'){e.respondWith(caches.match('/'))}else{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))}});`;
  await writeFile(`${DIST}/sw.js`, `${sw}\n`);

  console.log(`Build complete (${Date.now() - start}ms)`);
  clients.forEach(client => client.write('data: reload\n\n'));
}

async function scanDirFiles(dir, prefix) {
  const files = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const relPath = prefix ? `${prefix}/${entry.name}` : `/${entry.name}`;
      if (entry.isDirectory()) {
        files.push(...await scanDirFiles(path.join(dir, entry.name), relPath));
      } else {
        files.push(relPath);
      }
    }
  } catch {}
  return files;
}

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

const server = http.createServer((req, res) => {
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

  const url = req.url === '/' ? '/index.html' : req.url;
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
      content.then(buf => {
        const htmlContent = buf.toString();
        const injected = htmlContent.replace('</body>', '<script>new EventSource("/__reload").onmessage=()=>location.reload()</script></body>');
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(injected);
      });
    } else {
      content.then(buf => {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(buf);
      });
    }
  } catch {
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(PORT, () => {
  console.log(`Dev server: http://localhost:${PORT}/`);
  console.log('Watching src/ for changes...');
});

const watchedDirs = new Set();
let buildTimeout;

async function watchDir(dir) {
  if (watchedDirs.has(dir)) return;
  watchedDirs.add(dir);

  const handler = (event, filename) => {
    if (!filename) return;
    const fullPath = path.join(dir, filename);
    try {
      if (existsSync(fullPath) && statSync(fullPath).isDirectory() && !watchedDirs.has(fullPath)) {
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
