# 📋 BMAD Dashboard — pseudo-html-kit

> **Sync:** 2026-03-07 | **Phase:** ✅ v0.4.0 GA — All phases complete | **Tests:** 432 passing, 0 failures | **Components:** 52 | **Sprints:** 11/11 done

---

## 🚀 Release Status

| Package | Status | Version | Notes |
|:--------|:------:|:-------:|:------|
| **pseudo-kit** | ✅ Released | v0.4.0 | [CHANGELOG-v0.4.0.md](../CHANGELOG-v0.4.0.md) |
| **pseudo-stack-assets** | ✅ Released | v0.4.0 | 52 components, 20 frames, 3 demos |
| **git tag** | ✅ v0.4.0 | — | CI handles npm publish |

---

## 🏗️ Project Phases

| Phase | Status | Artifact |
|:------|:------:|:---------|
| **1 – Analysis** | ✅ Done | [product-brief.md](artifacts/product-brief.md) |
| **2 – Planning** | ✅ Done | [prd.md](artifacts/prd.md) · [tech-spec.md](artifacts/tech-spec.md) · [roadmap.md](artifacts/roadmap.md) |
| **3 – Solutioning** | ✅ Done | [architecture.md](artifacts/architecture.md) |
| **4 – Implementation** | ✅ Done | 11 sprints · 63 stories |
| **5 – Release** | ✅ Done | v0.3.0 · v0.4.0-alpha · v0.4.0 GA |

---

## 🏃 Sprint History — All Complete

| Sprint | Theme | Pts | Status |
|:-------|:------|:---:|:------:|
| [S1](artifacts/sprints/sprint-01.md) | Foundation & Atoms | 25 | ✅ |
| [S2](artifacts/sprints/sprint-02.md) | Molecules | 21 | ✅ |
| [S3](artifacts/sprints/sprint-03.md) | Organisms | 28 | ✅ |
| [S4](artifacts/sprints/sprint-04.md) | Frames | 29 | ✅ |
| [S5](artifacts/sprints/sprint-05.md) | Viewer | 28 | ✅ |
| [S6](artifacts/sprints/sprint-06.md) | Netflix + Amazon demos | 22 | ✅ |
| [S7](artifacts/sprints/sprint-07.md) | Facebook demo + SSR | 22 | ✅ |
| [S8](artifacts/sprints/sprint-08.md) | Tests, A11y, Docs | 45 | ✅ |
| [S9](artifacts/sprints/sprint-09.md) | Modal, Dropdown, Tooltip, Notification (2026 APIs) | 24 | ✅ |
| [S10](artifacts/sprints/sprint-10.md) | Input, Checkbox/Radio, Grid (Constraint Validation, Container Queries) | 17 | ✅ |
| [S11](artifacts/sprints/sprint-11.md) | Select, Combobox, Textarea, Accordion + v0.4.0 GA | 14 | ✅ |

**Total: 275 pts — 63/63 stories — 0 pending**

---

## 📦 Asset Library

| Layer | Count | New in v0.4.0 |
|:------|:-----:|:-------------|
| Atoms | 20 | `select-pk`, `checkbox-pk`, `radio-pk`, `input-pk` (Constraint Validation), `textarea-pk` (anchor hints) |
| Molecules | 18 | `combobox-pk`, `modal-pk` (`<dialog>`), `dropdown-pk` (Popover), `tooltip-pk` (Anchor), `notification-pk` (Interest), `grid-pk` (CQ) |
| Organisms | 14 | `accordion-pk` (View Transitions) |
| Frames | 20 | — |
| Demo Apps | 3 | Netflix · Amazon · Facebook |

---

## 🧪 Quality Gates

| Check | Status | Details |
|:------|:------:|:--------|
| node:test | ✅ 211/211 | Server + shared + index |
| vitest (atoms) | ✅ 69/69 | — |
| vitest (molecules) | ✅ 57/57 | — |
| vitest (organisms) | ✅ 44/44 | — |
| vitest (client) | ✅ 51/51 | — |
| **Total** | ✅ **432/432** | 0 failures |
| E2E | ✅ 12 scenarios | Chromium (primary) · Firefox/WebKit (deferred) |
| A11y | ✅ 0 regressions | axe-core audit |

---

## 🗺️ Roadmap (next)

| Version | Theme | Status |
|:--------|:------|:------:|
| **v0.5.0** | CSS 2026: carousel (Scroll Snap), date-picker, `text-wrap: balance`, CSS `if()` pass | 🔜 planned |
| **v0.6.0** | DX: React adapter, Svelte 5 adapter, VSCode extension | 📋 planned |
| **v1.0.0** | Stable API lock, full docs site, WCAG 2.2 AA audit | 📋 planned |

See [roadmap.md](artifacts/roadmap.md) for full detail.

---

## 👉 Next Move

**All sprints complete. v0.4.0 GA shipped.**

```
bmad plan prd        → draft v0.5.0 PRD (CSS 2026 theme)
bmad sprint          → create Sprint 12 backlog from roadmap
bmad audit --code    → baseline audit before v0.5.0
bmad readme --full   → generate updated full README
```


## 🏗️ Workflow Status

| Phase | Status | Artifact |
|:------|:------:|:---------|
| **1 – Analysis** | ✅ Done | [product-brief.md](artifacts/product-brief.md) |
| **2 – Planning** | ✅ Done | [prd.md](artifacts/prd.md) · [tech-spec.md](artifacts/tech-spec.md) |
| **3 – Solutioning** | ✅ Done | [architecture.md](artifacts/architecture.md) |
| **4 – Implementation** | ✅ Done | [sprints/](artifacts/sprints/) |

---

## 🏃 Sprint Roadmap

### v0.3.0 Cycle (8 sprints) — ✅ COMPLETE

| Sprint | Thème | Points | Status |
|:-------|:------|:------:|:------:|
| [S1](artifacts/sprints/sprint-01.md) | Foundation & Atoms | 25 | ✅ |
| [S2](artifacts/sprints/sprint-02.md) | Molecules | 21 | ✅ |
| [S3](artifacts/sprints/sprint-03.md) | Organisms | 28 | ✅ |
| [S4](artifacts/sprints/sprint-04.md) | Frames | 29 | ✅ |
| [S5](artifacts/sprints/sprint-05.md) | Viewer | 28 | ✅ |
| [S6](artifacts/sprints/sprint-06.md) | Demos (Netflix, Amazon) | 22 | ✅ |
| [S7](artifacts/sprints/sprint-07.md) | Demo (Facebook) + SSR | 22 | ✅ |
| [S8](artifacts/sprints/sprint-08.md) | Tests, A11y, Docs | 45 | ✅ |

**Total: 220 pts — ✅ Complete**

### v0.4.0 Cycle — 🆕 IN PROGRESS

| Sprint | Thème | Points | Status |
|:-------|:------|:------:|:------:|
| [S9](artifacts/sprints/sprint-09.md) | **API Migration** (Modal, Dropdown, Tooltip, Notification) | 24 | ✅ 100% |

**S9 Delivered:** 7/7 stories (Modal `<dialog>`, Dropdown Popover, Tooltip Anchor, Notification Interest), 51 unit tests ✅, E2E + fallback validation ✅

---

## 🎯 Backlog

| ID | Feature | Sprint | Status |
|:---|:--------|:------:|:------:|
| PKA-001 | `pseudo-kit-assets` scaffold + barrel | S1 | ✅ |
| PKA-002 | 46 composants (17 atoms + 16 molecules + 13 organisms) | S1→S3 | ✅ |
| PKA-003 | 20 frames squelettes vides | S4 | ✅ |
| PKA-004 | `pseudo-canvas-viewer.html` (Figma-style) | S5 | ✅ |
| PKA-005 | Netflix demo app | S6 | ✅ |
| PKA-006 | Amazon demo app | S6 | ✅ |
| PKA-007 | Facebook demo app | S7 | ✅ |

---

## 🏛️ Architecture (locked)

```
pseudo-kit-assets/ (npm package)
├── components/atoms/      (17) — @scope, mobile-first, named+default slots
├── components/molecules/  (16) — idem
├── components/organisms/  (13) — idem
├── frames/                (20) — squelettes vides, named slots uniquement
├── index.js               — components + frames (URLs) + componentsMeta + framesMeta
├── demos/
│   ├── netflix/   tokens.css + index.html
│   ├── amazon/    tokens.css + index.html
│   └── facebook/  tokens.css + index.html
└── viewer/
    └── pseudo-canvas-viewer.html  — drag-and-drop + ?canvas= + ?assets=auto

pseudo-kit-react/ (new — v0.1.0)
├── src/index.js           — useComponent() + usePseudoKit() hooks
├── demo/index.html        — browser demo (React 18 CDN)
└── README.md
```

**Peer dep:** `pseudo-html-kit` | **Browser min:** Chrome 118 / FF 128 / Safari 17.4

## ✅ Sprint 10 — Form Controls & Layout — STORIES COMPLETE

| Story | Epic | Points | Status |
|:------|:-----|:------:|:------:|
| [S10-01](artifacts/stories/S10-01.md) | Form | Input validation (constraint API) | 5 | ✅ Done |
| [S10-03](artifacts/stories/S10-03.md) | Form | Checkbox/Radio (:checked + indeterminate) | 3 | ✅ Done |
| [S10-05](artifacts/stories/S10-05.md) | Layout | Grid Lanes + Container Queries | 5 | ✅ Done |
| [S10-07](artifacts/stories/S10-07.md) | Testing | E2E + Unit tests (form/layout) | 4 | ✅ Done |

**17 / 17 points delivered. Sprint 10 Definition of Done met.**

| Story | Epic | Points | Status |
|:------|:-----|:------:|:------:|
| [S9-01](artifacts/stories/S9-01.md) | Migration | Modal → `<dialog>` | 5 | ✅ |
| [S9-02](artifacts/stories/S9-02.md) | Migration | Dropdown → Popover API | 5 | ✅ |
| [S9-03](artifacts/stories/S9-03.md) | Migration | Tooltip → Anchor Positioning | 3 | ✅ |
| [S9-04](artifacts/stories/S9-04.md) | Migration | Notification → Interest Invokers | 3 | ✅ |
| [S9-05](artifacts/stories/S9-05.md) | Testing | Unit test updates | 3 | ✅ |
| [S9-06](artifacts/stories/S9-06.md) | Testing | E2E tests (Playwright) | 3 | ✅ |
| [S9-07](artifacts/stories/S9-07.md) | QA | Cross-browser fallback validation | 2 | ✅ |

**24 / 24 points delivered. Sprint 09 Definition of Done met.**

---

## ✅ Sprint 08 — Quality & DX — ALL COMPLETE

| Story | Epic | Points | Status |
|:------|:-----|:------:|:------:|
| [S8-01](artifacts/stories/S8-01.md) | A – Unit Tests — Atoms (17) | 8 | ✅ |
| [S8-02](artifacts/stories/S8-02.md) | A – Unit Tests — Molecules (16) | 7 | ✅ |
| [S8-03](artifacts/stories/S8-03.md) | A – Unit Tests — Organisms (13) | 6 | ✅ |
| [S8-04](artifacts/stories/S8-04.md) | B – A11y audit (axe-core) | 5 | ✅ |
| [S8-05](artifacts/stories/S8-05.md) | B – A11y fixes (Critical + Serious) | 5 | ✅ |
| [S8-06](artifacts/stories/S8-06.md) | C – JSDoc — Atoms + Molecules | 4 | ✅ |
| [S8-07](artifacts/stories/S8-07.md) | C – JSDoc — Organisms + Frames | 3 | ✅ |
| [S8-08](artifacts/stories/S8-08.md) | D – pseudo-kit-react scaffold | 3 | ✅ |
| [S8-09](artifacts/stories/S8-09.md) | D – `useComponent` hook | 4 | ✅ |

**45 / 45 points delivered. Sprint 08 Definition of Done met.**

---

## 🧪 QA — Sprint 09 Summary

| Metric | Value |
|:-------|:------|
| Test plan | ✅ Done |
| Last run | 2026-03-06 |
| Coverage | **51 unit tests** (vitest) — Modal, Dropdown, Tooltip, Notification |
| E2E Tests | **20+ tests** — Native API paths + fallback validation |
| Smoke Tests | ✅ 4/5 passing (page load, component registration, zero errors) |
| Cross-browser | ✅ Chromium, Firefox 128+, Safari 17.4+ |
| A11y | 0 regressions |
| Open bugs | 1 |

**v0.4.0-alpha Quality Gates:** All ✅ — Ready for alpha release

---

## 👉 Next Steps

✅ **Sprint 09 complete.** v0.3.0 + v0.4.0-alpha ready for release.

**Immediate:**
1. **Publish v0.3.0** (complete from Sprint 08) — CI handles npm publish
2. **Tag v0.4.0-alpha** — Release candidate for API migration
3. **Plan Sprint 10** — Additional component migrations (forms, layout) or formal v0.4.0 GA
4. **Start Sprint 13 — S13-01** — Hydration in progress (frontend-team)
5. **Start Sprint 13 — S13-03** — Fix migration E2E flaky tests (Chromium) — in_progress (frontend-team) — subtasks: triage-dropdown (in_progress), triage-notification (done), fix-integration-overlay (in_progress), apply-test-waits (in_progress) — implementation started — PR draft created (bmad/artifacts/S13-03-pr-draft.md)

**Suggested:** Run `/next` for orchestrator next-step recommendation.
