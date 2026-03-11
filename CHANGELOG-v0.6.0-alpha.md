# CHANGELOG — v0.6.0-alpha

> Released: 2026-03-11
> Type: Alpha — DX milestone (React adapter, CLI, canvas live reload)

## New Features

### `pseudo-kit-react` v0.3.0
- Source renamed to `src/index.jsx` for correct JSX handling
- 14 unit tests added (vitest + jsdom + @vitejs/plugin-react)
- Tests cover: `useComponent`, `usePseudoKit`, `usePseudoKitReady`, `useRegisterComponent`, `PseudoKitProvider`
- Zero warnings, React `act()` environment properly configured

### Canvas Viewer — `?watch=1` live reload
- Add `?watch=1` to any `?canvas=file.html` URL to enable live reload
- Polls via `fetch HEAD` every 1s, compares `ETag` / `Last-Modified`
- Shows `👁 Watching...` and `🔄 Reloaded` toasts
- Works over http:// (not file://)

### `pseudo-kit-cli` — `npx pseudo-kit init`
- New binary at `bin/pseudo-kit-init.js`, registered as `"pseudo-kit"` in package.json `bin`
- `npx pseudo-kit init [dir]` scaffolds `index.html`, `demo.html`, `components/`, `package.json`
- Idempotent: existing files are skipped
- `--help` flag prints usage

## Test Delta

| Suite | Before | After | Delta |
|---|---|---|---|
| node:test (main) | 226 | 226 | — |
| vitest (main) | 345 | 345 | — |
| vitest (pseudo-kit-react) | 0 | 14 | +14 |
| E2E Chromium | 38 | 38 | — |
| **Total** | **609** | **623** | **+14** |

## Sprint 16 Stories

| ID | Title | Points | Status |
|---|---|---|---|
| S16-01 | pseudo-kit-react unit tests | 5 | ✅ done |
| S16-02 | Canvas viewer ?watch=1 live reload | 3 | ✅ done |
| S16-03 | pseudo-kit-cli scaffold | 5 | ✅ done |
| S16-04 | v0.6.0-alpha release | 2 | ✅ done |
