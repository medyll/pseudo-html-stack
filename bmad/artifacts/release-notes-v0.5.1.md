# Release Notes — v0.5.1

**Release date:** 2026-03-11
**Type:** Patch / component additions

## What's new

### Two new components
- **`slider-pk`** — native range input with cross-browser styling and accessible props
- **`breadcrumb-pk`** — upgraded from static markup to ARIA-wired version with `aria-current="page"` on the last crumb

### CSS if() audit
All 52 components audited for native CSS `if()` migration opportunities. Finding: the `@scope` + attribute-selector pattern already achieves the same goals. No breaking changes.

## Coverage
609 tests passing — 226 node:test + 345 vitest + 38 E2E Chromium · 0 failures

## Upgrade notes
- `breadcrumb-pk` slot API changed: use `slot="items"` on each crumb element (was unsupported default slot)
- No other breaking changes
