import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  generateHtml,
  generateServiceWorker,
  normalizeBasePath,
} from './build.js';

describe('normalizeBasePath', () => {
  it('defaults to root when undefined or empty', () => {
    assert.strictEqual(normalizeBasePath(undefined), '/');
    assert.strictEqual(normalizeBasePath(''), '/');
  });

  it('normalizes missing or duplicated slashes', () => {
    assert.strictEqual(normalizeBasePath('workingdiary'), '/workingdiary/');
    assert.strictEqual(normalizeBasePath('/workingdiary'), '/workingdiary/');
    assert.strictEqual(normalizeBasePath('workingdiary/'), '/workingdiary/');
    assert.strictEqual(
      normalizeBasePath('/workingdiary/preview/foo/'),
      '/workingdiary/preview/foo/',
    );
  });
});

describe('generateHtml', () => {
  it('produces the existing root-path output when basePath is "/"', () => {
    const html = generateHtml('main-HASH.css', 'main-HASH.js', '/');
    assert.ok(html.includes('<base href="/">'));
    assert.ok(html.includes('href="favicon.ico"'));
    assert.ok(html.includes('href="/manifest.webmanifest"'));
    assert.ok(html.includes('href="/assets/main-HASH.css"'));
    assert.ok(html.includes('src="/assets/main-HASH.js"'));
    assert.ok(
      html.includes("navigator.serviceWorker.register('/sw.js',{scope:'/'})"),
    );
  });

  it('prefixes all absolute paths with the base path', () => {
    const base = '/workingdiary/preview/feature-foo/';
    const html = generateHtml('main-HASH.css', 'main-HASH.js', base);
    assert.ok(html.includes(`<base href="${base}">`));
    assert.ok(html.includes(`href="${base}manifest.webmanifest"`));
    assert.ok(html.includes(`href="${base}assets/main-HASH.css"`));
    assert.ok(html.includes(`src="${base}assets/main-HASH.js"`));
    assert.ok(
      html.includes(
        `navigator.serviceWorker.register('${base}sw.js',{scope:'${base}'})`,
      ),
    );
  });
});

describe('generateServiceWorker', () => {
  it('keeps the existing root-path precache and navigation URLs when basePath is "/"', () => {
    const sw = generateServiceWorker(
      'workingdiary-vab12cd34',
      ['/index.html', '/assets/main-HASH.js'],
      '/',
    );
    assert.strictEqual(
      sw,
      `const PRECACHE='workingdiary-vab12cd34';const PRECACHE_URLS=["/index.html","/assets/main-HASH.js"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(PRECACHE).then(c=>c.addAll(PRECACHE_URLS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(k=>k!==PRECACHE).map(k=>caches.delete(k)))));self.clientsClaim()});
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate'){e.respondWith(caches.match('/index.html').then(r=>r||fetch(e.request)))}else{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))}});`,
    );
  });

  it('prefixes precache and navigation URLs with the base path', () => {
    const base = '/workingdiary/preview/feature-foo/';
    const sw = generateServiceWorker(
      'workingdiary-vab12cd34',
      ['/index.html', '/sw.js', '/assets/main-HASH.js'],
      base,
    );
    assert.ok(
      sw.includes(
        `PRECACHE_URLS=["${base}index.html","${base}sw.js","${base}assets/main-HASH.js"]`,
      ),
    );
    assert.ok(sw.includes(`caches.match('${base}index.html')`));
  });
});
