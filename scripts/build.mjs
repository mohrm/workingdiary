import { execSync } from 'child_process';
import { cp, mkdir, readFile, readdir, rename, writeFile } from 'fs/promises';
import * as esbuild from 'esbuild';
import * as crypto from 'crypto';
import * as path from 'path';

const DIST = 'dist';
const SRC = 'src';
const PUBLIC = 'public';

execSync('node scripts/update-version.cjs', { stdio: 'inherit' });

execSync(`rm -rf ${DIST}`, { stdio: 'inherit' });
await mkdir(`${DIST}/assets`, { recursive: true });

execSync(
  `npx sass ${SRC}/main.scss:${DIST}/assets/index.css --style=compressed --no-source-map --load-path=${SRC}`,
  { stdio: 'inherit' },
);

const cssContent = await readFile(`${DIST}/assets/index.css`);
const cssHash = crypto.createHash('sha256').update(cssContent).digest('hex').slice(0, 8);
const cssFile = `index-${cssHash}.css`;
await rename(`${DIST}/assets/index.css`, `${DIST}/assets/${cssFile}`);

await esbuild.build({
  entryPoints: ['src/main.ts'],
  outdir: 'dist/assets',
  entryNames: '[name]-[hash]',
  format: 'esm',
  bundle: true,
  minify: true,
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

const assets = await readdir(`${DIST}/assets`);
const jsFile = assets.find(f => f.endsWith('.js'));

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

const inlineRegisterSw = `if('serviceWorker'in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js',{scope:'/'})})}`;

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
  <link rel="stylesheet" href="/assets/${cssFile}">
  <script>${inlineRegisterSw}</script>
</head>
<body>
  <app-root style="display: flex; flex-direction: column; width: 100%; height: 100%"></app-root>
  <noscript>Please enable JavaScript to continue using this application.</noscript>
  <script type="module" src="/assets/${jsFile}"></script>
</body>
</html>`;
await writeFile(`${DIST}/index.html`, html);

async function scanDir(dir, prefix) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = prefix ? `${prefix}/${entry.name}` : `/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...await scanDir(fullPath, relPath));
    } else if (!entry.name.endsWith('.map')) {
      files.push(relPath);
    }
  }
  return files;
}

const precacheFiles = await scanDir(DIST);
const cacheKey = `workingdiary-v${cssHash}`;

const sw = `const PRECACHE='${cacheKey}';const PRECACHE_URLS=${JSON.stringify(precacheFiles)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(PRECACHE).then(c=>c.addAll(PRECACHE_URLS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(k=>k!==PRECACHE).map(k=>caches.delete(k)))));self.clientsClaim()});
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate'){e.respondWith(caches.match('/'))}else{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))}});`;
await writeFile(`${DIST}/sw.js`, `${sw}\n`);

console.log(`Build complete: ${jsFile}, ${cssFile}`);
