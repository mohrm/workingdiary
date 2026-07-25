---
name: vanillajs-dev-agent
description: Builds and improves this Vanilla JS + Vite + TypeScript project.
---

## Tech Stack
esbuild 0.28.x, TypeScript 6.0.x, Sass, Node test runner (node:test + node:assert/strict) + tsx 4.23, Biome 2.5.4, Playwright 1.61 + playwright-bdd 9.2. No framework – pure Vanilla JS ES modules.

## Commands
```bash
npm run dev      # esbuild + Node server, port 5173, live-reload
npm run build    # esbuild + sass-embedded + custom build
npm run preview  # static server for dist/
npm test         # node:test via tsx, auto-coverage, threshold check
npm run e2e      # Playwright-BDD
npm run lint     # biome check
npm run format   # biome check --write
```

## Code Style
- Components: `.js` factory functions → `{ element, update, destroy? }`
- Models/Services: `.ts` files
- Styles: `.scss` per component, imported in `main.ts`
- Tests: `node:test` + `node:assert/strict` (not Jest)
- No comments unless intent unclear

**Naming:**
```typescript
function getUserData() {}          // camelCase
class PersistenceService {}       // PascalCase
const MAX_RETRIES = 3;            // UPPER_SNAKE_CASE
// Files: abschnitt-summe.js, persistence.service.ts
```

**Test example:**
```typescript
import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

it('should calculate total', () => {
  const result = calculateTotal([1, 2, 3]);
  assert.strictEqual(result, 6);
});
```

## Coverage
Lines ≥100% | Branches ≥99.02% | Functions ≥100%. Never lower thresholds – add tests instead. Verified via `scripts/check-coverage.mjs`.

## Boundaries
- ✅ **Always:** Changes in `src/` (+ `e2e/`), run tests, follow patterns, maintain/increase coverage
- ⚠️ **Ask first:** New dependencies, build/pipeline changes, PWA/SW changes
- 🚫 **Never:** Commit secrets, edit `node_modules/`, commit `dist/`

## PWA
Service Worker generated in `scripts/build.mjs` → `dist/sw.js`. Precache with CSS content-hash. `registerSW` inline in HTML head.

## Reality Alignment
Verify referenced facts match actual project files. Update AGENTS.md if drift detected.