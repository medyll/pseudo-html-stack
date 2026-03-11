# Story S13-05 — Theme & Skin System (CSS3/HTML5 native)

**Epic:** Design System
**Sprint:** Sprint 13
**Points:** 5
**Priority:** Should

## User Story

As a **developer using pseudo-assets**, I want a **native CSS theme + skin system**, so that I can **apply any brand palette to the component library without touching component code**.

## Context

During Sprint 13 session (2026-03-10), the full theme/skin architecture was designed and implemented:
- `src/pseudo-assets/theme/theme.css` — structural tokens, default palette (light/dark), reset
- `src/pseudo-assets/theme/utils.css` — CSS `@function` mixins (alpha, elevation, focus-ring, transition, brand-gradient)
- `src/pseudo-assets/skins/netflix.css` — Netflix brand skin
- `src/pseudo-assets/skins/amazon.css` — Amazon brand skin
- `src/pseudo-assets/skins/facebook.css` — Facebook brand skin

The system uses `@layer`, `@scope`, `light-dark()`, relative color syntax, and `@function` — no preprocessor, no build step.

## Acceptance Criteria

```gherkin
Given a page loading theme/theme.css only
When no data-skin attribute is set
Then light/dark palette switches automatically via OS preference

Given a page loading theme/theme.css + skins/netflix.css
When <html data-skin="netflix"> is set
Then all --color-* tokens reflect the Netflix palette

Given the skin layer
When a skin file is loaded
Then @layer skin overrides @layer theme.palette without !important

Given the alpha() mixin
When used as alpha(var(--color-primary), 0.15)
Then it returns a valid color with the correct opacity via relative color syntax

Given a component using var(--color-primary-hover)
When the skin overrides --color-primary
Then --color-primary-hover recalculates automatically (relative color syntax)
```

## Technical Notes

- `@layer` order declared in `theme.css`: `theme.reset → theme.tokens → theme.palette → skin`
- Skins use `@layer skin { @scope([data-skin="x"]) { } }` for scoped, layered overrides
- `utils.css` must be loaded after `theme.css` — `@function` depend on `--alpha-*` and `--shadow-*` tokens
- `alpha()` uses `hsl(from $color h s l / $opacity)` — works on any color format
- Skins override: colors, font-family, radii, layout (--page-x, --page-max), shadows
- Skins do NOT override: spacing, z-index, animation durations/easings, text scale

## Files Delivered

```
src/pseudo-assets/theme/theme.css    ← tokens + palette + reset + @layer declarations
src/pseudo-assets/theme/utils.css    ← @function mixins
src/pseudo-assets/skins/netflix.css
src/pseudo-assets/skins/amazon.css
src/pseudo-assets/skins/facebook.css
```

## Out of Scope

- Skin switcher UI / JS runtime loader
- Additional skins beyond the 3 existing demos
- Integration with existing demo `tokens.css` files (migration is a separate story)

## Dependencies

- None — standalone addition to pseudo-assets

## Definition of Done

- [x] `theme/theme.css` created with `@layer` declarations
- [x] `theme/utils.css` created with all 5 `@function` mixins
- [x] `skins/netflix.css` created with `@layer skin`
- [x] `skins/amazon.css` created with `@layer skin`
- [x] `skins/facebook.css` created with `@layer skin`
- [ ] `status.yaml` updated
- [ ] `dashboard.md` updated
- [ ] Existing demo `tokens.css` files reviewed for migration path (optional)
