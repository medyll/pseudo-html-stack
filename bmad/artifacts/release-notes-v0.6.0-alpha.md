# Release Notes — v0.6.0-alpha

**Release date:** 2026-03-11
**Type:** Alpha — v0.6.0 DX milestone

## What's new

### Developer Experience
Three DX features that complete the v0.6.0 milestone:

1. **`pseudo-kit-react` v0.3.0** — the React adapter now has a full unit test suite (14 tests, vitest + jsdom). Source migrated to `.jsx` for proper JSX toolchain support.

2. **Canvas viewer live reload** — `?canvas=file.html&watch=1` polls the file for changes and reloads automatically. Great for component authoring.

3. **`npx pseudo-kit init`** — scaffold a new project in seconds. Generates `index.html`, `demo.html`, and `components/` with pseudo-kit pre-wired.

## Coverage
623 tests passing — 226 node:test + 345 vitest (main) + 14 vitest (react adapter) + 38 E2E Chromium · 0 failures

## Upgrade notes
- `pseudo-kit-react` users: rename import from `./src/index.js` to `./src/index.jsx` if importing directly (package exports updated automatically)
- No breaking changes to core pseudo-stack package
