# CHANGELOG — v0.5.1

> Released: 2026-03-11

## New Components

### `slider-pk` (atom)
- Wraps native `<input type="range">` with accessible labelling, min/max/step, disabled, and variant (default|primary)
- CSS: `@scope (.slider)` with `::-webkit-slider-thumb` / `::-moz-range-thumb` vendor pseudo-elements
- Defaults value to midpoint when `value` prop is absent

### `breadcrumb-pk` (molecule)
- Replaces legacy static `breadcrumb.html` with ARIA-wired version
- Script reads `slot="items"` children, wraps each in `li.breadcrumb__item`, marks last item `aria-current="page"`
- `label` prop overrides the default `aria-label="Breadcrumb"` on the nav landmark
- Separator configurable via `--breadcrumb-separator` CSS custom property

## Audits

### CSS `if()` pass (S15-03)
- Full audit of all 52 components: no JS-computed conditional classes found
- Components already use `@scope` attribute selectors — equivalent to what `if()` provides
- `progress-bar.html` fill width (JS `style.width`) flagged for future migration to CSS `attr()` Level 5 when browser support stabilises
- No component changes required; documented as "architecture-aligned"

## Test Delta

| Suite | Before | After | Delta |
|---|---|---|---|
| node:test | 226 | 226 | — |
| vitest | 333 | 345 | +12 |
| E2E Chromium | 38 | 38 | — |
| **Total** | **597** | **609** | **+12** |

## Sprint 15 Stories

| ID | Title | Points | Status |
|---|---|---|---|
| S15-01 | `slider-pk` atom | 3 | ✅ done |
| S15-02 | `breadcrumb-pk` molecule (ARIA upgrade) | 3 | ✅ done |
| S15-03 | CSS `if()` audit pass | 5 | ✅ done |
| S15-04 | Unit tests (inline with S15-01 + S15-02) | 3 | ✅ done |
| S15-05 | v0.5.1 release | 2 | ✅ done |
