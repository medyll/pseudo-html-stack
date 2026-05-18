# pseudo-kit

> Vanilla HTML component system. No build step. No framework. No dependencies.

[![version](https://img.shields.io/badge/version-1.0.0-blue)](CHANGELOG-v1.0.0.md)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG%202.2-AA-green)](bmad/artifacts/a11y-audit-v0.6.0.md)
[![bundle](https://img.shields.io/badge/gzip-7.7%20KB-brightgreen)](scripts/check-bundle-size.js)
[![license](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)
[![components](https://img.shields.io/badge/components-61-purple)](pseudo-kit-context.json)

---

## Table of contents

- [What is pseudo-HTML?](#what-is-pseudo-html)
- [What is pseudo-kit?](#what-is-pseudo-kit)
- [How it works](#how-it-works)
- [Browser support](#browser-support)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Component files](#component-files)
  - [File anatomy](#file-anatomy)
  - [Naming convention](#naming-convention)
  - [Script modes](#script-modes)
  - [Self-registration](#self-registration)
- [Registering components](#registering-components)
  - [Manual registration](#manual-registration)
  - [Chained registration](#chained-registration)
  - [Auto-registration with pseudo-stack-assets](#auto-registration-with-pseudo-stack-assets)
- [Slots](#slots)
  - [Default slot](#default-slot)
  - [Named slots](#named-slots)
  - [Slot data forwarding](#slot-data-forwarding)
  - [pk-slot wrapper](#pk-slot-wrapper)
- [Loop rendering](#loop-rendering)
- [Reactive state](#reactive-state)
  - [Writing state](#writing-state)
  - [Reading state in CSS](#reading-state-in-css)
  - [SSR state hydration](#ssr-state-hydration)
- [Events](#events)
- [Theme system](#theme-system)
  - [theme.css — tokens + reset + palette](#themecss)
  - [utils.css — CSS @function mixins](#utilscss)
  - [Skins — brand overrides](#skins)
  - [Layer order](#layer-order)
- [CSS architecture](#css-architecture)
  - [@scope per component](#scope-per-component)
  - [adoptedStyleSheets](#adoptedstylesheets)
  - [prefers-reduced-motion](#prefers-reduced-motion)
  - [focus-visible](#focus-visible)
- [pseudo-stack-assets — component library](#pseudo-stack-assets)
  - [Atoms](#atoms)
  - [Molecules](#molecules)
  - [Organisms](#organisms)
  - [pseudo-canvas-viewer](#pseudo-canvas-viewer)
- [Server-side rendering (Node.js)](#server-side-rendering)
  - [Server API](#server-api)
  - [Hydration on the client](#hydration-on-the-client)
- [React adapter](#react-adapter)
  - [PseudoKitProvider](#pseudokitprovider)
  - [useComponent](#usecomponent)
  - [usePseudoKit](#usepseudokit)
  - [usePseudoKitReady](#usepseudokitready)
  - [useRegisterComponent](#useregistercomponent)
  - [SSR with React — renderComponent + hydrateMarker](#ssr-with-react)
- [Svelte adapter](#svelte-adapter)
- [CLI](#cli)
- [Client API reference](#client-api-reference)
- [Server API reference](#server-api-reference)
- [Data attributes reference](#data-attributes-reference)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [Testing](#testing)
- [Scripts reference](#scripts-reference)
- [Contributing](#contributing)
- [License](#license)

---

## What is Pseudo-HTML?

**Pseudo-HTML** is HTML.

A pseudo-HTML layout file looks like regular HTML. You write component tags, provide props as attributes, fill slots with children, and declare loops. The browser renders it as-is, and the pseudo-kit runtime resolves each component tag into its full template.

```html
<!-- A pseudo-HTML layout file -->
<navbar>
  <logo slot="start" src="/logo.svg"></logo>
  <nav-link slot="links" href="/" label="Home"></nav-link>
  <nav-link slot="links" href="/about" label="About"></nav-link>
  <button-pk slot="end" variant="primary">Sign in</button-pk>
</navbar>

<hero-banner headline="Build without frameworks" cta="Get started"></hero-banner>

<product-tile loop id="featured-products"></product-tile>
```

This file is valid HTML. You can open it in a browser and the runtime will resolve each tag by fetching its component definition.

---

## What is pseudo-kit?

**pseudo-kit** is the runtime and toolchain for pseudo-HTML:

- A browser runtime (`pseudo-kit-client.js`) that resolves component tags into templates using fetch and MutationObserver
- A Node.js server runtime (`pseudo-kit-server.js`) that renders components to HTML strings without a browser
- A component library (`pseudo-stack-assets`) with 61 production-ready components across three layers
- Framework adapters for React and Svelte
- A CLI for project initialization
- A canvas viewer (`pseudo-canvas-viewer.html`) for visual design exploration

Key properties:

- No build step required
- No framework dependency
- 7.7 KB gzip for the client runtime
- WCAG 2.2 AA compliant
- Works in plain HTML files, Node.js, React, Svelte, or any combination

---

## How it works

1. You write a layout file with component tags (`<button-pk>`, `<modal-pk>`, `<card>`)
2. You register each component with a URL pointing to its `.html` definition file
3. You call `PseudoKit.init()` to start the runtime
4. The runtime uses MutationObserver to detect registered component tags as they appear in the DOM
5. For each detected tag, the runtime fetches the `.html` definition file once and caches it
6. The `<template>` block is stamped into the element; named and default slots are resolved
7. The `<style>` block is inserted via `adoptedStyleSheets` — no `<style>` tags added to the DOM
8. The `<script>` block is evaluated in a sandboxed function scope with `el`, `state`, `emit`, and `renderLoop` available
9. Elements with `loop` attribute are marked for deferred rendering
10. Elements with `data-pk-hydrated` (SSR output) are skipped for template stamping, but scripts are evaluated

---

## Browser support

| Browser  | Minimum version | Notes                                    |
|----------|-----------------|------------------------------------------|
| Chrome   | 118+            | Full support                             |
| Firefox  | 128+            | Full support                             |
| Safari   | 17.4+           | Full support (CSS Anchor Positioning)    |

Required browser features: `adoptedStyleSheets`, `@scope`, CSS `@layer`, `popover` attribute, `<dialog>`, CSS Anchor Positioning, `MutationObserver`.

---

## Installation

**npm:**
```bash
npm install pseudo-stack
```

**pnpm:**
```bash
pnpm add pseudo-stack
```

**CDN (no install needed):**
```html
<script type="module">
  import PseudoKit from 'https://cdn.jsdelivr.net/npm/pseudo-stack/src/client/pseudo-kit-client.js';
  // ... register and init
</script>
```

**Node.js version requirement:** `>=22.0.0`

---

## Quick start

The minimum viable setup: one HTML file, one component file, no server, no bundler.

### 1. Create a component file

```html
<!-- components/greeting.html -->
<template>
  <p class="greeting__text">Hello, <span class="greeting__name"></span>!</p>
</template>

<style>
  @layer components {
    @scope (greeting) {
      :scope { display: block; padding: 1rem; }
      .greeting__text { font-size: 1.25rem; }
    }
  }
</style>

<script>
  const nameEl = el.querySelector('.greeting__name');
  nameEl.textContent = el.getAttribute('name') ?? 'World';
</script>
```

### 2. Use the component in your HTML page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My App</title>
</head>
<body>
  <greeting name="Alice"></greeting>
  <greeting name="Bob"></greeting>

  <script type="module">
    import PseudoKit from './node_modules/pseudo-stack/src/client/pseudo-kit-client.js';

    PseudoKit
      .register({ name: 'greeting', src: './components/greeting.html' })
      .init();
  </script>
</body>
</html>
```

### 3. Serve with any static server

```bash
npx serve . -p 3000
# or
python -m http.server 3000
```

That is all that is required. No compilation, no bundler, no config files.

---

## Component files

### File anatomy

Each component is a single `.html` file containing three optional blocks:

```html
<!-- components/my-card.html -->

<!-- 1. TEMPLATE — required. Defines the component's HTML structure. -->
<template>
  <article class="card">
    <header class="card__header">
      <slot name="header"></slot>
    </header>
    <div class="card__body">
      <slot></slot>  <!-- default slot -->
    </div>
  </article>
</template>

<!-- 2. STYLE — optional. Scoped to this component via @scope. -->
<style>
  @layer components {
    @scope (my-card) {
      :scope {
        display: block;
        border: 1px solid var(--color-border, #e0e0e0);
        border-radius: 8px;
      }
      .card__header { padding: 1rem; font-weight: bold; }
      .card__body   { padding: 1rem; }

      @media (prefers-reduced-motion: reduce) {
        :scope, :scope * { transition: none; animation: none; }
      }
    }
  }
</style>

<!-- 3. SCRIPT — optional. Runs once per instance, with el = the host element. -->
<script>
  const title = el.getAttribute('title');
  if (title) {
    el.querySelector('.card__header').textContent = title;
  }
</script>
```

The three blocks can appear in any order. Only `<template>` is required.

### Naming convention

Component file names must match the tag name they register as. The library components use the `-pk` suffix to avoid conflicts with HTML built-in elements:

```
button-pk.html   →  <button-pk>
input-pk.html    →  <input-pk>
modal-pk.html    →  <modal-pk>
card.html        →  <card>
navbar.html      →  <navbar>
```

For custom components outside the library, use any hyphenated name (custom element requirement: must contain at least one hyphen).

### Script modes

There are two ways to include JavaScript in a component.

**Inline script** (most common):

```html
<script>
  // `el` is the component host element — available as both `this` and `el`
  // `state` is the global PseudoKit reactive state proxy
  // `emit` dispatches a CustomEvent from el
  // `renderLoop` populates a loop="" container with data

  el.addEventListener('click', () => {
    emit(el, 'card:clicked', { id: el.dataset.id });
  });
</script>
```

The script runs once per component instance, evaluated via `new Function()` in a sandboxed scope. It does not have access to `import`, `export`, or module-level scope.

**Module script** (for components with external JS dependencies):

```html
<script type="module" src="./my-component.js"></script>
```

```javascript
// my-component.js
import PseudoKit from '../pseudo-kit-client.js';
PseudoKit.register(import.meta); // self-registers using file URL
```

When a module script is detected, the module is dynamically imported. The component's template and styles are still loaded from the `.html` file — only the script logic lives in the external module.

### Self-registration

A component can register itself from inside its own module script:

```javascript
// inside components/chat-bubble.js
import PseudoKit from '../pseudo-kit-client.js';
PseudoKit.register(import.meta);
// import.meta.url resolves to: file:///project/components/chat-bubble.js
// The name is derived from the file stem: "chat-bubble"
```

This is useful for component libraries distributed as npm packages. Consumers import the component modules; each module self-registers.

---

## Registering components

### Manual registration

```javascript
import PseudoKit from 'pseudo-stack';

PseudoKit.register({ name: 'my-button', src: '/components/my-button.html' });
PseudoKit.init();
```

The `src` can be:
- An absolute URL: `https://example.com/components/button.html`
- A root-relative path: `/components/button.html`
- A relative path from the page: `./components/button.html`

### Chained registration

`register()` returns `PseudoKit` for chaining. `init()` should be called last.

```javascript
PseudoKit
  .register({ name: 'navbar',    src: '/components/navbar.html' })
  .register({ name: 'hero-banner', src: '/components/hero-banner.html' })
  .register({ name: 'card',      src: '/components/card.html' })
  .register({ name: 'button-pk', src: '/components/button-pk.html' })
  .init();
```

### Auto-registration with pseudo-stack-assets

The `pseudo-stack-assets` package exports a registry index. Import it and register all components in one call:

```javascript
import PseudoKit from 'pseudo-stack';
import { components } from 'pseudo-stack-assets';
// components is an array of { name, src } objects — one entry per component

for (const def of components) {
  PseudoKit.register(def);
}
PseudoKit.init();
```

Or use `componentsMeta` for programmatic introspection:

```javascript
import { componentsMeta } from 'pseudo-stack-assets';
// componentsMeta is an array of { name, src, layer, props, slots } objects
```

---

## Slots

Slots are the primary mechanism for injecting content into a component's template. They work like HTML `<slot>` elements but are resolved by the pseudo-kit runtime on the client (or server for SSR).

### Default slot

A `<slot>` with no `name` attribute is the default slot. It receives all children that do not have a `slot` attribute.

**Component template:**
```html
<template>
  <div class="card__body">
    <slot></slot>
  </div>
</template>
```

**Usage:**
```html
<card>
  <p>This text goes into the default slot.</p>
  <img src="photo.jpg" alt="Photo">
</card>
```

**Resolved output:**
```html
<card data-pk-resolved>
  <div class="card__body">
    <pk-slot data-slot-component="card" data-slot-name="default" style="display:contents">
      <p>This text goes into the default slot.</p>
      <img src="photo.jpg" alt="Photo">
    </pk-slot>
  </div>
</card>
```

### Named slots

A `<slot name="x">` receives children with `slot="x"`.

**Component template:**
```html
<template>
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</template>
```

**Usage:**
```html
<page-layout>
  <nav slot="header">Navigation here</nav>
  <article>Main content here</article>
  <p slot="footer">Footer text</p>
</page-layout>
```

Children with `slot="header"` go to the named slot; the `<article>` (no slot attribute) goes to the default slot.

### Slot data forwarding

A `<slot>` element can carry `data-*` attributes. Those attributes are forwarded to every element child that fills the slot.

**Component template:**
```html
<template>
  <ul class="list">
    <slot data-variant="primary"></slot>
  </ul>
</template>
```

**Usage:**
```html
<my-list>
  <li>Item one</li>
  <li>Item two</li>
</my-list>
```

**Result:** Each `<li>` receives `data-variant="primary"` automatically.

This is useful for passing context (variant, size, theme) from a parent component to its slot content without requiring the consumer to repeat the attribute on each child.

### pk-slot wrapper

Every resolved slot is wrapped in a `<pk-slot>` element with `display: contents`. This element is invisible to layout (it occupies no space) but carries metadata for debugging and CSS targeting:

```html
<pk-slot
  data-slot-component="card"
  data-slot-name="header"
  data-slot-props='{"data-variant":"primary"}'
  style="display:contents"
>
  <!-- slot content here -->
</pk-slot>
```

You can target slot wrappers in CSS:
```css
pk-slot[data-slot-name="header"] { /* affects the wrapper */ }
```

---

## Loop rendering

The `loop` attribute on a component tag marks it as a repeating template. The element is used as a template; actual rendering is deferred until `renderLoop()` is called with data.

**Layout:**
```html
<section id="product-list">
  <product-tile loop></product-tile>
</section>
```

**Script:**
```javascript
import PseudoKit from 'pseudo-stack';

PseudoKit.register({ name: 'product-tile', src: '/components/product-tile.html' }).init();

// Later, when data is available (e.g. from a fetch)
fetch('/api/products')
  .then(r => r.json())
  .then(products => {
    PseudoKit.renderLoop('product-list', products);
    // products = [{ id: '1', name: 'Widget', price: '9.99' }, ...]
  });
```

**Inside the component script, data arrives as `data-*` attributes:**
```html
<script>
  const name  = el.dataset.name;   // "Widget"
  const price = el.dataset.price;  // "9.99"
  el.querySelector('.tile__name').textContent  = name;
  el.querySelector('.tile__price').textContent = `$${price}`;
</script>
```

`renderLoop(containerId, data)` replaces the loop template element with one clone per data item. Each clone receives the item's key-value pairs as `data-*` attributes. Newly created elements are resolved by the runtime automatically.

---

## Reactive state

The global state proxy (`PseudoKit.state`) connects JavaScript state to CSS via `data-*` attributes on `:root`. Writing to the proxy updates an attribute; CSS reads it with `:root[data-*]` or `:root:has([data-*])`.

### Writing state

```javascript
import PseudoKit from 'pseudo-stack';

// camelCase keys are converted to kebab-case data attributes
PseudoKit.state.focusMode = true;
// → :root gets attribute data-focus-mode=""

PseudoKit.state.activeTab = 'tab-overview';
// → :root gets attribute data-active-tab="tab-overview"

PseudoKit.state.focusMode = false;
// → data-focus-mode attribute removed from :root
```

### Reading state in CSS

```css
/* Hide the sidebar when focus mode is active */
:root[data-focus-mode] .sidebar {
  display: none;
}

/* Show the right tab panel */
:root[data-active-tab="tab-overview"] #panel-overview {
  display: block;
}

/* More complex: use :has() to style based on multiple conditions */
:root:has([data-ai-running]):has([data-focus-mode]) .progress-bar {
  opacity: 1;
}
```

### SSR state hydration

When rendering server-side, initial state can be embedded in the HTML response and hydrated on the client without a flash of default state:

```html
<!-- Embedded by the server in the HTML response -->
<script id="pk-state" type="application/json">
  {"focusMode": false, "activeTab": "tab-overview", "userLoggedIn": true}
</script>
```

The client runtime reads this tag automatically on `PseudoKit.init()` and applies the state before the first render.

---

## Events

Use `emit()` inside component scripts to dispatch events that bubble up the DOM tree.

**Inside a component script:**
```html
<script>
  el.querySelector('.card__close').addEventListener('click', () => {
    emit(el, 'card:dismissed', { id: el.dataset.id });
  });
</script>
```

**Listening in the page:**
```javascript
document.addEventListener('card:dismissed', (e) => {
  console.log('Card dismissed:', e.detail.id);
  // e.detail = { id: '42' }
  // e.bubbles = true
  // e.composed = true
});
```

`emit(el, name, detail)` dispatches a `CustomEvent` with `bubbles: true` and `composed: true` (crosses Shadow DOM boundaries if needed). The `detail` parameter is optional.

---

## Theme system

The `pseudo-stack-assets` package includes a theme system with three layers: base tokens, utility mixins, and brand skins.

### theme.css

`theme.css` provides:
- A modern CSS reset
- Design tokens as CSS custom properties on `:root`
- Automatic light/dark mode via `light-dark()` and `color-scheme`
- Four CSS layers in priority order: `theme.reset`, `theme.tokens`, `theme.palette`, `skin`

**Usage:**
```html
<link rel="stylesheet" href="node_modules/pseudo-stack-assets/theme/theme.css">
```

**Available token categories:**

| Category   | Examples                                              |
|------------|-------------------------------------------------------|
| Colors     | `--color-primary`, `--color-surface`, `--color-text` |
| Typography | `--font-sans`, `--text-base`, `--text-lg`, `--leading-normal` |
| Spacing    | `--space-1` through `--space-16` (4px scale)         |
| Radius     | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full` |
| Shadows    | `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl` |
| Motion     | `--duration-fast`, `--duration-normal`, `--easing-default` |
| Opacity    | `--alpha-hover`, `--alpha-focus`, `--alpha-pressed`  |
| Breakpoints| `--bp-sm` (768px), `--bp-md` (1024px), `--bp-lg` (1440px) |

### utils.css

`utils.css` provides native CSS `@function` mixins that operate on the tokens.

**Usage:**
```html
<link rel="stylesheet" href="node_modules/pseudo-stack-assets/theme/theme.css">
<link rel="stylesheet" href="node_modules/pseudo-stack-assets/theme/utils.css">
```

**Available mixins:**

```css
/* alpha($color, $opacity) — apply transparency to any color value */
background: alpha(var(--color-primary), 0.12);
border: 1px solid alpha(var(--color-text), var(--alpha-focus));

/* elevation($level) — semantic shadow levels 0 through 4 */
box-shadow: elevation(0);   /* none */
box-shadow: elevation(1);   /* --shadow-sm */
box-shadow: elevation(2);   /* --shadow-md */
box-shadow: elevation(3);   /* --shadow-lg */
box-shadow: elevation(4);   /* --shadow-xl */
```

### Skins

A skin is a CSS file that overrides token values for a specific brand. Three skins are included:

| File          | Data attribute          | Description               |
|---------------|-------------------------|---------------------------|
| `netflix.css` | `data-skin="netflix"`   | Dark mode, red primary    |
| `amazon.css`  | `data-skin="amazon"`    | Light mode, orange primary|
| `facebook.css`| `data-skin="facebook"`  | Light mode, blue primary  |

**Usage:**
```html
<html data-skin="netflix">
<head>
  <link rel="stylesheet" href="node_modules/pseudo-stack-assets/theme/theme.css">
  <link rel="stylesheet" href="node_modules/pseudo-stack-assets/theme/utils.css">
  <link rel="stylesheet" href="node_modules/pseudo-stack-assets/skins/netflix.css">
</head>
```

**Creating a custom skin:**
```css
/* skins/my-brand.css */
@layer skin {
  @scope ([data-skin="my-brand"]) {
    :scope {
      --color-primary:          #ff6600;
      --color-primary-hover:    hsl(from #ff6600 h s calc(l - 8%));
      --color-primary-contrast: #ffffff;
      --color-surface:          #1a1a1a;
      --color-text:             #f5f5f5;
    }
  }
}
```

Skin rules live in the `skin` layer, which has the highest priority in the stack. They override `theme.palette` without needing `!important`.

### Layer order

The full CSS layer cascade, from lowest to highest priority:

```
theme.reset  →  theme.tokens  →  theme.palette  →  skin  →  components
```

Component styles use `@layer components { @scope (tag-name) { ... } }`. This keeps component styles above the theme but prevents them from accidentally overriding skin rules if you add component-level theme properties.

---

## CSS architecture

### @scope per component

Every component's styles are wrapped in `@scope` to prevent leakage. No class prefixing, no BEM suffix needed for isolation — the scope selector handles it.

```css
@layer components {
  @scope (button-pk) {
    /* These rules only apply inside <button-pk> elements */
    :scope { display: inline-flex; align-items: center; }
    .btn { padding: 0.5rem 1rem; border-radius: var(--radius-md); }
    .btn:hover { background: var(--color-primary-hover); }
  }
}
```

`:scope` refers to the host element (`<button-pk>` itself). All descendant selectors are naturally scoped.

### adoptedStyleSheets

All component CSS is managed via `CSSStyleSheet` with `document.adoptedStyleSheets`. This means:

- No `<style>` tags are added to the `<head>` by the runtime
- CSS rules are stored in a single shared stylesheet
- Rules are replaced in-place (not appended) when a component is re-registered
- Falls back to a single `<style data-pk-component-styles>` tag in environments that do not support `adoptedStyleSheets`

### prefers-reduced-motion

All components that define transitions or animations include a `prefers-reduced-motion` guard:

```css
@scope (carousel) {
  :scope .track { transition: transform 300ms var(--easing-default); }

  @media (prefers-reduced-motion: reduce) {
    :scope, :scope * { transition: none; animation: none; }
  }
}
```

### focus-visible

All interactive elements use `:focus-visible` instead of `:focus` to avoid showing focus rings on mouse clicks while still providing them for keyboard navigation:

```css
@scope (button-pk) {
  :scope .btn:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}
```

---

## pseudo-stack-assets

The `pseudo-stack-assets` package contains 61 production-ready components, a theme system, demo apps, and the canvas viewer.

### Atoms

23 base-level UI building blocks:

| Component      | Tag              | Description                                       |
|----------------|------------------|---------------------------------------------------|
| Avatar         | `<avatar>`       | User image with fallback initials                 |
| Badge          | `<badge>`        | Numeric or label indicator                        |
| Button         | `<button-pk>`    | Push button with variants (primary/secondary/ghost/danger) |
| Checkbox       | `<checkbox-pk>`  | Native checkbox with `:checked`/`:invalid`        |
| Chip           | `<chip>`         | Removable label tag                               |
| Date picker    | `<date-picker-pk>` | Native `<input type="date">` with label forwarding |
| Divider        | `<divider>`      | Horizontal or vertical separator                  |
| Icon           | `<icon>`         | SVG icon wrapper                                  |
| Image          | `<image>`        | Responsive image with loading state               |
| Input          | `<input-pk>`     | Text input with HTML5 validation + Popover hints  |
| Label          | `<label>`        | Form label with required marker                   |
| Loader         | `<loader>`       | Indeterminate loading indicator                   |
| Progress bar   | `<progress-bar>` | Determinate progress (0–100)                      |
| Progress       | `<progress-pk>`  | Native `<progress>` element wrapper               |
| Radio          | `<radio-pk>`     | Native radio button                               |
| Rating         | `<rating>`       | Star rating (read-only or interactive)            |
| Select         | `<select-pk>`    | Native `<select>` with Listbox API                |
| Skeleton       | `<skeleton>`     | Loading placeholder                               |
| Slider         | `<slider-pk>`    | Native `<input type="range">`                     |
| Spinner        | `<spinner>`      | Circular loading spinner                          |
| Tag            | `<tag>`          | Non-removable status label                        |
| Textarea       | `<textarea-pk>`  | Multiline input with auto-resize hint             |
| Toggle         | `<toggle>`       | On/off switch                                     |

### Molecules

22 composite components built from atoms:

| Component      | Tag                | Key features                                       |
|----------------|--------------------|----------------------------------------------------|
| Breadcrumb     | `<breadcrumb-pk>`  | Accessible navigation landmark                     |
| Card           | `<card>`           | Content container with header/body/footer slots    |
| Card media     | `<card-media>`     | Card with image header                             |
| Carousel       | `<carousel>`       | Horizontal scroll carousel                         |
| Color swatch   | `<color-swatch>`   | Clickable color option                             |
| Combobox       | `<combobox-pk>`    | Listbox API combobox with keyboard navigation      |
| Date picker    | `<date-picker-pk>` | Molecule variant with full popover calendar        |
| Dropdown       | `<dropdown>`       | Popover API menu, `popovertarget` attribute        |
| Form field     | `<form-field>`     | Label + input + error message wrapper              |
| Grid           | `<grid>`           | CSS Grid Lanes + Container Queries                 |
| List item      | `<list-item>`      | Selectable list row                                |
| Menu item      | `<menu-item>`      | Dropdown menu option                               |
| Modal          | `<modal-pk>`       | `<dialog>` with Invoker Commands                  |
| Notification   | `<notification>`   | Auto-dismiss toast with Interest Invokers          |
| Pagination     | `<pagination>`     | Page navigation controls                          |
| Price tag      | `<price-tag>`      | Formatted price display                            |
| Product tile   | `<product-tile>`   | Grid card with image, name, price, CTA             |
| Search bar     | `<search-bar>`     | Input + submit button                              |
| Tab bar        | `<tab-bar>`        | Horizontal tab navigation                          |
| Tooltip        | `<tooltip>`        | CSS Anchor Positioning tooltip                     |
| User info      | `<user-info>`      | Avatar + name + role                               |

### Organisms

16 full-section components:

| Component      | Tag                | Description                                  |
|----------------|--------------------|----------------------------------------------|
| Accordion      | `<accordion-pk>`   | CSS `@supports` + View Transitions API       |
| Carousel       | `<carousel>`       | Full-width hero carousel                     |
| Cart summary   | `<cart-summary>`   | Shopping cart sidebar                        |
| Comment thread | `<comment-thread>` | Threaded conversation                        |
| Content row    | `<content-row>`    | Netflix-style horizontal scroll section      |
| Feed post      | `<feed-post>`      | Social media post card                       |
| Footer         | `<footer>`         | Site footer with link columns                |
| Hero banner    | `<hero-banner>`    | Full-width hero with CTA                     |
| Navbar         | `<navbar>`         | Top navigation with hamburger                |
| Product detail | `<product-detail>` | Full product page section                    |
| Profile card   | `<profile-card>`   | User profile with social links               |
| Sidebar        | `<sidebar>`        | Off-canvas sidebar                           |
| Story ring     | `<story-ring>`     | Social story avatar ring                     |
| Tabs           | `<tabs-pk>`        | Tabbed panel component                       |
| Thumbnail grid | `<thumbnail-grid>` | Image grid                                   |
| Topbar         | `<topbar>`         | Secondary top bar (filters, breadcrumb)      |

### pseudo-canvas-viewer

`pseudo-canvas-viewer.html` is a Figma-style canvas viewer for exploring pseudo-HTML layout files visually:

- Drag-and-drop or URL parameter loading
- Zoom and pan controls
- Component tree inspector
- Works with any layout file via query string

```
pseudo-canvas-viewer.html?canvas=./layouts/home.html
pseudo-canvas-viewer.html?assets=auto
```

---

## Server-side rendering

pseudo-kit supports server-side rendering via `pseudo-kit-server.js`. The server reads `.html` component files, extracts their templates, and returns rendered HTML strings.

### Server API

```javascript
import PseudoKit from 'pseudo-stack/server';

// Register components server-side
PseudoKit.register({ name: 'navbar', src: './src/components/navbar.html' });
PseudoKit.register({ name: 'hero-banner', src: './src/components/hero-banner.html' });

// Render a component to an HTML string
const html = await PseudoKit.renderComponent_server('navbar', {
  siteName: 'My App',
  logoSrc:  '/logo.svg',
});
// Returns: '<navbar sitename="My App" logosrc="/logo.svg" data-pk-ssr="navbar" data-pk-resolved>...template...</navbar>'
```

**renderComponent_server(name, props)**

| Parameter | Type   | Description                                          |
|-----------|--------|------------------------------------------------------|
| `name`    | string | The registered component tag name                    |
| `props`   | object | Props to serialize as attributes                     |

Props are serialized as HTML attributes:
- String values: `key="value"` (with `"` escaped)
- Boolean `true`: bare attribute (`disabled`)
- Boolean `false`, `null`, `undefined`: attribute omitted

The output includes two hydration markers:
- `data-pk-ssr="name"`: identifies the component type for the client
- `data-pk-resolved`: tells the client to skip template stamping

**Inline state for hydration:**

```javascript
import PseudoKit from 'pseudo-stack/server';

const stateTag = PseudoKit.serializeStateToTag({ activeTab: 'home', userLoggedIn: true });
// Returns: <script id="pk-state" type="application/json">{"activeTab":"home","userLoggedIn":true}</script>
```

Include this tag in the `<head>` of your HTML response. The client will hydrate the state on init.

### Hydration on the client

When the client receives a page with server-rendered components, it automatically detects the `data-pk-hydrated` or `data-pk-ssr` markers and skips re-stamping the template. Scripts are still evaluated so interactive behavior works immediately.

```html
<!-- Server output (in the HTML response body) -->
<navbar data-pk-ssr="navbar" data-pk-resolved sitename="My App">
  <pk-slot data-slot-component="navbar" data-slot-name="logo" style="display:contents">
    <img src="/logo.svg" alt="My App">
  </pk-slot>
</navbar>
```

```javascript
// Client: detects data-pk-resolved, skips stamp, runs script
PseudoKit.register({ name: 'navbar', src: '/components/navbar.html' }).init();
```

---

## React adapter

Install the React adapter:

```bash
npm install pseudo-kit-react
```

The adapter wraps the pseudo-kit client for use inside React 18 applications. Component tags are used directly in JSX — they are custom elements and do not require React wrappers.

### PseudoKitProvider

The most convenient approach: wrap your app in a provider that registers and initializes all components at once.

```jsx
import { PseudoKitProvider } from 'pseudo-kit-react';

function App() {
  return (
    <PseudoKitProvider
      baseUrl="/components"
      components={[
        'button-pk.html',
        'card.html',
        'modal-pk.html',
      ]}
    >
      <main>
        <card title="Hello">
          <p>Content goes in the default slot.</p>
        </card>
        <button-pk variant="primary">Open modal</button-pk>
      </main>
    </PseudoKitProvider>
  );
}
```

**Props:**

| Prop         | Type       | Default | Description                                       |
|--------------|------------|---------|---------------------------------------------------|
| `components` | `string[]` | `[]`    | Component URL paths to register                   |
| `baseUrl`    | `string`   | `''`    | Base URL prepended to each component path         |
| `children`   | `ReactNode`| —       | App content                                       |

### useComponent

Registers and tracks a single component's ready state.

```jsx
import { useComponent } from 'pseudo-kit-react';

function MyPage() {
  const { ready } = useComponent('/components/button-pk.html');

  if (!ready) return <div>Loading component...</div>;

  return (
    <div>
      <button-pk variant="primary">Click me</button-pk>
    </div>
  );
}
```

### usePseudoKit

Returns the global `PseudoKit` instance. Use this for direct access to state, emit, or renderLoop.

```jsx
import { usePseudoKit } from 'pseudo-kit-react';

function ThemeToggle() {
  const pseudoKit = usePseudoKit();

  return (
    <button onClick={() => {
      pseudoKit.state.darkMode = !pseudoKit.state.darkMode;
    }}>
      Toggle theme
    </button>
  );
}
```

### usePseudoKitReady

Returns a boolean that is `true` once the runtime has initialized.

```jsx
import { usePseudoKitReady } from 'pseudo-kit-react';

function App() {
  const ready = usePseudoKitReady();
  return ready ? <Main /> : <Splash />;
}
```

### useRegisterComponent

Registers a component by name and URL. Returns `{ ready }`.

```jsx
import { useRegisterComponent } from 'pseudo-kit-react';

function DynamicWidget({ componentUrl }) {
  const { ready } = useRegisterComponent('dynamic-widget', componentUrl);
  if (!ready) return null;
  return <dynamic-widget></dynamic-widget>;
}
```

### SSR with React

For server-side rendering in a React (or Next.js) app, use the SSR utilities from `pseudo-kit-react/ssr`:

```javascript
import { renderComponent, hydrateMarker } from 'pseudo-kit-react/ssr';

// Render a component to an HTML string on the server
const navbarHtml = await renderComponent('./components/navbar-pk.html', {
  siteName: 'My App',
  logoSrc:  '/logo.svg',
});
// Returns: '<navbar-pk sitename="My App" logosrc="/logo.svg" data-pk-ssr="navbar-pk" data-pk-resolved>...template...</navbar-pk>'

// Generate an HTML comment hydration marker
const marker = hydrateMarker('navbar-pk');
// Returns: '<!--pk-ssr:navbar-pk-->'
```

`renderComponent(filePath, props)`:
- `filePath`: absolute path to the component `.html` file
- `props`: object serialized as HTML attributes
- Returns: `Promise<string>`

`hydrateMarker(name)`:
- `name`: component tag name
- Returns: `string` — `'<!--pk-ssr:name-->'`

**Use with Next.js App Router:**

```jsx
// app/page.jsx (server component)
import { renderComponent } from 'pseudo-kit-react/ssr';
import path from 'path';

export default async function HomePage() {
  const navHtml = await renderComponent(
    path.resolve('./components/navbar-pk.html'),
    { siteName: 'My App' }
  );

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: navHtml }} />
      <main>Page content</main>
    </div>
  );
}
```

---

## Svelte adapter

Install the Svelte adapter:

```bash
npm install pseudo-kit-svelte
```

**Exports:**

| Export              | Description                                        |
|---------------------|----------------------------------------------------|
| `pseudoKit`         | Svelte action: registers and initializes on mount  |
| `initPseudoKit`     | Imperative init for use outside Svelte actions     |
| `createComponent`   | Register one component                             |
| `createComponents`  | Register multiple components                       |
| `nameFromUrl`       | Extract tag name from a file URL                   |

**Svelte 5 example:**

```svelte
<script>
  import { pseudoKit } from 'pseudo-kit-svelte';

  const components = [
    { name: 'button-pk', src: '/components/button-pk.html' },
    { name: 'card',      src: '/components/card.html' },
  ];
</script>

<div use:pseudoKit={{ components }}>
  <card>
    <p>Hello from Svelte</p>
  </card>
  <button-pk variant="primary">Click</button-pk>
</div>
```

The `pseudoKit` action registers components and calls `PseudoKit.init()` on the node it is applied to. Components are scoped to that subtree.

---

## CLI

Initialize a new pseudo-kit project with the scaffolding CLI:

```bash
npx pseudo-kit init
# or after install:
pseudo-kit init
```

The CLI creates:
- `index.html` — entry page with PseudoKit loaded
- `components/` — directory for your component files
- `layouts/` — directory for pseudo-HTML layout files

The binary is exposed as `pseudo-kit` in `package.json` `bin`:

```json
{
  "bin": {
    "pseudo-kit": "./bin/pseudo-kit-init.js"
  }
}
```

---

## Client API reference

All methods are available on the default export from `pseudo-stack`.

```javascript
import PseudoKit from 'pseudo-stack';
// or
import PseudoKit from 'pseudo-stack/client';
```

### PseudoKit.register(input)

Registers a component definition.

```typescript
register(input: ManualRegistration | ImportMeta): typeof PseudoKit
```

| Input form           | Description                                              |
|----------------------|----------------------------------------------------------|
| `{ name, src }`      | Manual registration with tag name and URL                |
| `import.meta`        | Self-registration from inside a component module script  |

Returns `PseudoKit` for chaining.

```javascript
PseudoKit.register({ name: 'my-button', src: '/components/my-button.html' });
PseudoKit.register(import.meta); // from inside a component module
```

### PseudoKit.init([root])

Starts the runtime. Begins MutationObserver on `root` and resolves all components already in the DOM.

```typescript
init(root?: Element): MutationObserver
```

| Parameter | Type      | Default         | Description                         |
|-----------|-----------|-----------------|-------------------------------------|
| `root`    | `Element` | `document.body` | Root element to observe             |

Returns the active `MutationObserver` instance.

```javascript
PseudoKit.init();
PseudoKit.init(document.getElementById('app-root'));
```

### PseudoKit.renderLoop(containerId, data)

Renders a `loop=""` template with a data array.

```typescript
renderLoop(containerId: string, data: object[]): void
```

| Parameter     | Type       | Description                                             |
|---------------|------------|---------------------------------------------------------|
| `containerId` | `string`   | `id` of the container holding the `loop=""` child       |
| `data`        | `object[]` | Array of objects; keys become `data-*` on each clone    |

```javascript
PseudoKit.renderLoop('results-list', [
  { id: '1', name: 'Alice', role: 'admin' },
  { id: '2', name: 'Bob',   role: 'user'  },
]);
```

### PseudoKit.emit(el, name, detail)

Dispatches a `CustomEvent` from an element.

```typescript
emit(el: Element, name: string, detail?: any): void
```

```javascript
PseudoKit.emit(el, 'user:selected', { id: '42' });
```

### PseudoKit.state

Reactive state proxy. Keys map to `data-*` attributes on `:root`.

```typescript
state: Record<string, any>
```

```javascript
PseudoKit.state.darkMode   = true;      // sets data-dark-mode=""
PseudoKit.state.activeUser = 'alice';   // sets data-active-user="alice"
PseudoKit.state.darkMode   = false;     // removes data-dark-mode
```

---

## Server API reference

```javascript
import PseudoKit from 'pseudo-stack/server';
```

### PseudoKit.register(input)

Same signature as the client. Registers a component for server-side rendering.

### PseudoKit.renderComponent_server(name, props)

Renders a component to an HTML string.

```typescript
renderComponent_server(name: string, props?: object): Promise<string>
```

### PseudoKit.serializeStateToTag(state)

Returns a `<script id="pk-state" type="application/json">` tag string for embedding in the HTML response.

```typescript
serializeStateToTag(state: object): string
```

### PseudoKit.validateLayout_server(filePath)

Validates a pseudo-HTML layout file against the registered component registry. Returns a list of unknown tags.

```typescript
validateLayout_server(filePath: string): Promise<ValidationResult>
```

### PseudoKit.generateBaseCSS_server()

Generates a base CSS string from all registered component style blocks. Useful for embedding critical CSS in the HTML response.

```typescript
generateBaseCSS_server(): Promise<string>
```

---

## Data attributes reference

These attributes are written and read by the runtime. You can also use them in CSS selectors.

| Attribute              | Written by    | Description                                      |
|------------------------|---------------|--------------------------------------------------|
| `data-pk-resolved`     | Client        | Added to an element after it has been stamped    |
| `data-pk-hydrated`     | Client        | Added when SSR element is detected; stamp skipped|
| `data-pk-ssr`          | Server        | Component name, written during SSR               |
| `data-pk-loop-template`| Client        | Marks a loop="" element as a pending template    |
| `data-slot-component`  | Client        | On `<pk-slot>`: parent component name            |
| `data-slot-name`       | Client        | On `<pk-slot>`: slot name ("default" or named)   |
| `data-slot-props`      | Client        | On `<pk-slot>`: JSON of forwarded data-* props   |

---

## Accessibility

pseudo-kit is WCAG 2.2 AA compliant (verified by axe-core and manual audit).

**What is included:**

- All 61 components pass axe-core with `wcag2a` and `wcag2aa` tag rules
- Zero color-contrast violations (WCAG 1.4.3 AA)
- All interactive elements use `:focus-visible` for keyboard focus rings
- All animations respect `prefers-reduced-motion: reduce`
- Full ARIA landmark and keyboard navigation coverage
- Interactive APIs use native HTML elements (`<dialog>`, `<input>`, `<select>`, popover) wherever possible

**Running the a11y audit:**

```bash
pnpm test:a11y
```

The audit uses `@axe-core/playwright` and runs against all 61 components in a real browser.

**Audit output:** `bmad/artifacts/color-contrast-audit-{date}.md`

---

## Performance

| Artifact                  | Gzipped size | Budget  |
|---------------------------|--------------|---------|
| `pseudo-kit-client.js`    | 7.7 KB       | 12 KB   |
| `pseudo-kit-server.js`    | 4.4 KB       | 6 KB    |
| Average component file    | ~2.1 KB      | 4 KB    |

The runtime has no dependencies. Component CSS is managed via `adoptedStyleSheets` without DOM injection. Components are fetched on demand and cached — a component used 100 times is fetched once.

**Check bundle size:**

```bash
pnpm check:bundle
```

---

## Testing

### Test suites

| Suite                  | Runner         | Count | Command                          |
|------------------------|----------------|-------|----------------------------------|
| Registry + state (node)| `node:test`    | 226   | `pnpm test`                      |
| Client (vitest/jsdom)  | vitest         | 345   | `pnpm test:client`               |
| React adapter          | vitest         | 29    | `cd src/pseudo-kit-react && pnpm test` |
| Svelte adapter         | vitest         | 18    | `cd src/pseudo-kit-svelte && pnpm test`|
| Components (vitest)    | vitest         | ~47   | `pnpm test:components`           |
| E2E                    | Playwright     | 38    | `pnpm test:e2e`                  |
| A11y (axe-core)        | Playwright     | 5     | `pnpm test:a11y`                 |
| **Total**              |                | **661+**|                                |

### Running all tests

```bash
pnpm test:all
```

### Running individual suites

```bash
pnpm test             # Node.js test runner (server + registry + state)
pnpm test:client      # Vitest browser simulation (client runtime)
pnpm test:components  # Vitest component rendering
pnpm test:viewer      # Vitest canvas viewer
pnpm test:e2e         # Playwright E2E (Chromium by default)
pnpm test:a11y        # Playwright + axe-core accessibility
pnpm test:coverage    # Vitest with coverage report
```

### E2E browser matrix

E2E tests target Chromium as the primary browser. Firefox and WebKit are included in the playwright config. WebKit tests for the migration components (popover, anchor positioning) are deferred pending browser parity.

```bash
pnpm test:e2e:ui      # Playwright UI mode (interactive)
pnpm test:e2e:debug   # Playwright debug mode (step-through)
```

---

## Scripts reference

All scripts are available via `pnpm run`:

| Script              | Description                                                  |
|---------------------|--------------------------------------------------------------|
| `lint`              | Run oxlint on all source files                               |
| `lint:fix`          | Run oxlint with auto-fix                                     |
| `validate`          | Validate a layout file against registered components         |
| `validate:json`     | Same, with JSON output                                       |
| `normalize`         | Normalize a pseudo-HTML layout file (dry-run)                |
| `normalize:write`   | Normalize in-place                                           |
| `test`              | Run Node.js test suite                                       |
| `test:client`       | Run vitest browser tests                                     |
| `test:components`   | Run vitest component tests                                   |
| `test:viewer`       | Run vitest canvas viewer tests                               |
| `test:e2e`          | Run Playwright E2E tests                                     |
| `test:e2e:ui`       | Playwright UI mode                                           |
| `test:e2e:debug`    | Playwright debug mode                                        |
| `test:a11y`         | Run axe-core accessibility audit                             |
| `test:all`          | Run all test suites in sequence                              |
| `test:coverage`     | Run vitest with coverage report                              |
| `check:bundle`      | Check gzip sizes against budgets                             |
| `generate:context`  | Generate `pseudo-kit-context.json` from JSDoc comments       |
| `generate:docs`     | Generate `docs/index.html` from context JSON                 |
| `serve:src`         | Serve the `src/` directory on port 3001                      |
| `add-knowledge`     | CLI to add knowledge entries for the LLM context pack        |

---

## Contributing

### Prerequisites

- Node.js 22+
- pnpm

### Setup

```bash
git clone https://github.com/your-org/pseudo-stack.git
cd pseudo-stack
pnpm install
pnpm test
```

### Project structure

```
pseudo-stack/
├── src/
│   ├── client/               # Browser runtime (pseudo-kit-client.js)
│   ├── server/               # Node.js runtime (pseudo-kit-server.js, canvas-validator.js, canvas-normalize.js)
│   ├── shared/               # Shared registry and state modules
│   ├── pseudo-html/          # Pseudo-HTML parser utilities
│   ├── pseudo-assets/        # Component library
│   │   ├── components/
│   │   │   ├── atoms/        # 23 atom components
│   │   │   ├── molecules/    # 22 molecule components
│   │   │   └── organisms/    # 16 organism components
│   │   ├── theme/            # theme.css, utils.css
│   │   ├── skins/            # netflix.css, amazon.css, facebook.css
│   │   ├── frames/           # Empty layout skeletons
│   │   └── demos/            # Netflix, Amazon, Facebook demo apps
│   ├── pseudo-kit-react/     # React adapter package
│   └── pseudo-kit-svelte/    # Svelte adapter package
├── tests/                    # All test files
├── scripts/                  # Build, generation, and check scripts
├── docs/                     # Generated documentation site
├── bin/                      # CLI entry point
├── pseudo-kit-context.json   # Machine-readable component registry (LLM context pack)
└── bmad/                     # Project management artifacts
```

### Writing a new component

1. Create `src/pseudo-assets/components/{layer}/my-component.html`
2. Add a JSDoc header with `@component`, `@layer`, `@prop`, `@slot` annotations:

```html
<!--
 * @component MyComponent
 * @layer molecules
 * @prop {string} title - Card title
 * @prop {string} [variant=default] - Visual variant: "default" | "outlined" | "elevated"
 * @slot header - Optional header content
 * @slot - Default content slot
-->
<template>
  ...
</template>
```

3. Add a test in `tests/`
4. Run `pnpm generate:context` to update `pseudo-kit-context.json`
5. Run `pnpm generate:docs` to update `docs/index.html`
6. Run `pnpm test:all` to verify

### Code standards

- All code comments in English
- No `!important` in component CSS
- All interactive elements must have `:focus-visible` styles
- All transitions/animations must include `prefers-reduced-motion` guard
- Components must pass `pnpm test:a11y` before merging

---

## License

MIT — see [LICENSE](LICENSE).

---

*pseudo-kit — 21 sprints · 61 components · WCAG 2.2 AA · 7.7 KB.*
