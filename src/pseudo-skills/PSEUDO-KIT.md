# PSEUDO-KIT — Vanilla HTML Component System

> Always read `SPEC.md` before this document.

---

## What is pseudo-kit?

Pseudo-kit is the native rendering layer of pseudo-HTML. It requires **no build step, no loader, no framework**. Custom tag names (`<panel>`, `<toolbar>`, `<chat-bubble>`…) are unknown elements to the browser — the browser renders them anyway, as inline boxes by default. The `<style>` block in `@layer components` targets them by tag name and gives them their layout and appearance.

The pseudo-HTML layout file **is** the pseudo-kit app. It renders directly in the browser as a functional wireframe.

---

## Core principle

```css
/* The browser renders unknown tags. CSS makes them real. */
@layer components {
  @scope (panel) {
    :scope { display: flex; flex-direction: column; overflow: hidden; }
  }
}
```

No registration. No `customElements.define()`. No JavaScript required for structure or layout.

---

## Component file anatomy

Each component lives in its own `.html` file. Three optional sections, always in this order:

```html
<!-- components/chat-bubble.html -->

<template>
  <!-- markup structure of the component -->
  <slot />
</template>

<style>
  @layer components {
    @scope (chat-bubble) {
      :scope {
        display: block;
        border-radius: 8px;
        padding: 8px 12px;
        background: var(--color-secondary);
      }
    }
  }
</style>

<!--
  Two script modes:

  A) Inline script — evaluated in component context via new Function().
     Has access to: el, state, emit, renderLoop, register.
     Use for simple component logic.
-->
<script>
  el.addEventListener('click', () => emit(el, 'select', { id: el.dataset.id }));
</script>

<!--
  B) Module script — dynamically imported via import().
     The module self-registers via PseudoKit.register(import.meta).
     No pre-declaration needed in the app bootstrap.
     Use when the component needs real ES module imports.
-->
<script type="module" src="./chat-bubble.js"></script>
```

```js
// components/chat-bubble.js  (mode B)
import PseudoKit from '../pseudo-kit-client.js';

// self-registration — name derived from filename: chat-bubble.js → 'chat-bubble'
PseudoKit.register(import.meta);

// component logic runs after registration
// access the element via document.querySelector or event delegation
```

**Mode A vs Mode B :**

| | Inline `<script>` | Module `<script type="module" src>` |
|---|---|---|
| ES module imports | ❌ | ✅ |
| Auto-registration | ❌ | ✅ |
| `el` available directly | ✅ | via DOM query |
| Pre-declaration required | depends on init order | ❌ never |
| Use for | simple logic, events | complex logic, dependencies |

---

## Global style — base for all components

The `<style>` block at the bottom of the layout file provides the base CSS for all components. It is the single source of truth for layout primitives and theme tokens.

```css
@layer base, layout, components, utils;

@layer base {
  :root {
    --color-bg:            #0f0f0f;
    --color-text:          #e5e5e5;
    --color-primary:       #3b82f6;
    --color-secondary:     #94a3b8;
    --color-accent:        #fbbf24;
    --color-complementary: #34d399;

    background: var(--color-bg);
    color:      var(--color-text);
  }

  :root:has(#theme-toggle:checked) {
    --color-bg:            #ffffff;
    --color-text:          #1a1a1a;
    --color-primary:       #2563eb;
    --color-secondary:     #64748b;
    --color-accent:        #f59e0b;
    --color-complementary: #10b981;
  }

  .primary        { background: var(--color-primary); }
  .primary-text   { color:      var(--color-primary); }
  .secondary      { background: var(--color-secondary); }
  .accent         { background: var(--color-accent); }
  .complementary  { background: var(--color-complementary); }
}

@layer layout {
  .row, row                 { display: flex; flex-direction: row; }
  .column, column           { display: flex; flex-direction: column; }
  .column.full-height,
  column.full-height        { height: 100%; }
  .grid, grid               { display: grid; }
  .cell, cell               { }
  .stack, stack             { display: grid; grid-template-areas: "stack"; }
  .stack > *, stack > *     { grid-area: stack; }
  .spacer, spacer           { flex: 1; }
}

@layer components {
  /* each component adds its @scope block here */
  /* or in its own component file <style> block */
}
```

---

## Component mapping

Every component declared in `<template>` with no `element="*"` gets a CSS block in `@layer components`.

| Pseudo-HTML component | CSS target | Default display |
|---|---|---|
| `toolbar` | `@scope (toolbar)` | `flex row` |
| `panel` | `@scope (panel)` | `flex column` |
| `tab-bar` | `@scope (tab-bar)` | `flex row` |
| `tab` | `@scope (tab)` | `inline-flex` |
| `overlay` | `@scope (overlay)` | `fixed, z-index: 100` |
| `chat-bubble` | `@scope (chat-bubble)` | `block, rounded` |
| `badge` | `@scope (badge)` | `inline-block, circle` |
| `spinner` | `@scope (spinner)` | `block, animation` |
| `text-zone` | `@scope (text-zone)` | `block` |
| `diff-view` | `@scope (diff-view)` | `flex column` |
| `timeline` | `@scope (timeline)` | `flex column` |
| `resize-handle` | `@scope (resize-handle)` | `block, cursor: col-resize` |
| `button-theme` | `@scope (button-theme)` | `inline, cursor: pointer` |

---

## props → HTML attributes

`props` from the pseudo-HTML descriptor map to HTML attributes on the tag. Boolean props become boolean attributes:

```html
<!-- pseudo-HTML -->
<panel id="editor-panel" default-width="55%" resizable>

<!-- renders as-is in pseudo-kit — no transformation needed -->
<panel id="editor-panel" default-width="55%" resizable>
```

CSS reads them via attribute selectors:

```css
@scope (panel) {
  :scope[resizable] { resize: horizontal; }
  :scope[collapsible] { /* collapsible styles */ }
}
```

---

## when-* → CSS :has() + state attributes

Prefer CSS over JS. Use `:has()` and `data-*` state attributes for conditional display:

```css
/* when-hidden="focus-mode is active" */
:root:has([data-state~="focus-mode"]) panel#ai-panel {
  display: none;
}

/* when-visible="tab-suggestions-active" */
panel#tab-content-suggestions {
  display: none;
}
:root:has(#tab-suggestions.active) panel#tab-content-suggestions {
  display: flex;
}
```

When `:has()` cannot express the condition, use a minimal JS state toggle:

```js
// minimal state: toggle a data attribute on :root
document.documentElement.dataset.state = 'focus-mode'
// CSS :has([data-state~="focus-mode"]) takes over
```

---

## Slots avec données — data-* forwarding

Un `<slot>` peut déclarer des `data-*` pour indiquer quelles données il met à disposition
du contenu injecté par l'instance. Ces attributs sont automatiquement copiés sur chaque
enfant injecté — sauf si l'enfant les définit déjà lui-même.

**Règle : le slot déclare, le parent peut surcharger, le composant ne force rien.**

```html
<!-- components/chat-bubble.html -->
<template>
  <div class="bubble-body">
    <slot data-entity="" data-confidence="" data-note="" />
  </div>
</template>
```

```html
<!-- instance sans surcharge — reçoit les data-* vides du slot -->
<chat-bubble role="coherence-alert">
  <span>Aria appears in two places at once.</span>
  <!-- → <span data-entity="" data-confidence="" data-note="">...</span> -->
</chat-bubble>

<!-- instance avec surcharge partielle — data-entity est fourni, les autres viennent du slot -->
<chat-bubble role="coherence-alert">
  <span data-entity="Aria" data-confidence="0.9">Aria appears in two places at once.</span>
  <!-- → data-entity et data-confidence conservés, data-note ajouté depuis le slot -->
</chat-bubble>
```

CSS peut alors consommer les `data-*` pour le style :

```css
@scope (chat-bubble) {
  :scope[role="coherence-alert"] slot > * { background: var(--color-secondary); }

  /* via les data-* sur l'enfant injecté */
  :scope [data-confidence="high"] { background: var(--color-accent); }
  :scope [data-confidence="low"]  { opacity: 0.5; }
}
```

Le même comportement est reproduit côté serveur dans `renderComponent_server()`.

---

## loop="" → JS template cloning

`loop=""` is the one pattern that requires JavaScript — the browser cannot iterate natively:

```html
<column id="coherence-alerts">
  <chat-bubble role="coherence-alert" loop="" />
</column>
```

```js
// pseudo-kit loop pattern
function renderLoop(containerId, data) {
  const container = document.getElementById(containerId)
  const template  = container.querySelector('[loop]')
  const fragment  = document.createDocumentFragment()

  data.forEach(item => {
    const el = template.cloneNode(true)
    el.removeAttribute('loop')
    // bind data fields to attributes or text content
    Object.entries(item).forEach(([key, val]) => {
      el.dataset[key] = val
    })
    fragment.appendChild(el)
  })

  template.replaceWith(fragment)
}
```

---

## behavior → JS

`behavior` free-text maps to vanilla JS. Keep it minimal and close to the element:

| behavior | JS pattern |
|---|---|
| "Autosaves every 30s" | `setInterval(() => save(), 30000)` |
| "Triggers ai-spinner on change" | `editor.addEventListener('input', showSpinner)` |
| "Click opens ai-panel" | `badge.addEventListener('click', () => aiPanel.removeAttribute('hidden'))` |
| "Draggable" | `PointerEvent` + `setPointerCapture` |
| "Resizable" | `ResizeObserver` or pointer drag on `resize-handle` |

---

## on="*" → CustomEvent

`on` events from the pseudo-HTML descriptor map to `CustomEvent` dispatched on the element:

```js
// on="accept:string; reject:string" on diff-view
diffView.dispatchEvent(new CustomEvent('accept', {
  bubbles: true,
  detail: { id: changeId }
}))

// listener
diffView.addEventListener('accept', (e) => {
  console.log('accepted:', e.detail.id)
})
```

---

## theme toggle

No JS needed. The hidden checkbox + `:has()` handles everything:

```html
<input type="checkbox" id="theme-toggle" hidden />
<button-theme><label for="theme-toggle">Toggle theme</label></button-theme>
```

---

## File structure

```
project/
  index.html              ← app entry point
  components/
    panel.html
    toolbar.html
    chat-bubble.html
    diff-view.html
    tab-bar.html
    tab.html
    overlay.html
    badge.html
    spinner.html
    text-zone.html
    timeline.html
    chart.html
    button-theme.html
    resize-handle.html
  layouts/
    screen-main.html
    screen-onboarding.html
    screen-review.html
    panel-editor.html
    panel-ai.html
    panel-tab-suggestions.html
    panel-tab-coherence.html
    panel-tab-style.html
    panel-tab-history.html
  js/
    loop.js               ← renderLoop utility
    state.js              ← minimal state: data-state on :root
    events.js             ← CustomEvent helpers
```

---

## Naming convention

File names use a **hierarchical prefix** as a visual namespace. The name reads left to right, from most general to most specific. The filesystem self-documents — all `screen-*` files together, all `panel-*` files together.

```
screen-*     Full screen, app root level
panel-*      Major container within a screen
section-*    Semantic zone within a panel
card-*       Autonomous content unit
```

**Rules:**
- Prefix is mandatory — it defines the scope of the layout.
- Words are separated by `-`.
- No ambiguity: `panel-ai.html` and `panel-editor.html` are clearly siblings, not children.
- A file that could fit two prefixes needs to be split or promoted.

The full prefix library will be defined in the pseudo-kit component library (out of scope here).

---

## What needs JS vs what doesn't

| Feature | CSS only | JS needed |
|---|---|---|
| Theme toggle | ✅ `:has(#theme-toggle:checked)` | |
| Tab switching | ✅ `:has(.tab.active)` | minimal for `.active` toggle |
| Panel visibility | ✅ `:has([data-state])` | minimal for state write |
| loop="" rendering | | ✅ template cloning |
| Drag / resize | | ✅ PointerEvent |
| Autosave | | ✅ setInterval |
| CustomEvent dispatch | | ✅ |
| `@scope` isolation | ✅ | |
| `@layer` cascade | ✅ | |
