---
name: vanillajs-dev-agent
description: Builds and improves this Vanilla JS + Vite + TypeScript project.
---

## Tech Stack
esbuild 0.28.x, TypeScript 7.0.x, Sass, Node test runner (node:test + node:assert/strict) + tsx 4.23, Biome 2.5.x, Playwright 1.61 + playwright-bdd 9.2. No framework – pure Vanilla JS ES modules.

## Commands
```bash
npm run dev      # esbuild + Node server, port 5173, live-reload
npm run build    # esbuild + sass-embedded + custom build
npm run preview  # static server for dist/
npm test         # node:test via tsx, auto-coverage, threshold check
npm run e2e      # Playwright-BDD
npm run typecheck # tsc --noEmit
npm run lint     # biome check
npm run format   # biome check --write
```

## Code Style
- Components: `.ts` factory functions → `{ element, update, destroy? }`
- Models/Services: `.ts` files
- Styles: `.scss` per component, imported in `main.ts`
- Tests: `node:test` + `node:assert/strict` (not Jest)
- No comments unless intent unclear

**Naming:**
```typescript
function getUserData() {}          // camelCase
class PersistenceService {}       // PascalCase
const MAX_RETRIES = 3;            // UPPER_SNAKE_CASE
// Files: abschnitt-summe.ts, persistence.ts
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
Lines ≥100% | Branches ≥99.02% | Functions ≥100%. Never lower thresholds – add tests instead. Verified via `scripts/check-coverage.ts`.

**Note:** Coverage thresholds may vary slightly between runs due to branch coverage rounding. Always check actual measured values before committing threshold changes.

## Boundaries
- ✅ **Always:** Changes in `src/` (+ `e2e/`), run tests, follow patterns, maintain/increase coverage
- ⚠️ **Ask first:** New dependencies, build/pipeline changes, PWA/SW changes
- 🚫 **Never:** Commit secrets, edit `node_modules/`, commit `dist/`

## Pre-existing Issues Found During Work
If verification (lint, typecheck, tests, build) surfaces a problem that already existed before the current change — confirmed by checking it also fails on the base branch — do not fix it as a drive-by. File a GitHub issue describing it (what fails, where, how it was confirmed pre-existing) and reference it from the PR instead.

## PWA
Service Worker generated in `scripts/build.ts` → `dist/sw.js`. Precache with CSS content-hash. `registerSW` inline in HTML head.

## Reality Alignment
Verify referenced facts match actual project files. Update AGENTS.md if drift detected.