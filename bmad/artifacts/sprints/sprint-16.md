# Sprint 16 — v0.6.0 DX: React Adapter Tests + Canvas Live Reload + CLI

**Duration:** 2026-04-08 → 2026-04-21
**Capacity:** 18 story points

## Sprint Goal
Harden the existing `pseudo-kit-react` v0.2.0 adapter with unit tests, add live-reload polling to the canvas viewer, and ship a minimal `pseudo-kit-cli` scaffold command — completing the v0.6.0 DX milestone.

## Stories

| ID | Epic | Title | Points | Priority | Assignee |
|---|---|---|---|---|---|
| S16-01 | DX | `pseudo-kit-react` unit tests — hooks + provider | 5 | Must | frontend-team |
| S16-02 | DX | Canvas viewer — `?watch=1` live reload via fetch polling | 3 | Should | frontend-team |
| S16-03 | DX | `pseudo-kit-cli` — `npx pseudo-kit init` project scaffold | 5 | Could | developer |
| S16-04 | Release | v0.6.0-alpha release — pseudo-kit-react 0.3.0 + viewer update | 2 | Must | developer |

**Total:** 15 points

## Dependencies
- S16-01: depends on pseudo-kit-react v0.2.0 (already exists)
- S16-02: self-contained viewer JS addition (no deps)
- S16-03: standalone Node.js CLI (no deps)
- S16-04: depends on S16-01 passing

## Definition of Done (sprint-level)
- [ ] S16-01: pseudo-kit-react hooks tested (useComponent, usePseudoKit, PseudoKitProvider)
- [ ] S16-02: viewer `?watch=1` polls file and reloads on change
- [ ] S16-03: `npx pseudo-kit init` creates project skeleton
- [ ] All tests green (target: 625+ passing)

## Risks
- React Testing Library in happy-dom/vitest: JSX transform setup needed — use `@vitejs/plugin-react` or `@babel/preset-react`
- Canvas viewer live reload: `fetch HEAD` polling may be blocked by CORS on file:// — scope to http:// context only

*Created by bmad-master next --auto: 2026-03-11.*
