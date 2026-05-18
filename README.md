# pseudo-stack

> Vanilla HTML component system. No build step. No framework. No dependencies.

[![version](https://img.shields.io/badge/version-1.0.0-blue)](CHANGELOG.md)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG%202.2-AA-green)](bmad/artifacts/a11y-audit-v0.6.0.md)
[![bundle](https://img.shields.io/badge/gzip-7.7%20KB-brightgreen)](scripts/check-bundle-size.js)
[![license](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

---

## Installation

```bash
npm install pseudo-stack
# or
pnpm add pseudo-stack
```

**CDN (no install):**
```html
<script type="module">
  import PseudoKit from 'https://cdn.jsdelivr.net/npm/pseudo-stack/src/client/pseudo-kit-client.js';
</script>
```

---

## Quick Start (3 steps)

### 1. Create a component (`components/greeting.html`)

```html
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

### 2. Use it in your HTML page

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
    import PseudoKit from 'pseudo-stack';

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
```

**That's it.** No compilation, no bundler, no config.

---

## Component File Structure

Each component is a `.html` file with 3 blocks:

```html
<!-- 1. TEMPLATE (required) -->
<template>
  <article class="card">
    <slot></slot>  <!-- default slot -->
    <slot name="footer"></slot>  <!-- named slot -->
  </article>
</template>

<!-- 2. STYLE (optional) -->
<style>
  @layer components {
    @scope (card) {
      :scope { border: 1px solid #e0e0e0; border-radius: 8px; }
    }
  }
</style>

<!-- 3. SCRIPT (optional) -->
<script>
  // `el` = the host element
  // `state` = global reactive state
  // `emit` = dispatch events
  el.addEventListener('click', () => {
    emit(el, 'card:clicked', { id: el.dataset.id });
  });
</script>
```

---

## Key Features

| Feature | Example |
|---------|---------|
| **Slots** | `<card><p slot="footer">Footer</p></card>` |
| **Loops** | `<product-tile loop></product-tile>` → `PseudoKit.renderLoop('id', data)` |
| **State** | `PseudoKit.state.focusMode = true` → CSS: `:root[data-focus-mode]` |
| **Events** | `emit(el, 'name', detail)` |
| **SSR** | `import { renderComponent } from 'pseudo-stack/server'` |

---

## Examples

See [`/examples/`](examples/) for runnable demos:

| # | Example | Description |
|---|---------|-------------|
| 01 | Hello World | Minimal component |
| 02 | Slots | Default + named slots |
| 03 | Loops | Render lists from data |
| 04 | State | Reactive state + CSS |
| 05 | SSR | Server-side rendering |

Run examples:
```bash
pnpm serve:examples
# Open http://localhost:3008/01-hello-world.html
```

---

## Browser Support

| Browser | Minimum |
|---------|---------|
| Chrome | 118+ |
| Firefox | 128+ |
| Safari | 17.4+ |

Required: `adoptedStyleSheets`, `@scope`, `MutationObserver`, `<dialog>`, `popover`

---

## Component Library (optional)

Install `pseudo-stack-assets` for 61 pre-built components:

```bash
npm install pseudo-stack-assets
```

```javascript
import PseudoKit from 'pseudo-stack';
import { components } from 'pseudo-stack-assets';

for (const def of components) {
  PseudoKit.register(def);
}
PseudoKit.init();
```

---

## Documentation

- **Full API reference:** [`README-full.md`](README-full.md) (1500+ lines)
- **Examples:** [`/examples/`](examples/)
- **Changelog:** [`CHANGELOG.md`](CHANGELOG.md)

---

## License

MIT © 2026
