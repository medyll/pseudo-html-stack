# PRD — pseudo-html-kit · pseudo-kit-assets

> **Status:** ✅ Draft v1.0  
> **Author:** PM Agent (BMAD)  
> **Date:** 2026-03-01  
> **Phase:** Planning

---

## Overview

`pseudo-html-kit` is a zero-dependency, no-build vanilla JS component runtime.  
This PRD covers the **next major milestone**: delivering `pseudo-kit-assets` — a **separate npm package** providing ≥ 50 pre-built components and ≥ 20 page-frame skeletons, plus 3 complete responsive demo apps (Netflix-style, Amazon-style, Facebook-style) built exclusively with the kit.

The goal is to prove the kit can power full professional UIs at scale, and give developers a ready-to-use asset library that eliminates cold-start friction.

---

## Goals & Success Metrics

| Goal | Metric | Target |
|---|---|---|
| Asset library shipped | Number of components in `pseudo-kit-assets` | ≥ 50 components + ≥ 20 frames |
| Demo apps complete | Responsive demo apps live | 3 (Netflix / Amazon / Facebook) |
| Zero-dep integrity | Runtime dependencies in `pseudo-kit-assets` | 0 |
| Authoring friction | Steps to use a component from the library | ≤ 3 (import → register → use) |
| Responsive coverage | Breakpoints supported | 4 (320 / 768 / 1024 / 1440px) |
| CSS isolation | All component styles use | `@scope` only |

---

## User Personas

### Persona 1 — Vanilla JS Developer
- **Role:** Frontend dev working without a framework
- **Needs:** Pre-built components he can drop in, customize, and ship
- **Pain points:** Starts from scratch every project; no component ecosystem for vanilla JS

### Persona 2 — UI Prototyper
- **Role:** Dev or designer who needs to demo a full app fast
- **Needs:** Page-level frame skeletons composable into a Netflix / Amazon / Facebook-like layout
- **Pain points:** Building full-page layouts from atoms takes too long

### Persona 3 — Fullstack / SSR Dev
- **Role:** Node.js developer using `pseudo-kit-server` to render layouts
- **Needs:** Components that work both client-side and server-rendered (SSR)
- **Pain points:** Can't share components between server and client without a framework

---

## Use Cases

### UC-01 — Use a pre-built component
**Actor:** Vanilla JS Developer  
**Trigger:** Developer wants a card component for a product listing  
**Flow:**
1. Install `pseudo-kit-assets`
2. Import and register `card.html`
3. Use `<card>` in a pseudo-HTML layout
4. Kit renders it in-browser with `@scope`-isolated CSS  
**Expected outcome:** Styled, responsive card rendered with no extra config  
**Edge cases:** Component file missing → graceful error; SSR + client hydration must match

### UC-02 — Assemble a full page from frames
**Actor:** UI Prototyper  
**Trigger:** Prototyper wants a Netflix-style home page layout  
**Flow:**
1. Register `frame-netflix-home.html`
2. Use the frame tag in a pseudo-HTML document
3. Frame composes hero-banner, content-row, and thumbnail components internally
4. Render in browser — fully responsive  
**Expected outcome:** Full Netflix-style layout from one tag, no manual assembly  
**Edge cases:** Frame does NOT auto-register its children → developer must register them explicitly

### UC-03 — SSR render a component list
**Actor:** Fullstack / SSR Dev  
**Trigger:** Node.js route needs to render a product grid server-side  
**Flow:**
1. Register components via `pseudo-kit-server`
2. Call `renderComponent('product-grid', props, children)`
3. Server returns HTML string with inline `@scope` styles  
**Expected outcome:** Valid HTML output, hydrate-ready in browser  
**Edge cases:** Component file path mismatch → descriptive error with path hint

### UC-04 — Build and ship a demo app
**Actor:** Vanilla JS Developer / Prototyper  
**Trigger:** Developer needs a convincing demo for a client (Netflix-style)  
**Flow:**
1. Clone / install `pseudo-kit-assets`
2. Open `demos/netflix/index.html` in browser — no build step
3. App is fully responsive at 320 / 768 / 1024 / 1440px  
**Expected outcome:** Professional-looking app demo, zero build, opens in browser  
**Edge cases:** Assets must work from `file://` and local dev server

### UC-05 — Author a custom component with permissive workflow
**Actor:** Vanilla JS Developer  
**Trigger:** Developer wants to add a custom component to the kit  
**Flow:**
1. Create `my-component.html` with `<template>`, `<style>`, optional `<script>`
2. Register it alongside `pseudo-kit-assets` components — no special tooling
3. Use it in any layout alongside stock components  
**Expected outcome:** Custom + stock components coexist transparently  
**Edge cases:** No naming convention enforced; any valid filename accepted

---

## Functional Requirements

### pseudo-kit-assets package

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-01 | Package published as separate npm `pseudo-kit-assets` | Must | Independent versioning |
| FR-02 | ≥ 50 component files (`*.html` — no prefix) | Must | See component list below |
| FR-03 | ≥ 20 frame files (`frame-*.html`) | Must | See frame list below |
| FR-04 | Each component = `<template>` + `<style>` using `@scope` | Must | No inline styles |
| FR-05 | Frames do NOT auto-register child components | Must | Explicit registration only |
| FR-06 | All assets work client-side (browser) AND server-side (SSR) | Must | |
| FR-07 | CSS uses `@scope` for all style isolation | Must | No BEM, no CSS-in-JS |
| FR-08 | Responsive at 4 breakpoints: 320 / 768 / 1024 / 1440px | Must | Mobile-first |
| FR-09 | Zero npm runtime dependencies | Must | devDeps allowed for demos only |
| FR-10 | Barrel export: `import { card, navbar } from 'pseudo-kit-assets'` | Should | Convenience API |
| FR-11 | Each component has a JSDoc-annotated props list | Should | For IDE hinting |
| FR-12 | Component file naming: plain `{name}.html` (no pk- prefix) | Must | Decision confirmed |

### pseudo-canvas-viewer

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-30 | `pseudo-canvas-viewer.html` — browser page, no build step | Must | Opens from `file://` |
| FR-31 | Parses and renders any `pseudo-canvas-demo.html` descriptor | Must | Reads component-registry + body |
| FR-32 | Figma-style panel: component list (left) + canvas preview (center) + props panel (right) | Must | |
| FR-33 | Each component rendered live with its default / named slots visible | Must | |
| FR-34 | Displays component props, slots, data shape, events for each asset | Should | |
| FR-35 | URL param `?canvas=path/to/file.html` to load any descriptor | Should | |
| FR-36 | Responsive viewer (usable at 1024px+) | Could | |

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-20 | `demos/netflix/` — streaming app layout | Must | Hero, rows, thumbnail, modal |
| FR-21 | `demos/amazon/` — e-commerce layout | Must | Nav, product grid, detail, cart |
| FR-22 | `demos/facebook/` — social feed layout | Must | Topbar, feed, stories, profile |
| FR-23 | All demos open from `index.html` — no build step | Must | |
| FR-24 | All demos responsive at all 4 breakpoints | Must | |
| FR-25 | Demos use ONLY `pseudo-html-kit` + `pseudo-kit-assets` | Must | No external libs |

---

## Component Catalogue (≥ 50)

### Atoms (base components)
`avatar`, `badge`, `button`, `chip`, `divider`, `icon`, `image`, `input`, `label`,  
`loader`, `progress-bar`, `rating`, `skeleton`, `spinner`, `tag`, `textarea`, `toggle`

### Molecules (composed)
`breadcrumb`, `card`, `card-media`, `dropdown`, `form-field`, `list-item`,  
`menu-item`, `modal`, `notification`, `pagination`, `price-tag`, `product-tile`,  
`search-bar`, `tab-bar`, `tooltip`, `user-info`

### Organisms (complex)
`cart-summary`, `comment-thread`, `content-row`, `feed-post`, `footer`,  
`hero-banner`, `navbar`, `product-detail`, `profile-card`, `sidebar`,  
`story-ring`, `thumbnail-grid`, `topbar`

### Frames (page skeletons)
`frame-netflix-home`, `frame-netflix-detail`, `frame-amazon-home`,  
`frame-amazon-product`, `frame-amazon-cart`, `frame-facebook-feed`,  
`frame-facebook-profile`, `frame-dashboard`, `frame-landing`,  
`frame-login`, `frame-signup`, `frame-settings`, `frame-404`,  
`frame-blog-home`, `frame-blog-post`, `frame-pricing`, `frame-portfolio`,  
`frame-admin`, `frame-chat`, `frame-search-results`

---

## Non-Functional Requirements

| Category | Requirement | Acceptance Criteria |
|---|---|---|
| Performance | Components render with no layout shift | CLS = 0 on demo pages |
| CSS isolation | No style leakage between components | `@scope` on every `<style>` block |
| Compatibility | Works in all modern browsers | Chrome / Firefox / Safari / Edge (latest 2 versions) |
| Accessibility | Semantic HTML in all components | No `<div>` where a semantic element applies |
| File size | Each component file | ≤ 10 KB uncompressed |
| Portability | Demos run from `file://` protocol | No server required to view demos |

---

## Out of Scope

- Framework adapters (React, Vue, Svelte, Angular)
- Backend, API, database
- Authentication or real data
- Build tooling, bundlers, transpilers
- i18n / theming engine
- Accessibility audit (Phase 2+)
- Unit tests for each individual component (Phase 2+)

---

## Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `pseudo-html-kit` | Peer dependency | Consumer must install separately |
| Node.js ≥ 22 | Dev / SSR runtime | ESM only |

---

## Open Questions

- [x] ~~Auto-generate component index page (visual storybook-like)?~~ → **Yes — Figma-style `pseudo-canvas-viewer`, renders `pseudo-canvas-demo.html`**
- [x] ~~Slot conventions in assets: only default slot, or named slots too?~~ → **Both: default + named slots**
- [x] ~~Should frames ship with placeholder/lorem content, or be truly empty skeletons?~~ → **Empty skeletons only**

---

## Revision History

| Date | Author | Change |
|---|---|---|
| 2026-03-01 | PM Agent (BMAD) | Initial draft from product brief |
