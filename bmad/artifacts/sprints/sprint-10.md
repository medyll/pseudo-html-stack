# Sprint 10 — v0.4.0 Beta: Additional Component Migrations & Formal GA Prep

**Status:** Draft  
**Duration:** 2026-03-13 → 2026-03-27 (2 semaines)  
**Capacity:** 1 dev, ~8 dev-days  

---

## Sprint Goal

Expand v0.4.0 component migrations to form controls and layout primitives, then finalize v0.4.0 for formal GA release. Complete Phase 2 of the API migration roadmap with browser support parity and extended test coverage.

---

## Candidate Stories (Priority Order)

### Phase 2A: Form Controls (3–4 stories, ~18 pts)

| ID | Title | Estimate | Dependencies | Notes |
|:---|:------|:--------:|:------------:|:------|
| S10-01 | **Input:** Popover validation + constraint validation | 5 | — | Use HTML5 constraint validation API, hide JS logic |
| S10-02 | **Select:** Listbox + Combobox (new Listbox API) | 5 | S10-01 | Keyboard nav, ARIA, fallback JS |
| S10-03 | **Checkbox/Radio:** `:checked/:invalid` + `element.indeterminate` | 3 | — | Pure CSS visual updates |
| S10-04 | **Textarea:** Anchor Positioning for auto-resize hints | 3 | S10-01 | Layout hints via anchor, no JS height calc |

### Phase 2B: Layout Primitives (2 stories, ~8 pts)

| ID | Title | Estimate | Dependencies | Notes |
|:---|:------|:--------:|:------------:|:------|
| S10-05 | **Grid:** CSS Grid Lanes (Container Queries for masonry) | 5 | — | 2026 feature, progressive enhancement |
| S10-06 | **Accordion:** CSS `@supports` + View Transitions API | 3 | — | Smooth collapse/expand, no JS toggle logic |

### Phase 3: Testing & GA (2 stories, ~7 pts)

| ID | Title | Estimate | Dependencies | Notes |
|:---|:------|:--------:|:------------:|:------|
| S10-07 | **E2E + Unit Tests** (form/layout components) | 4 | S10-01..06 | Playwright + vitest, 100% coverage |
| S10-08 | **v0.4.0 GA Release** (finalize, tag, publish) | 3 | S10-07 | Release notes, GitHub release, npm publish via CI |

---

## Recommended Scope for Sprint 10

**Target: 4 stories, ~16 pts (achievable in 8 dev-days)**

**Tier 1 (High Value):**
- **S10-01:** Input validation (5 pts) — widely used, high impact
- **S10-03:** Checkbox/Radio (3 pts) — quick win, CSS-only
- **S10-05:** Grid Lanes (5 pts) — showcase cutting-edge 2026 CSS

**Tier 2 (Optional, if capacity allows):**
- **S10-07:** Testing (4 pts) — pairs with tier-1 stories

**Defer to Sprint 11:**
- S10-02 (Select, complex)
- S10-04 (Textarea, specialized)
- S10-06 (Accordion, View Transitions learning curve)
- S10-08 (GA release → follow up after stable)

---

## Execution Plan

### Week 1: Core Component Migrations

```
Parallel:
├── S10-01: Input validation (5 pts)
├── S10-03: Checkbox/Radio (3 pts)
└── S10-05: Grid Lanes (5 pts)
```

**Daily standup focus:**
- Day 1–2: S10-01 & S10-03 API exploration + HTML spec review
- Day 3–4: Implementation + unit test setup
- Day 5: Code review + refinement

### Week 2: Testing & Release Prep

```
Sequential:
├── S10-07: E2E + unit tests for S10-01/03/05 (4 pts)
└── Release prep (documentation, CHANGELOG)
```

---

## Definition of Done (Sprint-Level)

- [ ] S10-01: Input constraint validation native path tested, fallback JS works
- [ ] S10-03: Checkbox indeterminate state working, visual parity with old JS
- [ ] S10-05: Grid Lanes rendering with Container Queries, fallback flexbox
- [ ] S10-07: 15+ new E2E tests, 100% unit coverage on new components
- [ ] No regressions: all 51 existing tests pass
- [ ] CHANGELOG draft ready for S10-08
- [ ] Release notes drafted

---

## Known Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| HTML5 constraint validation API browser support | Input tests need feature detection | Use `Intl.Segmenter` polyfill fallback |
| Listbox/Combobox spec still evolving | S10-02 may need revision mid-sprint | Defer S10-02 to Sprint 11 |
| Grid Lanes not in Safari 18 yet | Safari users see flexbox fallback | Plan `@supports (display: grid-lanes)` path |
| Container Queries limited in Firefox | Accordion may need JS fallback | Progressive enhancement via `:has()` |

---

## Traces & Dependencies

**Links to v0.4.0 Planning:**
- Parent PRD: `bmad/artifacts/prd-phase1-migration.md` (scope + goals)
- Tech Spec: `bmad/artifacts/tech-spec-phase1-migration.md` (component details)
- Sprint 09 baseline: `bmad/artifacts/sprints/sprint-09.md` (4 components done)

**Depends on:**
- Sprint 09 complete (✅ modal, dropdown, tooltip, notification)
- Unit test mocks finalized (vitest + happy-dom)
- Playwright E2E fixture architecture stable

---

## Deliverables

**Artifacts:**
- `src/pseudo-assets/components/atoms/input-pk.html` (updated with validation)
- `src/pseudo-assets/components/atoms/checkbox-pk.html` (updated)
- `src/pseudo-assets/components/molecules/grid-pk.html` (new with Grid Lanes)
- `tests/migration-e2e-forms.e2e.js` (new E2E test suite)
- `CHANGELOG-v0.4.0-beta.md` (release notes)

**Quality Gates:**
- Unit tests: 65+/65+ (added 15+)
- E2E tests: 20+ (new form/layout tests)
- Coverage: 100% on `src/client/**`
- A11y: 0 regressions

---

## Next Phase (Sprint 11+)

**Remaining v0.4.0 Components:**
- S10-02: Select/Combobox (5 pts)
- S10-04: Textarea auto-resize (3 pts)
- S10-06: Accordion with View Transitions (3 pts)
- S10-08: v0.4.0 GA formal release

**Post v0.4.0:**
- Data-intensive components (table, data grid)
- Form state management (form builder)
- Advanced animations (shared layout transitions)

---

## Decision: Sprint 10 Scope Confirmation

**Recommendation:** Start with S10-01 + S10-03 + S10-05 (16 pts target).

**Questions for PM:**
1. **Priority:** Which form control is most requested? (Input validation assumed high)
2. **Timeline:** Can we defer S10-08 (GA release) to Sprint 11 for stability?
3. **Test depth:** Full Playwright E2E or smoke tests only for new components?

**Next step:** `/bmad sprint S10` to formalize and create story files.
