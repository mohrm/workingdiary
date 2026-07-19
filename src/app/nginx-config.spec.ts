import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

describe('Nginx Config', () => {
  const cfgPath = 'nginx.default.conf.template';

  it('exists as a template file', () => {
    assert.ok(existsSync(cfgPath));
  });

  it('sets no-cache on sw.js', () => {
    const cfg = readFileSync(cfgPath, 'utf-8');
    assert.ok(
      /location\s*=\s*\/sw\.js\s*\{[\s\S]*?Cache-Control\s*"no-cache"/.test(cfg),
    );
  });

  it('sets no-cache on index.html', () => {
    const cfg = readFileSync(cfgPath, 'utf-8');
    assert.ok(
      /location\s*=\s*\/index\.html\s*\{[\s\S]*?Cache-Control\s*"no-cache"/.test(cfg),
    );
  });

  it('sets immutable cache on /assets/', () => {
    const cfg = readFileSync(cfgPath, 'utf-8');
    assert.ok(
      /location\s*\/assets\/\s*\{[\s\S]*?immutable/.test(cfg),
    );
  });
});
