# Changelog — v0.5.0

> Release date: 2026-03-11

---

## New Features

### Theme & Skin System (`src/pseudo-assets/theme/`)
- **`theme.css`** — CSS cascade-layer token system: `@layer theme.reset, theme.tokens, theme.palette, skin`
  - Full CSS reset with `box-sizing`, `margin`, `font-inherit`
  - Design tokens: spacing scale, typography scale, z-index scale, animation durations, border radii, alpha values
  - Default palette using `light-dark()` for automatic light/dark mode support
  - Shadows, surfaces, and semantic colour tokens (`--color-primary`, `--color-success`, etc.)
  - Scrollbar styling
- **`utils.css`** — Native CSS `@function` mixins (no preprocessor):
  - `alpha($color, $opacity)` — transparency via relative colour syntax
  - `elevation($level)` — shadow system (levels 0–4)
  - `focus-ring($color)` — accessible focus outline helper
  - `transition($props)` — consistent duration/easing shorthand
  - `brand-gradient($dir)` — primary colour gradient
- **`skins/netflix.css`**, **`skins/amazon.css`**, **`skins/facebook.css`** — brand skin overrides
  - Isolated via `@layer skin { @scope([data-skin="..."]) }` — no global side effects
  - Apply with `data-skin="netflix"` on any ancestor element

### New Components
- **`carousel-pk`** (organism) — CSS Scroll Snap + keyboard navigation, ARIA pagination, `aria-live`
- **`date-picker-pk`** (atom) — native `<input type="date">` enhancement with Popover API fallback
- **`color-swatch-pk`** (molecule) — accessible colour swatch picker with keyboard navigation

### SSR Hydration
- Server-rendered components now receive `data-pk-hydrated="true"` automatically
- Client detects marker and skips re-stamping (avoids double-rendering)
- Fallback: legacy `<pk-slot>` child detection for older server output
- State serialization/deserialization via `<script id="pk-state" type="application/json">` — fully round-trips through SSR→CSR

---

## Improvements

### Interaction Components (Sprint 9 — migration to native APIs)
- **`dropdown-pk`** — Popover API (`popover="auto"` + `popovertarget`); falls back to CSS toggle
  - Fix: use `setAttribute('popovertarget', uid)` — IDL property doesn't reflect to HTML attribute in some browsers
  - `data-state="open|closed"` and `data-ready="true"` for deterministic test hooks
- **`notification-pk`** — autodismiss via CSS `animationend` + 3× setTimeout fallback for headless environments
  - Hover/focus-within pauses animation; `prefers-reduced-motion` respected
- **`modal-pk`** — `<dialog>` + Invoker Commands API; focus trap; Escape key; backdrop click
- **`tooltip-pk`** — CSS Anchor Positioning; position auto-flip at viewport edges

### Accessibility
- `carousel-pk`: `aria-roledescription`, `aria-live="polite"`, keyboard prev/next
- `color-swatch-pk`: `role="radiogroup"`, keyboard navigation, focus management
- `combobox-pk`: `aria-activedescendant`, option IDs for Listbox API compatibility

### CSS Architecture
- All component `<style>` blocks use `@scope` for zero-leak encapsulation
- `adoptedStyleSheets` with `CSSStyleSheet()` for performant style injection
- Fallback to `<style>` tag injection when `adoptedStyleSheets` not supported

---

## Bug Fixes

| ID | Description | Fix |
|---|---|---|
| E2E-FLAKY-01 | Chromium: dropdown never opened in E2E tests | `trigger.setAttribute('popovertarget', uid)` — IDL `.popovertarget` doesn't reflect to HTML content attribute in Playwright Chromium |
| NOTIF-01 | Notification autodismiss `setTimeout` fallback fired during hover-pause test | Changed fallback multiplier from 1× to 3× duration — makes it a true last-resort |
| INT-01 | Integration test: simultaneous modal+dropdown open assertion failed | `popover="auto"` correctly light-dismisses on outside click; test redesigned to verify independent operation |

---

## Tests

| Suite | v0.4.0 | v0.5.0 | Delta |
|---|---|---|---|
| node:test | 211 | 226 | +15 |
| vitest | 221 | 320 | +99 |
| E2E Chromium | — | 18 | +18 |
| **Total** | **432** | **564** | **+132** |

New test coverage:
- Server hydration: 12 tests (slot injection, nested SSR, props escaping, script stripping, loop preservation)
- Client hydration: pk-state deserialization
- Carousel, date-picker, color-swatch unit tests
- E2E: 18 scenarios across Modal, Dropdown, Tooltip, Notification, Integration

---

## Breaking Changes

None. All public API surfaces remain backwards compatible.

---

## Migration Guide

No action required for existing users. Optional additions:

1. **Theme system** — add `<link rel="stylesheet" href="theme.css">` to use the token layer
2. **Skins** — add `<link rel="stylesheet" href="skins/netflix.css">` + set `data-skin="netflix"` on a container
3. **SSR hydration** — if using `PseudoKitServer.renderComponent()`, no changes needed — `data-pk-hydrated` is added automatically

---

## Files Changed (summary)

```
src/pseudo-assets/theme/theme.css        (new)
src/pseudo-assets/theme/utils.css        (new)
src/pseudo-assets/skins/netflix.css      (new)
src/pseudo-assets/skins/amazon.css       (new)
src/pseudo-assets/skins/facebook.css     (new)
src/pseudo-assets/components/organisms/carousel-pk.html  (new)
src/pseudo-assets/components/atoms/date-picker-pk.html   (new)
src/pseudo-assets/components/molecules/color-swatch-pk.html (new)
src/pseudo-assets/components/molecules/dropdown.html     (fix: setAttribute popovertarget)
src/pseudo-assets/components/molecules/notification.html (fix: 3× fallback timer)
src/client/pseudo-kit-client.js          (_isSSRHydrated, data-pk-hydrated detection)
src/server/pseudo-kit-server.js          (data-pk-hydrated marker on renderComponent)
tests/render-hydration.server.test.js    (12 new hydration tests)
tests/migration-e2e.e2e.js               (deterministic waits, redesigned integration test)
package.json                             (version 0.4.0 → 0.5.0)
```
