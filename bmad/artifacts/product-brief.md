# Product Brief — pseudo-html-kit

> **Status:** ✅ Done  
> **Owner:** Mydde  
> **Phase:** Analysis — 2026-03-01

---

## Problem Statement

Developers who work in **vanilla JS** (no framework, no build step) lack a structured, ready-to-use kit to rapidly build and demonstrate professional-grade, responsive UIs at the scale of Netflix, Amazon, or Facebook.  
Current pseudo-html-kit has a strong rendering engine (SSR + client) but **no pre-built asset library** — every project starts from zero components.

---

## Target Users

| Persona | Profile |
|---|---|
| **Vanilla JS Developer** | Builds UIs without frameworks; values zero-dependency, readable code |
| **UI Prototyper** | Needs to demo full apps fast without writing boilerplate |
| **Fullstack / SSR Dev** | Uses Node.js + pseudo-html-kit server to render layout descriptors |

---

## Expected Outcome

1. **`pseudo-kit-assets`** — A companion package (or built-in module) providing:
   - ≥ 50 **components** (`pseudo-kit-assets.component`) — ready-to-use UI atoms/molecules (card, navbar, modal, hero, sidebar, badge, avatar, rating, price-tag, etc.)
   - ≥ 20 **frames** (`pseudo-kit-assets.frame`) — full-page layout skeletons (netflix-home, amazon-product, facebook-feed, dashboard, landing, etc.)
2. **Demo apps** — At least 3 complete responsive demo apps (Netflix-style, Amazon-style, Facebook-style) built exclusively from the kit.
3. **Flexible workflow** — A permissive, low-friction authoring model where any `.html` file can become a component or frame with minimal conventions.

---

## Scope

| In Scope | Out of Scope |
|---|---|
| 50+ default components (`pseudo-kit-assets.component`) | Framework adapters (React, Vue, Svelte) |
| 20+ frame skeletons (`pseudo-kit-assets.frame`) | Backend / API / database |
| 3 responsive demo apps (Netflix, Amazon, Facebook) | Authentication / real data |
| Responsive design (mobile-first, CSS only) | Build tooling, bundlers |
| Permissive component authoring workflow | Accessibility audit (Phase 2+) |
| CSS `@layer` + `@scope` architecture | i18n / theming engine |

---

## Key Concepts

### `pseudo-kit-assets.component`
A pre-built `.html` component file (template + style + optional script) registered into the kit.  
Examples: `card`, `navbar`, `hero-banner`, `product-tile`, `sidebar`, `modal`, `avatar`, `badge`, `rating`, `price-tag`, `tab-bar`, `chip`, `skeleton-loader`…

### `pseudo-kit-assets.frame`
A full-page or section-level layout skeleton that composes multiple components into a recognizable UI pattern.  
Examples: `frame-netflix-home`, `frame-amazon-product`, `frame-facebook-feed`, `frame-dashboard`, `frame-landing`, `frame-login`…

---

## Constraints

- **Zero dependencies** — vanilla JS only, no npm runtime deps
- **No build step** — works as plain `.html` + `.js` ESM files
- **Node.js ≥ 22** — ESM throughout
- **CSS only** for layout/animation (no JS animation libs)
- **Backward-compatible** with the existing `pseudo-html-kit` API

---

## Stakeholders

| Name / Role | Involvement |
|---|---|
| Mydde (Lead Dev) | Owner, implementation, vision |
| Developers (users) | Feedback, adoption |

---

## Open Questions

- Should `pseudo-kit-assets` live as a **separate npm package** or as a sub-folder in this repo?
- What naming convention for component files? (`card.html`, `pk-card.html`, `assets/card.html`?)
- Should frames auto-register their child components, or require explicit imports?
- CSS strategy for demo apps: single stylesheet per frame, or shared token file?
- Minimum breakpoints for "responsive" (mobile / tablet / desktop)?
