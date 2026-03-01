# Tech Spec — pseudo-html-kit · pseudo-kit-assets

> **Status:** ✅ Draft v1.0  
> **Author:** PM Agent (BMAD)  
> **Date:** 2026-03-01  
> **Traces to:** [prd.md](prd.md)

---

## Stack

| Layer | Technology | Justification |
|---|---|---|
| Runtime (client) | Vanilla JS ESM, browser | Zero-dep constraint; FR-09 |
| Runtime (server) | Node.js ≥ 22 ESM | Existing constraint; FR-06 |
| CSS | `@scope` (native CSS) | FR-07; no runtime needed |
| Responsive | CSS media queries, mobile-first | FR-08 |
| Test (server) | `node:test` | Existing toolchain |
| Test (client) | `vitest` + `happy-dom` | Existing toolchain |
| Package manager | pnpm | Existing convention |
| Build | None | FR-23, FR-33 — no build step |

---

## Repository Structure

```
pseudo-html-kit/          ← existing package (unchanged)
pseudo-kit-assets/        ← NEW separate npm package
├── package.json
├── index.js              ← barrel export (FR-10)
├── components/           ← 50+ component .html files
│   ├── atoms/
│   │   ├── avatar.html
│   │   ├── badge.html
│   │   ├── button.html
│   │   └── ...          (17 atoms)
│   ├── molecules/
│   │   ├── card.html
│   │   ├── modal.html
│   │   └── ...          (16 molecules)
│   └── organisms/
│       ├── navbar.html
│       ├── hero-banner.html
│       └── ...          (13 organisms)
├── frames/               ← 20+ frame skeletons
│   ├── frame-netflix-home.html
│   ├── frame-amazon-product.html
│   └── ...
├── demos/                ← 3 demo apps
│   ├── netflix/
│   │   └── index.html
│   ├── amazon/
│   │   └── index.html
│   └── facebook/
│       └── index.html
└── viewer/
    └── pseudo-canvas-viewer.html   ← Figma-style component browser
```

---

## Component File Anatomy

Every `.html` file in `components/` or `frames/` follows this structure:

```html
<!--
  @component card
  @props title:string; subtitle:string?; image:string?; href:string?
  @slots default, actions
  @layer components
-->
<template>
  <article class="card">
    <figure class="card__media">
      <slot name="media"></slot>
    </figure>
    <div class="card__body">
      <slot></slot>         <!-- default slot -->
    </div>
    <footer class="card__footer">
      <slot name="actions"></slot>
    </footer>
  </article>
</template>

<style>
  @scope (.card) {
    :scope { display: flex; flex-direction: column; }
    .card__media { /* ... */ }
    .card__body  { /* ... */ }
    .card__footer { /* ... */ }

    /* Responsive — mobile-first */
    @media (min-width: 768px)  { :scope { /* tablet */ } }
    @media (min-width: 1024px) { :scope { /* desktop */ } }
    @media (min-width: 1440px) { :scope { /* wide */ } }
  }
</style>
```

**Rules:**
- `<template>` — required; contains the component's DOM structure
- `<style>` — required; uses `@scope` for isolation; no global selectors
- `<script>` — optional; only for interactive components
- **No prefix** on filenames (`card.html`, not `pk-card.html`) — FR-12
- Frames: `frame-{name}.html` — empty skeletons, no placeholder content
- Named slots declared with `<slot name="...">`, default slot with `<slot>`
- JSDoc `@props` comment in each file header for IDE hinting — FR-11

---

## Breakpoints (mobile-first)

| Token | Width | Applies to |
|---|---|---|
| `xs` | 320px | Base (no media query needed) |
| `sm` | 768px | `@media (min-width: 768px)` |
| `md` | 1024px | `@media (min-width: 1024px)` |
| `lg` | 1440px | `@media (min-width: 1440px)` |

CSS custom properties for spacing/breakpoints declared at `:root` in a shared `tokens.css` imported once per demo app.

---

## Barrel Export (`index.js`) — FR-10

```js
// pseudo-kit-assets/index.js

// ── URL paths (for register()) ──────────────────────────────────────────────
export const components = {
  avatar:       new URL('./components/atoms/avatar.html',        import.meta.url).href,
  badge:        new URL('./components/atoms/badge.html',         import.meta.url).href,
  button:       new URL('./components/atoms/button.html',        import.meta.url).href,
  // ... all 46 components
};

export const frames = {
  netflixHome:    new URL('./frames/frame-netflix-home.html',    import.meta.url).href,
  amazonProduct:  new URL('./frames/frame-amazon-product.html',  import.meta.url).href,
  // ... all 20 frames
};

// ── Metadata (for viewer, tooling, IDE hinting) ─────────────────────────────
export const componentsMeta = {
  avatar:  { props: 'src:string; alt:string?; size:enum(sm|md|lg)?', slots: 'default', layer: 'atoms' },
  badge:   { props: 'label:string; variant:enum(default|primary|danger)?', slots: '', layer: 'atoms' },
  button:  { props: 'label:string; variant:enum(primary|secondary|ghost)?; disabled:boolean?', slots: 'default', layer: 'atoms' },
  // ...
};

export const framesMeta = {
  netflixHome:   { slots: 'hero, rows', layer: 'frames', description: 'Streaming home layout skeleton' },
  amazonProduct: { slots: 'media, info, actions, reviews', layer: 'frames', description: 'Product detail skeleton' },
  // ...
};
```

Usage:

```js
import { components, frames } from 'pseudo-kit-assets';
import PseudoKitClient from 'pseudo-html-kit';

PseudoKitClient
  .register({ name: 'card',    src: components.card })
  .register({ name: 'navbar',  src: components.navbar });
```

---

## pseudo-canvas-viewer Architecture — FR-30→36

### Concept

A single `viewer/pseudo-canvas-viewer.html` — no server, no build — that:

1. Loads a `pseudo-canvas-demo.html` descriptor (via `?canvas=` URL param or file picker)
2. Parses `<component-registry>` entries
3. Renders a **3-panel Figma-style layout**:

```
┌─────────────────────────────────────────────────────────┐
│  pseudo-canvas-viewer                          [load ▾]  │
├──────────────┬──────────────────────────┬───────────────┤
│ 📦 Components│                          │ ⚙ Props       │
│              │   [Live Component        │               │
│  ▸ Atoms     │    Rendered Here]        │ name: card    │
│    • avatar  │                          │ props: [...]  │
│    • badge   │                          │ slots: [...]  │
│    • button  │                          │ events: [...] │
│  ▸ Molecules │                          │               │
│    • card    │                          │               │
│  ▸ Organisms │                          │               │
│  ▸ Frames    │                          │               │
└──────────────┴──────────────────────────┴───────────────┘
```

### Parser

```js
// viewer/viewer.js (inline module in pseudo-canvas-viewer.html)
async function loadCanvas(url) {
  const text = await fetch(url).then(r => r.text());
  const doc  = new DOMParser().parseFromString(text, 'text/html');
  const registry = doc.querySelector('component-registry');
  return [...registry.children].map(parseComponent);
}

function parseComponent(el) {
  return {
    name:   el.tagName.toLowerCase(),
    props:  el.getAttribute('props')  ?? '',
    slots:  el.getAttribute('slots')  ?? '',
    events: el.getAttribute('on')     ?? '',
    role:   el.getAttribute('component-role') ?? '',
    layer:  el.getAttribute('layer')  ?? 'components',
  };
}
```

### Renderer

- Each selected component is registered into a local `PseudoKitClient` instance and stamped into the center canvas panel
- Props panel auto-generates editable `<input>` fields per `@props` declaration
- Live re-render on prop change

---

## CSS Architecture

```
tokens.css            ← CSS custom properties: colors, spacing, radius, shadows
@layer base           ← reset, :root vars
@layer layout         ← row, column, grid, stack, spacer
@layer components     ← all component @scope blocks
@layer utils          ← helpers: sr-only, visually-hidden
```

Each component's `<style>` block is consumed by `CSSStyleSheet` API (existing client mechanism — no DOM injection).

---

## Integration with pseudo-html-kit

`pseudo-kit-assets` lists `pseudo-html-kit` as a **peer dependency**.  
No modification to the existing `pseudo-html-kit` API.  
Components and frames are plain `.html` files — registered via the existing `register()` API.

---

## Performance Considerations

- Each component file ≤ 10 KB uncompressed (FR: NFR)
- `CSSStyleSheet` API: styles applied once per component type, not per instance
- Lazy loading: `pseudo-canvas-viewer` fetches components on selection, not upfront
- No layout shift: CSS `@scope` scoping prevents FOUC

---

## Security Considerations

- `<script>` blocks in components run in module scope — no `eval`, no `innerHTML`
- `pseudo-canvas-viewer` uses `fetch()` with same-origin or explicit user-loaded files
- No auth, no backend, no user data stored

---

## Open Technical Questions

- [x] ~~`tokens.css` inside `pseudo-kit-assets` or per-demo?~~ → **Per demo** — each demo ships its own `tokens.css`
- [x] ~~`pseudo-canvas-viewer` — drag-and-drop file loading?~~ → **Yes** — drag-and-drop + `?canvas=` URL param
- [x] ~~Barrel `index.js` — also export frame metadata as JS objects?~~ → **Yes** — `components`, `frames`, `componentsMeta`, `framesMeta`

---

## Revision History

| Date | Author | Change |
|---|---|---|
| 2026-03-01 | PM Agent (BMAD) | Initial draft |
