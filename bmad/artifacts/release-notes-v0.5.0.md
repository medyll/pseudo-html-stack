# Release Notes — pseudo-stack v0.5.0

> 2026-03-11 | pseudo-html-kit

---

## What's new

### Native CSS theme system

v0.5.0 ships a zero-dependency, no-build theme engine powered entirely by CSS cascade layers and native `@function` mixins.

**`src/pseudo-assets/theme/theme.css`** — add it once, get:
- Full CSS reset
- Design tokens (spacing, typography, z-index, animation, radii)
- Automatic light/dark palette via `light-dark()`
- Semantic colour tokens ready to override

**`src/pseudo-assets/theme/utils.css`** — native CSS functions:
- `alpha()`, `elevation()`, `focus-ring()`, `transition()`, `brand-gradient()`

**Brand skins** (`src/pseudo-assets/skins/`) — Netflix, Amazon, Facebook
- Activate with `data-skin="netflix"` — scoped via `@layer skin { @scope }`, zero global leakage

### SSR hydration handshake

Components rendered server-side via `PseudoKitServer.renderComponent()` now receive `data-pk-hydrated="true"`. The client detects this marker and skips re-stamping, preventing double-rendering and slot content loss.

State round-trips cleanly: `serializeState()` → `<script id="pk-state">` → `deserializeFromTag()` on client load.

### Three new components

| Component | Layer | API highlight |
|---|---|---|
| `<carousel-pk>` | organism | CSS Scroll Snap, keyboard nav, `aria-live` |
| `<date-picker-pk>` | atom | native `<input type="date">` + Popover fallback |
| `<color-swatch-pk>` | molecule | `role="radiogroup"`, keyboard navigation |

### Interaction components — native API migration complete

All four interaction components now use 2026-era browser APIs:
- **Modal**: `<dialog>` + Invoker Commands
- **Dropdown**: Popover API + `popovertarget`
- **Tooltip**: CSS Anchor Positioning
- **Notification**: CSS `animationend` + `prefers-reduced-motion`

---

## Bug fixes

- **Dropdown never opened in Playwright Chromium E2E**: `element.popovertarget = id` sets the IDL property but doesn't reflect to the HTML content attribute. Fixed with `element.setAttribute('popovertarget', id)`.
- **Notification hover-pause test flaky**: autodismiss `setTimeout` fallback multiplier raised from 1× to 3× — prevents early firing during animation pauses.

---

## Test suite: 564 passing (+132 since v0.4.0)

- 226 node:test (server + shared + new hydration edge cases)
- 320 vitest (client components)
- 18 Playwright E2E (Chromium — Modal, Dropdown, Tooltip, Notification, Integration)

---

## No breaking changes

All public exports (`./client`, `./server`, `./validator`, `./normalizer`, `./shared`) are backwards compatible. No migration required.

---

_Full changelog: `CHANGELOG-v0.5.0.md`_
