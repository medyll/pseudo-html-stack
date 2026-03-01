# pseudo-html-kit

> Vanilla HTML component system. No build step. No framework. No dependencies.

pseudo-html-kit is a runtime for **pseudo-HTML** — a language-agnostic interface descriptor that bridges UI specification and working code. Write your UI as annotated HTML, render it in the browser as-is, generate real components for any framework, or serve it via SSR from Node.js.

---

## Table of contents

- [What is pseudo-HTML?](#what-is-pseudo-html)
- [What is pseudo-html-kit?](#what-is-pseudo-html-kit)
- [How it works](#how-it-works)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Component files](#component-files)
  - [Anatomy](#anatomy)
  - [Script modes](#script-modes)
  - [Self-registration](#self-registration)
- [Slots](#slots)
  - [Default slot](#default-slot)
  - [Named slots](#named-slots)
  - [Slot data forwarding](#slot-data-forwarding)
  - [pk-slot wrapper](#pk-slot-wrapper)
- [Loop rendering](#loop-rendering)
- [Reactive state](#reactive-state)
- [Events](#events)
- [Theme system](#theme-system)
- [CSS architecture](#css-architecture)
  - [@layer](#layer)
  - [@scope](#scope)
  - [CSSStyleSheet — no DOM injection](#cssstylesheet--no-dom-injection)
- [Layout elements](#layout-elements)
- [File naming conventions](#file-naming-conventions)
- [Canvas → components workflow](#canvas--components-workflow)
  - [Running the normalizer](#running-the-normalizer)
  - [Running the validator](#running-the-validator)
- [Guidelines](#guidelines)
  - [Taxonomy](#taxonomy)
  - [File naming](#file-naming)
  - [IDs and attributes](#ids-and-attributes)
- [Server-side rendering (SSR)](#server-side-rendering-ssr)
  - [Rendering a component](#rendering-a-component)
  - [State hydration](#state-hydration)
  - [CSS generation](#css-generation)
  - [Layout validation](#layout-validation)
- [Client API](#client-api)
- [Server API](#server-api)
- [Shared API](#shared-api)
- [Project structure](#project-structure)
- [Tests](#tests)
- [Browser support](#browser-support)
- [Framework references](#framework-references)
- [License](#license)

---

## What is pseudo-HTML?

Pseudo-HTML is a language-agnostic interface descriptor. It describes a UI — its components, their props, data, events, and behaviour — without styling or business logic.

It is **not** valid HTML. It borrows HTML syntax for readability, but its semantics are its own. It is consumed by:
- AI code generators (LLM reads the file and generates real components)
- Human developers (as a single source of truth for the UI)
- pseudo-html-kit (renders it directly in the browser as a functional wireframe)

A pseudo-HTML file has this structure:

```html
<!-- [spec] header: attribute model, type grammar, state refs -->

<template>
  <!-- component declarations -->
  <chat-bubble
    props="role:string"
    data="entity:string; confidence:number"
    on="select:string"
    layer="components"
    component-role="Alert bubble with confidence level"
  />
</template>

<!-- screen implementations -->
<column id="app-root">
  <chat-bubble role="coherence-alert" loop="" />
</column>

<!-- base styles -->
<style>
  @layer base, layout, components, utils;
  /* ... */
</style>
```

See `docs/SPEC.md` for the full attribute model and type grammar.

---

## What is pseudo-html-kit?

pseudo-html-kit is the runtime layer that makes pseudo-HTML functional:

- **Browser**: observes the DOM, loads `.html` component files, stamps templates, manages CSS without DOM injection, handles slots, loops, state, and events.
- **Server (Node.js)**: renders components to HTML strings, generates CSS, serializes state for hydration, validates layout files.
- **Shared**: a registry and state model that works in both environments.

---

## How it works

1. Custom tags (`<panel>`, `<chat-bubble>`, `<toolbar>`…) are unknown to the browser — it renders them as inline elements by default.
2. A `MutationObserver` watches the DOM for registered component names.
3. When a component appears, pseudo-html-kit fetches its `.html` file, parses the `<template>`, `<style>`, and `<script>` blocks, stamps the template into the element, and injects CSS into the document's adopted stylesheet — **no `<style>` tags added to the DOM**.
4. Conditional visibility is expressed as CSS `:has()` reading `data-*` attributes on `:root` — set by `PseudoKit.state`, no JS conditionals needed.
5. On the server, components render to HTML strings with `<pk-slot>` wrappers. The client detects these and skips re-stamping.

---

## Installation

```bash
npm install pseudo-html-kit
```

Requires Node.js 22+ for the server runtime.

---

## Quick start

### index.html

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="styles/base.css" />
</head>
<body>

<input type="checkbox" id="theme-toggle" hidden />

<column id="app-root">
  <toolbar id="main-toolbar">
    <text label="My App" />
    <button-theme />
  </toolbar>

  <column id="alerts">
    <chat-bubble role="alert" loop=""></chat-bubble>
  </column>
</column>

<script type="module">
  import PseudoKit from 'pseudo-html-kit';

  PseudoKit
    .register({ name: 'toolbar',      src: 'components/toolbar.html' })
    .register({ name: 'chat-bubble',  src: 'components/chat-bubble.html' })
    .register({ name: 'button-theme', src: 'components/button-theme.html' })
    .init();

  PseudoKit.renderLoop('alerts', [
    { entity: 'Aria', confidence: '0.9' },
    { entity: 'Bram', confidence: '0.5' },
  ]);
</script>

</body>
</html>
```

---

## Component files

### Anatomy

Each component is a single `.html` file with three optional sections:

```html
<!-- components/chat-bubble.html -->

<template>
  <!-- The component's internal markup structure -->
  <!-- <slot /> marks where instance-level content is injected -->
  <div class="bubble-body">
    <slot data-entity="" data-confidence="" />
  </div>
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

      :scope[role="coherence-alert"][data-confidence="high"] {
        background: var(--color-accent);
      }
    }
  }
</style>

<script>
  // Inline script — runs in component context
  // Available: el, state, emit, renderLoop, register
  el.addEventListener('click', () => emit(el, 'select', { id: el.dataset.id }));
</script>
```

### Script modes

Two script modes are supported:

| Mode | Syntax | Use for |
|---|---|---|
| **Inline** | `<script>` | Simple logic, event listeners, `el` available directly |
| **Module** | `<script type="module" src="./component.js">` | ES module imports, self-registration |

**Inline script** is evaluated via `new Function()` with `el`, `state`, `emit`, `renderLoop`, and `register` in scope.

**Module script** is loaded via dynamic `import()`. The module runs in standard ESM scope and is expected to self-register.

### Self-registration

A component can register itself without any bootstrap configuration:

```html
<!-- components/chat-bubble.html -->
<template>...</template>
<style>...</style>
<script type="module" src="./chat-bubble.js"></script>
```

```js
// components/chat-bubble.js
import PseudoKit from 'pseudo-html-kit';

// Name is derived from the filename: chat-bubble.js → 'chat-bubble'
PseudoKit.register(import.meta);

// Component logic runs after registration
document.querySelectorAll('chat-bubble').forEach(el => {
  el.addEventListener('click', () => PseudoKit.emit(el, 'select', { id: el.dataset.id }));
});
```

Manual registration works the same way — **first registration wins**, duplicates are ignored with a warning. Register before `init()` to ensure the component is known before DOM observation starts:

```js
PseudoKit
  .register({ name: 'chat-bubble', src: 'components/chat-bubble.html' })
  .init();
```

---

## Slots

### Default slot

```html
<!-- template -->
<div class="panel-body">
  <slot />
</div>

<!-- instance -->
<panel>
  <text-zone id="editor" />   <!-- injected into <slot /> -->
</panel>
```

### Named slots

Children with a `slot="name"` attribute are routed to the matching `<slot name="name">`. All other children go to the default slot.

```html
<!-- template -->
<div class="toolbar-body">
  <slot name="start" />
  <spacer />
  <slot name="end" />
</div>

<!-- instance -->
<toolbar>
  <text slot="start" label="My App" />     <!-- → slot name="start" -->
  <button slot="end" action="settings" />  <!-- → slot name="end" -->
  <badge />                                <!-- → default slot (if any) -->
</toolbar>
```

### Slot data forwarding

A `<slot>` can declare `data-*` attributes. These are automatically copied to every injected child element — unless the child already defines that attribute.

```html
<!-- template declares what data the slot provides -->
<slot data-entity="" data-confidence="" data-note="" />
```

```html
<!-- instance — children receive the data-* from the slot -->
<chat-bubble>
  <span>Aria appears twice</span>
  <!-- becomes: <span data-entity="" data-confidence="" data-note="">... -->
</chat-bubble>

<!-- override: parent-provided value wins -->
<chat-bubble>
  <span data-entity="Aria" data-confidence="0.9">Aria appears twice</span>
  <!-- data-entity and data-confidence preserved, data-note added from slot -->
</chat-bubble>
```

Rule: **slot declares, parent overrides, component never forces**.

### pk-slot wrapper

Every resolved slot is wrapped in a `<pk-slot>` element with `display: contents`. This element is invisible to layout but carries slot metadata in the DOM for debugging and CSS targeting.

```html
<pk-slot
  style="display: contents"
  data-slot-component="chat-bubble"
  data-slot-name="default"
  data-slot-props='{"data-entity":"","data-confidence":""}'
>
  <span data-entity="Aria">...</span>
</pk-slot>
```

Useful for targeting in CSS or DevTools:

```css
/* Target all slots in a chat-bubble */
pk-slot[data-slot-component="chat-bubble"] { }
```

---

## Loop rendering

`loop=""` on a child element marks it as a repeated template. It is replaced by cloned instances once data is provided.

```html
<column id="coherence-alerts">
  <chat-bubble role="coherence-alert" loop=""></chat-bubble>
</column>
```

```js
PseudoKit.renderLoop('coherence-alerts', [
  { entity: 'Aria',  discrepancy_type: 'location', confidence: '0.9', note: 'Ch. 3' },
  { entity: 'Bram',  discrepancy_type: 'timeline',  confidence: '0.5', note: 'Ch. 7' },
]);
```

Each item's fields are bound as `data-*` attributes on the clone. Newly created elements are resolved as pseudo-html-kit components automatically.

---

## Reactive state

pseudo-html-kit provides a reactive state proxy backed by `data-*` attributes on `:root`. Writing a value updates the DOM attribute; CSS `:has()` reacts immediately.

```js
// Write
PseudoKit.state.focusMode = true;
// → document.documentElement.setAttribute('data-focus-mode', '')

PseudoKit.state.focusMode = false;
// → document.documentElement.removeAttribute('data-focus-mode')

PseudoKit.state.step = '2b';
// → document.documentElement.setAttribute('data-step', '2b')

// Read
console.log(PseudoKit.state.focusMode); // true / false
```

camelCase keys are converted to kebab-case attributes:
- `focusMode` → `data-focus-mode`
- `tabSuggestionsActive` → `data-tab-suggestions-active`
- `aiRunning` → `data-ai-running`

CSS consumes the state:

```css
/* Hide AI panel when focus mode is active */
:root[data-focus-mode] panel#ai-panel {
  display: none;
}

/* Show suggestions tab content */
panel#tab-content-suggestions {
  display: none;
}
:root[data-tab-suggestions-active] panel#tab-content-suggestions {
  display: flex;
}
```

State is hydrated from SSR automatically — see [State hydration](#state-hydration).

---

## Events

Components dispatch `CustomEvent` instances that bubble up the DOM. This matches the `on="eventName:payloadType"` declarations in pseudo-HTML.

```js
// In a component script — dispatch
emit(el, 'accept', { id: changeId });

// Anywhere in the app — listen
document.addEventListener('accept', (e) => {
  console.log('accepted:', e.detail.id);
});

// Or on the component itself
diffView.addEventListener('accept', (e) => { ... });
```

```js
// Via PseudoKit public API
PseudoKit.emit(el, 'reject', { id: changeId });
```

Events are `bubbles: true, composed: true` by default.

---

## Theme system

Theme switching requires zero JavaScript. A hidden checkbox drives the theme via CSS `:has()`:

```html
<!-- App root — place before everything -->
<input type="checkbox" id="theme-toggle" hidden />

<!-- button-theme component is a <label> bound to the checkbox -->
<button-theme />
<!-- renders as: <label for="theme-toggle">Toggle theme</label> -->
```

```css
/* Dark theme — default */
:root {
  --color-bg:            #0f0f0f;
  --color-text:          #e5e5e5;
  --color-primary:       #3b82f6;
  --color-secondary:     #94a3b8;
  --color-accent:        #fbbf24;
  --color-complementary: #34d399;
}

/* Light theme — toggled by checkbox */
:root:has(#theme-toggle:checked) {
  --color-bg:            #ffffff;
  --color-text:          #1a1a1a;
  --color-primary:       #2563eb;
  --color-secondary:     #64748b;
  --color-accent:        #f59e0b;
  --color-complementary: #10b981;
}
```

---

## CSS architecture

### @layer

All styles are organized into four cascade layers:

```css
@layer base, layout, components, utils;
```

| Layer | Content |
|---|---|
| `base` | CSS vars, theme tokens, resets |
| `layout` | Layout primitives: `row`, `column`, `grid`, `stack`… |
| `components` | Component styles via `@scope` |
| `utils` | Utility classes, populated by the implementation |

### @scope

Each component's styles are scoped using `@scope` to prevent leaking:

```css
@layer components {
  @scope (chat-bubble) {
    :scope {
      display: block;
      border-radius: 8px;
    }
    :scope[role="coherence-alert"] {
      border-left: 3px solid var(--color-accent);
    }
  }
}
```

### CSSStyleSheet — no DOM injection

Component styles are inserted into the document via a single `CSSStyleSheet` adopted on `document.adoptedStyleSheets`. No `<style>` tags are ever added to the DOM. Rules are inserted or replaced in-place using `insertRule` / `deleteRule` — each component's `@scope` block occupies a stable index.

---

## Layout elements

Layout elements are **native HTML primitives** dressed with CSS. They are not components — no `.html` file needed. They are declared in the pseudo-HTML `<template>` with `element="*"` and no props.

```css
.row, row                  { display: flex; flex-direction: row; }
.column, column            { display: flex; flex-direction: column; }
column.full-height         { height: 100%; }
.grid, grid                { display: grid; }
.stack, stack              { display: grid; grid-template-areas: "stack"; }
.stack > *, stack > *      { grid-area: stack; }
.spacer, spacer            { flex: 1; }
pk-slot                    { display: contents; }
```

Dual selectors (`.row, row`) allow the pseudo-HTML file to render directly in the browser as a wireframe.

---

## File naming conventions

See [Guidelines → File naming](#file-naming).

---

## Canvas → components workflow

The canvas is the single source of truth. Components are derived from it — never written from scratch without a canvas.

```
pseudo-canvas-demo.html
  │
  ▼
canvas-validator (programmatic)        ← deterministic, no LLM
  ├── validates spec conformity
  │     props/data/on follow type grammar
  │     layer values are valid
  ├── checks component-registry completeness
  │     every tag used in frames is declared
  │     every declared component is actually used
  └── detects inter-frame inconsistencies
        undeclared props used on instances
        loop="" without data declaration
        missing role on instances
  │
  ▼ ValidationResult
    ├── errors[]       ← must fix before generating
    ├── warnings[]     ← review before generating
    ├── manifest[]     ← structured component list (JSON)
    └── manifestText   ← human/LLM-readable summary (Markdown)
  │
  ▼
LLM generation pass
  receives: manifest + canvas + target framework skill
  produces: component files (chat-bubble.html, panel.html…)
```

### Running the normalizer

Before validating, run the normalizer to auto-fix simple issues:

```bash
# Writes pseudo-canvas-demo.normalized.html alongside the original
npm run normalize pseudo-canvas-demo.html

# Overwrites the original in place
npm run normalize:write pseudo-canvas-demo.html

# Node API
import { normalizeCanvas } from 'pseudo-html-kit/normalizer';

const result = await normalizeCanvas('./pseudo-canvas-demo.html');
// or: await normalizeCanvas('./pseudo-canvas-demo.html', { inPlace: true });

console.log(result.changes);
// → ['Renamed 2× `fields` → `data`', 'Added `component-role=""` to `<button>`', ...]

console.log(result.writtenTo); // path of the output file
```

The normalizer is **idempotent** — running it twice produces no further changes.

### What the normalizer fixes

| Fix | Description |
|---|---|
| `fields` → `data` | Obsolete attribute rename |
| `visible-when` → `when-visible` | Obsolete attribute rename |
| `hidden-when` → `when-hidden` | Obsolete attribute rename |
| Add `component-role=""` | Missing on registry declarations — value left empty to fill in |
| Add `role=""` | Missing on frame instances — value left empty to fill in |

### Recommended workflow

```
normalize   →   validate   →   LLM generation
```

Normalize first to fix mechanical errors, then validate to confirm the canvas is generation-ready, then pass `manifestText` to the LLM.



```bash
# Text output (Markdown manifest — pass to LLM)
npm run validate pseudo-canvas-demo.html

# JSON output (structured manifest — for programmatic use)
npm run validate:json pseudo-canvas-demo.html

# Node API
import { validateCanvas } from 'pseudo-html-kit/validator';

const result = await validateCanvas('./pseudo-canvas-demo.html');

if (!result.valid) {
  result.errors.forEach(e => console.error('ERROR:', e));
  process.exit(1);
}

result.warnings.forEach(w => console.warn('WARN:', w));

// Pass to LLM
console.log(result.manifestText);

// Or use the structured manifest
result.manifest.forEach(entry => {
  console.log(entry.name, entry.instances.length, 'instances');
});
```

### Manifest format

The `manifestText` is a Markdown document designed to be injected directly into an LLM prompt. It includes for each component:

- `component-role` — what the component does
- `props`, `data`, `on` — typed contracts
- `layer` — CSS layer
- `instances` — where and how it's used, per frame, with roles

The `manifest` JSON array follows `ManifestEntry[]`:

```ts
interface ManifestEntry {
  name:           string
  isLayoutElement: boolean
  props:          string | null   // raw: "id:string; label:string?"
  data:           string | null
  on:             string | null
  layer:          string | null
  componentRole:  string | null
  note:           string | null
  typesReference: string | null
  instances: Array<{
    name:    string
    frameId: string              // which <frame> the instance is in
    role:    string | null
    attrs:   Record<string, string | boolean>
    loop:    boolean
  }>
}
```

### What the validator checks

| Check | Type | Description |
|---|---|---|
| Type grammar | Error | `props`/`data`/`on` fields follow `name:type` format |
| Valid layers | Error | `layer` is one of `base`, `layout`, `components`, `utils` |
| Undeclared tags | Error | Tags used in frames but missing from `<component-registry>` |
| Unused declarations | Warning | Declared but never used in any frame |
| Missing `component-role` | Warning | Recommended for LLM context |
| Missing instance `role` | Warning | Every instance should have a contextual role |
| `loop=""` without `data` | Warning | Loop elements need a data contract |
| Undeclared props on instances | Warning | Instance uses a prop not in the registry declaration |
| Layout elements with props | Warning | `element="*"` components should not declare props |

---



These guidelines apply to both **developers** using pseudo-html-kit and **LLMs** generating code from a canvas. They define the shared vocabulary of the system.

---

### Taxonomy

The system has three distinct file types. Never mix their roles.

| Type | File | Purpose |
|---|---|---|
| **Canvas** | `pseudo-canvas-*.html` | Declarative source of truth. Contains `<component-registry>` + `<frame>` screens. Consumed by LLMs and developers. Never executed directly. |
| **Component** | `components/*.html` | Single component runtime file. Contains `<template>` (markup) + `<style>` + `<script>`. Loaded and stamped by pseudo-html-kit at runtime. |
| **Layout element** | CSS only | Native HTML primitives (`row`, `column`, `grid`…). No `.html` file. Declared in `<component-registry>` with `element="*"`. |

**Canvas structure:**

```
pseudo-canvas-demo.html
  ├── [spec:*] header comments     ← rules, conventions, state refs
  ├── <component-registry>         ← declares every component and layout element
  │     <chat-bubble props="..." data="..." on="..." />
  │     <panel props="..." />
  │     …
  └── <frame id="main-screen">    ← one frame per screen
  └── <frame id="review-screen">
```

**Component file structure:**

```
components/chat-bubble.html
  ├── <template>    ← internal markup, stamped into the DOM at runtime
  ├── <style>       ← @layer components { @scope (chat-bubble) { … } }
  └── <script>      ← inline or module, runs after stamp
```

**Key distinction — `<component-registry>` vs `<template>`:**

- `<component-registry>` is a canvas-level declaration zone. It describes what a component *is* — its props, data contract, events. It is read by LLMs, never by the browser runtime.
- `<template>` inside a component file is a standard `HTMLTemplateElement`. It defines what a component *renders* — its internal DOM structure. It is read and stamped by pseudo-html-kit at runtime.

**Frames:**

Each screen in a canvas is a `<frame>`. The name comes from Figma — a frame is a root-level view container. One canvas can contain multiple frames; each frame is an independent screen.

```html
<frame id="main-screen" role="Main writing screen">
  …
</frame>

<frame id="review-screen" role="Review mode screen">
  …
</frame>
```

---

### File naming

File names use a **hierarchical prefix** as a visual namespace. Read left to right: most general → most specific. The filesystem becomes self-documenting — all `screen-*` together, all `panel-*` together.

```
pseudo-canvas-demo.html        ← canvas at repo root

components/                    ← reusable runtime components
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

layouts/                       ← decomposed screens and panels (optional)
  screen-main.html
  screen-review.html
  panel-editor.html
  panel-ai.html
  panel-tab-suggestions.html
  section-coherence-alerts.html
  card-harden-point.html
```

| Prefix | Scope | Example |
|---|---|---|
| `pseudo-canvas-*` | Full app canvas | `pseudo-canvas-demo.html` |
| `screen-*` | Full screen / root frame | `screen-main.html` |
| `panel-*` | Major container within a screen | `panel-editor.html` |
| `section-*` | Semantic zone within a panel | `section-coherence-alerts.html` |
| `card-*` | Autonomous content unit | `card-harden-point.html` |

Rules:
- **kebab-case always** — no camelCase, no underscores in filenames
- **No generic names** — `panel.html` is fine for the reusable component; `panel-editor.html` is the specific instance
- **Prefix determines location** — `screen-*` files belong in `layouts/`, components without prefix belong in `components/`

---

### IDs and attributes

**Element IDs** — kebab-case, descriptive, unique within the canvas:

```html
<!-- ✅ -->
<panel id="editor-panel" />
<toolbar id="main-toolbar" />
<panel id="tab-content-suggestions" />

<!-- ❌ -->
<panel id="panel1" />
<panel id="editorPanel" />
<panel id="p" />
```

**`role` attribute** — mandatory on every instance, describes purpose in context:

```html
<!-- ✅ — contextual purpose -->
<chat-bubble role="coherence-alert" />
<button role="Exit review mode" />
<text role="Section header" />

<!-- ❌ — too generic, same as component-role -->
<chat-bubble role="bubble" />
<button role="button" />
```

**`props` vs `data`** — the most important distinction in the system:

| | `props` | `data` |
|---|---|---|
| Set by | Parent at render time | App state at runtime |
| Changes at runtime? | No | Yes |
| Example | `label`, `action`, `position` | `value`, `confidence`, `entity` |
| Rule | If a parent configures it → `props` | If the app reads/writes it → `data` |

**`when-*` attributes** — always on instances, never in `<component-registry>`:

```html
<!-- ✅ -->
<panel id="ai-panel" when-hidden="focus-mode is active" />
<spinner when-visible="ai-running" />

<!-- ❌ — when-* belongs on instances, not declarations -->
<panel props="..." when-hidden="..." />  <!-- in component-registry -->
```

**`id` on layout elements** — layout elements (`row`, `column`, `spacer`…) only get an `id` when they are a named structural zone:

```html
<!-- ✅ — named structural zone -->
<row id="main-body" role="Main body: editor + AI panel">

<!-- ✅ — anonymous layout, no id needed -->
<row>
  <button action="accept-all" />
</row>
```

**Actions** — `action` values on `<button>` use kebab-case verbs:

```html
<!-- ✅ -->
<button action="launch-review" />
<button action="exit-review" />
<button action="accept-all" />

<!-- ❌ -->
<button action="launchReview" />
<button action="launch_review" />
<button action="Launch Review" />
```

---

## Server-side rendering (SSR)

```js
import PseudoKitServer from 'pseudo-html-kit/server';
```

### Rendering a component

```js
PseudoKitServer.register({ name: 'chat-bubble', src: './components/chat-bubble.html' });

const html = await PseudoKitServer.renderComponent(
  'chat-bubble',                                  // component name
  { role: 'coherence-alert' },                    // props → HTML attributes
  '<span data-entity="Aria">Aria appears twice</span>', // children → injected into slot
  './components'                                  // base path for resolving files
);
```

Output:

```html
<chat-bubble role="coherence-alert">
  <div class="bubble-body">
    <pk-slot style="display:contents"
             data-slot-component="chat-bubble"
             data-slot-name="default"
             data-slot-props='{"data-entity":"","data-confidence":""}'>
      <span data-entity="Aria" data-confidence="">Aria appears twice</span>
    </pk-slot>
  </div>
</chat-bubble>
```

The client detects the `<pk-slot>` and skips re-stamping. Scripts are evaluated client-side after hydration.

### State hydration

```js
// Server: serialize state into the HTML response
const stateTag = PseudoKitServer.serializeState({
  tabCoherenceActive: true,
  tabSuggestionsActive: false,
});

// Inject before </body>:
// <script id="pk-state" type="application/json">{"focusMode":false,"tabCoherenceActive":true,...}</script>
```

The client reads the tag automatically on init and applies the state to `:root` before rendering:

```js
// Client automatically calls deserializeFromTag_shared() on init
// No manual setup needed
PseudoKit.init();
```

### CSS generation

Generates a single CSS string from all registered component style blocks:

```js
PseudoKitServer.register({ name: 'chat-bubble', src: './components/chat-bubble.html' });
PseudoKitServer.register({ name: 'panel',       src: './components/panel.html' });

const css = await PseudoKitServer.generateCSS('./components');
await writeFile('dist/components.css', css, 'utf-8');
```

### Layout validation

Validates a pseudo-HTML layout file against the registered component registry:

```js
const result = await PseudoKitServer.validate('./pseudo-canvas-demo.html');

if (!result.valid) {
  result.errors.forEach(e => console.error('ERROR:', e));
}
result.warnings.forEach(w => console.warn('WARN:', w));
```

Checks:
- Every custom tag used in the layout is registered or a known layout element
- `loop=""` elements have a data-bound parent (warning only)

---

## Client API

### `PseudoKit.register(input)`

Registers a component. Returns `PseudoKit` for chaining.

```js
// Manual
PseudoKit.register({ name: 'panel', src: 'components/panel.html' });

// Auto — from inside the component file
PseudoKit.register(import.meta); // name derived from filename
```

### `PseudoKit.init([root])`

Starts the runtime. Begins DOM observation and resolves existing components.

```js
PseudoKit.init();                                  // observe document.body
PseudoKit.init(document.getElementById('app-root')); // observe from a specific root
```

Returns the `MutationObserver` instance.

### `PseudoKit.renderLoop(containerId, data)`

Renders a `loop=""` template with a data array.

```js
PseudoKit.renderLoop('alerts', [
  { entity: 'Aria', confidence: '0.9' },
]);
```

### `PseudoKit.emit(el, eventName, [detail])`

Dispatches a `CustomEvent` from an element.

```js
PseudoKit.emit(el, 'accept', { id: '42' });
```

### `PseudoKit.state`

Reactive state proxy. See [Reactive state](#reactive-state).

---

## Server API

### `PseudoKitServer.register(input)`

Same as client. Returns `PseudoKitServer` for chaining.

### `PseudoKitServer.resolvePath(src, [base])`

Resolves a `file://` URL or relative path to an absolute filesystem path.

```js
PseudoKitServer.resolvePath('file:///project/components/panel.html');
// → '/project/components/panel.html'

PseudoKitServer.resolvePath('components/panel.html', '/project');
// → '/project/components/panel.html'
```

### `PseudoKitServer.renderComponent(name, props, children, [base])`

Renders a component to an HTML string. See [Rendering a component](#rendering-a-component).

### `PseudoKitServer.serializeState([state])`

Returns a `<script id="pk-state" type="application/json">` tag. See [State hydration](#state-hydration).

### `PseudoKitServer.generateCSS([base])`

Generates concatenated CSS from all registered components. See [CSS generation](#css-generation).

### `PseudoKitServer.validate(layoutPath)`

Validates a pseudo-HTML layout file. See [Layout validation](#layout-validation).

---

## Shared API

```js
import { register_shared, lookup_shared, all_shared, isRegistered_shared, reset_shared } from 'pseudo-html-kit/shared';
import { serialize_shared, serializeToTag_shared, deserialize_shared, deserializeFromTag_shared, merge_shared, defaultState_shared } from 'pseudo-html-kit/shared';
```

### Registry

| Function | Description |
|---|---|
| `register_shared(input)` | Register a component (manual or `import.meta`) |
| `lookup_shared(name)` | Get a component definition by name |
| `all_shared()` | Get all registered definitions |
| `isRegistered_shared(name)` | Check if a component is registered |
| `reset_shared()` | Clear the registry (tests only) |

### State

| Function | Description |
|---|---|
| `serialize_shared(state)` | Serialize state to JSON string |
| `serializeToTag_shared(state)` | Serialize state to `<script>` tag HTML |
| `deserialize_shared(json)` | Parse JSON to AppState |
| `deserializeFromTag_shared()` | Read state from `<script id="pk-state">` in DOM |
| `merge_shared(current, patch)` | Merge a partial patch into a state object |
| `defaultState_shared()` | Return a fresh copy of the default state |

---

## Project structure

```
pseudo-html-kit/
  src/
    shared/
      registry-shared.js           ← component registry (client + server)
      state-shared.js              ← state model + serialization
      index.js                     ← shared exports
    client/
      pseudo-kit-client.js         ← browser runtime
    server/
      pseudo-kit-server.js         ← Node.js SSR runtime
      canvas-validator.js          ← canvas parser + manifest generator
      canvas-normalize.js          ← canvas auto-corrector
  tests/
    registry-shared.test.js        ← node:test
    state-shared.test.js           ← node:test
    pseudo-kit-server.test.js      ← node:test
    pseudo-kit-client.client.test.js  ← vitest + happy-dom
  docs/
    SPEC.md                        ← pseudo-HTML full specification
    PSEUDO-KIT.md                  ← component system reference
    REACT.md                       ← pseudo-HTML → React mapping
    SVELTE.md                      ← pseudo-HTML → Svelte 5 mapping
    pseudo-svelte-5-reference.md   ← Svelte 5 non-regression log
  pseudo-canvas-demo.html          ← demo canvas (Sive app)
  SKILL.md                         ← LLM skill entry point
  vitest.config.js
  package.json
  README.md
  .gitignore
```

---

## Tests

```bash
# Node.js tests — shared + server (no dependencies)
npm test

# Client tests — requires vitest + happy-dom
npm install --save-dev vitest happy-dom
npm run test:client

# All tests
npm run test:all

# Coverage (client)
npm run test:coverage
```

Test coverage targets: **100%** lines, functions, branches, statements on all modules.

| File | Runner | Tests |
|---|---|---|
| `registry-shared.js` | `node:test` | 30 |
| `state-shared.js` | `node:test` | 33 |
| `pseudo-kit-server.js` | `node:test` | 37 |
| `pseudo-kit-client.js` | Vitest + happy-dom | ~50 |

---

## Browser support

| Browser | Minimum version | Key features required |
|---|---|---|
| Chrome | 105+ | `@scope`, `CSSStyleSheet`, `:has()` |
| Firefox | 115+ | `@scope`, `CSSStyleSheet`, `:has()` |
| Safari | 16.4+ | `@scope`, `CSSStyleSheet`, `:has()` |

---

## Framework references

The `docs/` directory contains mapping references for generating real code from pseudo-HTML:

- `docs/SPEC.md` — Full pseudo-HTML attribute model, type grammar, conventions
- `docs/PSEUDO-KIT.md` — pseudo-html-kit component system reference
- `docs/REACT.md` — pseudo-HTML → React mapping
- `docs/SVELTE.md` — pseudo-HTML → Svelte 5 mapping
- `docs/pseudo-svelte-5-reference.md` — Svelte 5 non-regression guide (LLMs regress often)

---

## License

MIT
