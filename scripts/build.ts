import * as crypto from 'node:crypto';
import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import * as esbuild from 'esbuild';
import * as sass from 'sass-embedded';
import { updateVersion } from './update-version.mjs';

const SRC = 'src';
const PUBLIC = 'public';

const MANIFEST = {
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

const registerSw = `if('serviceWorker'in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js',{scope:'/'})})}`;

function generateHtml(cssFile: string, jsFile: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Workingdiary</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <meta name="theme-color" content="#1976d2">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="stylesheet" href="/assets/${cssFile}">
  <script>${registerSw}</script>
</head>
<body>
  <app-root style="display: flex; flex-direction: column; width: 100%; height: 100%"></app-root>
  <noscript>Please enable JavaScript to continue using this application.</noscript>
  <script type="module" src="/assets/${jsFile}"></script>
</body>
</html>`;
}

function generateServiceWorker(
  cacheKey: string,
  precacheFiles: string[],
): string {
  return `const PRECACHE='${cacheKey}';const PRECACHE_URLS=${JSON.stringify(precacheFiles)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(PRECACHE).then(c=>c.addAll(PRECACHE_URLS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(k=>k!==PRECACHE).map(k=>caches.delete(k)))));self.clientsClaim()});
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate'){e.respondWith(caches.match('/index.html').then(r=>r||fetch(e.request)))}else{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))}});`;
}

async function scanDir(dir: string, prefix?: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = prefix ? `${prefix}/${entry.name}` : `/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...(await scanDir(fullPath, relPath)));
    } else if (!entry.name.endsWith('.map')) {
      files.push(relPath);
    }
  }
  return files;
}

export interface BuildOptions {
  dev: boolean;
  outDir: string;
}

export interface BuildResult {
  cssFile: string;
  jsFile: string;
}

export async function build({
  dev,
  outDir,
}: BuildOptions): Promise<BuildResult> {
  updateVersion();

  await rm(outDir, { recursive: true, force: true });
  await mkdir(`${outDir}/assets`, { recursive: true });

  const cssResult = sass.compile(
    `${SRC}/main.scss`,
    dev
      ? {
          style: 'expanded',
          sourceMap: true,
          sourceMapIncludeSources: true,
          loadPaths: [SRC],
        }
      : { style: 'compressed', sourceMap: false, loadPaths: [SRC] },
  );

  let cssFile: string;
  if (dev) {
    cssFile = 'index.css';
    await writeFile(`${outDir}/assets/${cssFile}`, cssResult.css);
    if (cssResult.sourceMap) {
      await writeFile(
        `${outDir}/assets/${cssFile}.map`,
        JSON.stringify(cssResult.sourceMap),
      );
    }
  } else {
    const cssContent = Buffer.from(cssResult.css);
    const cssHash = crypto
      .createHash('sha256')
      .update(cssContent)
      .digest('hex')
      .slice(0, 8);
    cssFile = `index-${cssHash}.css`;
    await writeFile(`${outDir}/assets/${cssFile}`, cssContent);
  }

  await esbuild.build({
    entryPoints: ['src/main.ts'],
    outdir: `${outDir}/assets`,
    entryNames: dev ? '[name]' : '[name]-[hash]',
    format: 'esm',
    bundle: true,
    minify: !dev,
    sourcemap: true,
    loader: { '.ts': 'ts' },
    plugins: [
      {
        name: 'ignore-scss',
        setup(build) {
          build.onResolve({ filter: /\.scss$/ }, (args) => ({
            path: args.path,
            namespace: 'scss-ignored',
          }));
          build.onLoad({ filter: /.*/, namespace: 'scss-ignored' }, () => ({
            contents: '',
            loader: 'js',
          }));
        },
      },
    ],
  });

  const assets = await readdir(`${outDir}/assets`);
  const jsFile = assets.find((f) => f.endsWith('.js'));
  if (!jsFile) {
    throw new Error('esbuild did not produce a .js output file');
  }

  await cp(PUBLIC, outDir, { recursive: true });

  await writeFile(
    `${outDir}/manifest.webmanifest`,
    JSON.stringify(MANIFEST, null, 2),
  );

  const html = generateHtml(cssFile, jsFile);
  await writeFile(`${outDir}/index.html`, html);

  const precacheFiles = await scanDir(outDir);
  const cacheKey = dev
    ? 'workingdiary-dev'
    : `workingdiary-v${crypto
        .createHash('sha256')
        .update(precacheFiles.sort().join('|'))
        .digest('hex')
        .slice(0, 8)}`;
  const sw = generateServiceWorker(cacheKey, precacheFiles);
  await writeFile(`${outDir}/sw.js`, `${sw}\n`);

  return { cssFile, jsFile };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { cssFile, jsFile } = await build({ dev: false, outDir: 'dist' });
  console.log(`Build complete: ${jsFile}, ${cssFile}`);
}
