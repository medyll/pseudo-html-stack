# Sprint 14 — Select/Listbox API + E2E Coverage (v0.5.1)

**Duration:** 2026-03-11 → 2026-03-24
**Capacity:** 18 story points

## Sprint Goal
Complete the Select/Listbox API migration (combobox + select) with full E2E coverage, and lay groundwork for the next component wave.

## Stories

| ID | Epic | Title | Points | Priority | Assignee |
|---|---|---|---|---|---|
| S14-01 | Listbox Migration | Select/Listbox E2E + final migration polish | 5 | Must | frontend-team |
| S14-02 | DX | README update — v0.5.0 theme/skin system docs | 3 | Must | developer |
| S14-03 | Components | `tabs-pk` organism — CSS Scroll Snap + ARIA tabs | 5 | Should | frontend-team |
| S14-04 | Components | `progress-pk` atom — native `<progress>` + custom styling | 3 | Could | frontend-team |
| S14-05 | QA | E2E: extend migration-e2e for form components (select, combobox) | 2 | Must | qa-team |

**Total:** 18 points

## Dependencies
- S14-01 depends on combobox-pk and select-pk (already implemented — sprint 13)
- S14-05 is part of S14-01 execution

## Definition of Done (sprint-level)
- [ ] S14-01: combobox + select E2E passing on Chromium
- [ ] S14-02: README covers theme.css / utils.css / skins usage
- [ ] All Must stories completed and reviewed
- [ ] 564+ tests passing, 0 failures

## Risks
- `::picker(select)` CSS API still experimental — test guards needed (`@supports`)
- combobox Popover API may behave differently across JSDOM vs real browser — keep unit tests JSDOM-safe
