# Status — pseudo-stack

**Phase:** Post-Release — All housekeeping complete  
**Release:** v1.0.0 STABLE · API locked · 61 components · WCAG 2.2 AA · 7.7 KB gzip  
**Tests:** 661+ passing (226 node:test + 392 vitest + 38 E2E + 5 a11y) · 0 failures  
**Last test run:** 2026-03-11

---

## Active work

None. All 22 sprints complete. Package naming corrections (S22) done.

---

## Deferred backlog

| ID | Title | Priority |
|----|-------|----------|
| `vscode-extension` | VSCode syntax highlight + autocomplete for pseudo-html | Last — post-1.0.0 |

**Corrections backlog — all done ✅**

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| `FIX-PKG-01` | README install snippet + CDN URL + bin key → `pseudo-stack` | High | ✅ done |
| `FIX-PKG-02` | README assets name: `pseudo-kit-assets` → `pseudo-stack-assets` | High | ✅ done |
| `FIX-PKG-03` | peerDependencies lower bound → `>=1.0.0` | Low | ✅ done |

Detail: `artifacts/corrections-pkg-naming.md`

---

## Known deferred bugs

| ID | Title | Status |
|----|-------|--------|
| `WEBKIT-E2E-01` | WebKit: migration-e2e integration timeouts | Deferred (Chromium-first policy) |

---

## Decisions

- `-pk` suffix on component files
- `@scope` on every style block
- Mobile-first breakpoints: 320 / 768 / 1024 / 1440px
- Default + named slots on all components
- Frames = empty skeletons only
- `index.js` barrel: components + frames URLs + componentsMeta + framesMeta
- SSR marker: `data-pk-hydrated` on each SSR-rendered component root
