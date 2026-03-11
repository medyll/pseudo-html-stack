# Sprint 15 — Component Gap + CSS if() Pass (v0.5.1)

**Duration:** 2026-03-25 → 2026-04-07
**Capacity:** 18 story points

## Sprint Goal
Fill the remaining component gaps (slider, breadcrumb), complete the CSS `if()` audit pass deferred from the roadmap, and ship v0.5.1.

## Stories

| ID | Epic | Title | Points | Priority | Assignee |
|---|---|---|---|---|---|
| S15-01 | Components | `slider-pk` atom — native `<input type="range">` + custom CSS | 3 | Must | frontend-team |
| S15-02 | Components | `breadcrumb-pk` molecule — nav landmark + ARIA breadcrumb | 3 | Must | frontend-team |
| S15-03 | CSS | CSS `if()` pass — replace JS-computed conditional classes where native `if()` applies | 5 | Should | frontend-team |
| S15-04 | QA | Unit tests for S15-01 + S15-02; E2E smoke for slider and breadcrumb | 3 | Must | qa-team |
| S15-05 | Release | v0.5.1 release — changelog, release notes, version bump | 2 | Must | developer |

**Total:** 16 points

## Dependencies
- S15-03 depends on S15-01 + S15-02 (audit after new components added)
- S15-04 is part of S15-01 + S15-02 execution
- S15-05 depends on S15-01–S15-04 done

## Definition of Done (sprint-level)
- [ ] S15-01: slider-pk component + unit tests passing
- [ ] S15-02: breadcrumb-pk component + unit tests passing
- [ ] S15-03: CSS if() audit complete — at least 3 components updated
- [ ] S15-04: all tests green (target: 620+ passing)
- [ ] S15-05: v0.5.1 released, CHANGELOG updated

## Risks
- CSS `if()` is a cutting-edge spec — `@supports` guards needed; happy-dom may not support it (test guards required)
- `<input type="range">` styling is browser-inconsistent — use CSS custom properties pattern as with progress-pk

*Created by bmad-master next --auto: 2026-03-11.*
