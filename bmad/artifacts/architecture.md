# Architecture — pseudo-html-kit · pseudo-kit-assets

> **Status:** ✅ Draft v1.0  
> **Author:** Architect Agent (BMAD)  
> **Date:** 2026-03-01  
> **Traces to:** [tech-spec.md](tech-spec.md) · [prd.md](prd.md)

---

## Chosen Approach

**Declarative File-Based Component Architecture**  
Each component is a self-contained `.html` file (template + scoped style + optional script). The runtime (`pseudo-html-kit`) is the only execution engine — `pseudo-kit-assets` is a pure asset library with zero logic. This maximises portability, zero-dep integrity, and compatibility with SSR + browser without any adapter layer.

---

## System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DEVELOPER / USER                                 │
└───────────────────────────┬─────────────────────────────────────────────┘
                            │  uses
          ┌─────────────────┼─────────────────────┐
          ▼                 ▼                       ▼
┌──────────────────┐ ┌─────────────────┐ ┌──────────────────────────┐
│  Browser App     │ │  Node.js SSR    │ │  pseudo-canvas-viewer    │
│  (demos/)        │ │  (server)       │ │  (viewer/viewer.html)    │
└────────┬─────────┘ └────────┬────────┘ └────────────┬─────────────┘
         │                    │                        │
         ▼                    ▼                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     pseudo-html-kit  (existing)                       │
│  pseudo-kit-client.js  │  pseudo-kit-server.js  │  shared/           │
└──────────────────────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    pseudo-kit-assets  (NEW package)                   │
│  components/  │  frames/  │  index.js  │  (no tokens.css)            │
└──────────────────────────────────────────────────────────────────────┘
         │
         ▼ per-demo
┌────────────────────────────┐
│  demos/{name}/tokens.css   │  ← CSS custom properties, per demo
│  demos/{name}/index.html   │  ← self-contained, opens from file://
└────────────────────────────┘
```

---

## Components

### `pseudo-kit-assets` (new package)

| Sub-system | Responsibility | Technology |
|---|---|---|
| `components/atoms/` | 17 base-level UI files | `.html` (template + @scope style) |
| `components/molecules/` | 16 composed UI files | `.html` |
| `components/organisms/` | 13 complex UI files | `.html` |
| `frames/` | 20 empty page skeleton files | `.html` |
| `index.js` | Barrel: URL paths + metadata | ESM, `import.meta.url` |
| `demos/*/tokens.css` | Per-demo CSS custom properties | CSS @layer base, :root vars |
| `demos/*/index.html` | Self-contained demo app | HTML + inline `<script type="module">` |
| `viewer/pseudo-canvas-viewer.html` | Figma-style component browser | Vanilla JS, DOMParser, File API |

### `pseudo-canvas-viewer` (viewer sub-system)

```
pseudo-canvas-viewer.html
├── viewer.css              ← 3-panel layout (CSS grid), @scope isolated
└── viewer.js (inline module)
    ├── CanvasLoader        ← fetch(url) OR FileReader (drag-and-drop)
    ├── RegistryParser      ← DOMParser → component descriptors
    ├── PanelLeft           ← component tree (atoms/molecules/organisms/frames)
    ├── CanvasRenderer      ← live stamp via pseudo-kit-client instance
    └── PropsPanel          ← auto-generates inputs from @props metadata
```

---

## Architecture Decisions (ADR)

### ADR-01 — `tokens.css` per demo, not in package

- **Status:** Accepted
- **Context:** Demos target very different visual themes (dark/Netflix, e-commerce/Amazon, social/Facebook). A shared token file in the package would be a leaky abstraction.
- **Decision:** Each `demos/{name}/tokens.css` defines its own `:root` CSS custom properties (`--color-bg`, `--color-accent`, `--radius-md`, `--spacing-*`, etc.).
- **Consequences:** Components use `var(--*)` tokens — they render correctly in any demo that defines the expected vars. Components work without tokens too (bare but functional).

### ADR-02 — Drag-and-drop + `?canvas=` in viewer

- **Status:** Accepted
- **Context:** `file://` protocol blocks `fetch()` for local paths on most browsers. Drag-and-drop via `FileReader` API works without a server.
- **Decision:** Two loading strategies in `CanvasLoader`:
  1. `?canvas=url` → `fetch(url)` (works on local dev server or CDN)
  2. Drag-and-drop `.html` onto the viewer → `FileReader.readAsText(file)`
- **Consequences:** Zero server requirement. Falls back gracefully on file:// with message to use drag-and-drop.

### ADR-03 — Barrel exports: URLs + metadata (4 exports)

- **Status:** Accepted
- **Context:** Tooling and the viewer need to know props/slots/layer without parsing each file.
- **Decision:** `index.js` exports `components`, `frames` (URL maps) + `componentsMeta`, `framesMeta` (JS objects with props/slots/description).
- **Consequences:** Any consumer can import metadata without hitting the filesystem. Metadata must be kept in sync with `@props` JSDoc in component files.

### ADR-04 — Named slots in all components (not default-only)

- **Status:** Accepted
- **Context:** Organisms and frames require multiple injection points (media, content, actions, footer…).
- **Decision:** Every component that has more than one content area exposes named slots (`<slot name="media">`, `<slot name="actions">`, etc.) plus a default slot where applicable.
- **Consequences:** Slightly more verbose usage (`slot="actions"` on children), but necessary for frame assembly.

### ADR-05 — Frames are empty skeletons (no placeholder content)

- **Status:** Accepted
- **Context:** Frames are structural scaffolding, not demos. Placeholder content would mislead consumers about required data.
- **Decision:** Frames contain only layout structure (rows, columns, named slots). All content is injected by the consuming app.
- **Consequences:** Frames alone produce invisible layouts in the viewer; viewer must inject stub content for preview purposes.

### ADR-06 — `@scope` for all CSS isolation

- **Status:** Accepted
- **Context:** Zero BEM, no CSS-in-JS, no Shadow DOM. Native `@scope` (Chrome 118+, Firefox 128+, Safari 17.4+) provides true scoped styles without runtime overhead.
- **Decision:** Every `<style>` block in every component and frame uses `@scope (.component-root) { ... }`.
- **Consequences:** No style leakage between components. Browser support constraint documented in NFR.

### ADR-07 — `?assets=auto` in pseudo-canvas-viewer

- **Status:** Accepted
- **Context:** When the viewer is loaded from the `pseudo-kit-assets` package, it should display all 66 assets without manual registration.
- **Decision:** When `?assets=auto` is present, `CanvasLoader` imports `componentsMeta` + `framesMeta` from `index.js` and auto-registers everything via `PseudoKitClient`.
- **Consequences:** Viewer becomes a zero-config component browser for the full library. Custom canvases still require explicit `?canvas=` or drag-and-drop.

### ADR-08 — `data-pk-hydrated` SSR marker

- **Status:** Accepted
- **Context:** The client needs to distinguish SSR-rendered elements from client-rendered ones to avoid double-stamping.
- **Decision:** `pseudo-kit-server.renderComponent()` adds `data-pk-hydrated` on the component root element. `pseudo-kit-client` checks for this attribute and skips re-stamping; it only adopts the `@scope` stylesheet.
- **Consequences:** Clean separation of SSR and CSR paths. Requires `pseudo-html-kit` v0.2.0 to implement (tracked as PKA-001 dependency).

---

### Flow A — Browser renders a component
```
1. Developer registers component:
   PseudoKitClient.register({ name: 'card', src: components.card })

2. MutationObserver detects <card> in DOM

3. Client fetches card.html → parses <template>, <style>, <script>

4. CSSStyleSheet API adopts @scope style (no DOM injection)

5. <template> content stamped into <card> element
   └─ named slots matched: slot="actions" → <slot name="actions">
   └─ default slot catches remaining children

6. Optional <script> evaluated in module scope
```

### Flow B — SSR renders a component (Node.js)
```
1. Server registers component:
   PseudoKitServer.register({ name: 'card', src: '/path/card.html' })

2. renderComponent('card', props, children)
   └─ reads card.html from filesystem
   └─ injects props as attributes on opening tag
   └─ injects children into slot positions
   └─ returns HTML string

3. HTML string sent in HTTP response

4. Browser receives pre-rendered HTML
   └─ pseudo-kit-client detects SSR marker, skips re-stamp
   └─ @scope styles adopted via CSSStyleSheet
```

### Flow C — pseudo-canvas-viewer loads a descriptor
```
1. User loads pseudo-canvas-viewer.html in browser

2a. Via URL:  ?canvas=./pseudo-canvas-demo.html
    → fetch(url) → text
2b. Via drag-and-drop: FileReader.readAsText(file) → text

3. CanvasLoader → RegistryParser
   → DOMParser.parseFromString(text, 'text/html')
   → querySelectorAll('component-registry > *')
   → maps tagName + attributes → componentDescriptor[]

4. PanelLeft renders component tree grouped by @layer

5. User clicks component:
   → CanvasRenderer stamps component into center canvas
     (using local PseudoKitClient instance + src from framesMeta/componentsMeta)
   → PropsPanel renders editable inputs from descriptor.props

6. User edits prop → live re-render in canvas panel
```

---

## CSS Architecture

```
@layer base       ← :root { --color-*, --spacing-*, --radius-* }  (tokens.css, per demo)
@layer layout     ← row, column, grid, stack, spacer  (pseudo-html-kit existing)
@layer components ← all @scope blocks from component files
@layer utils      ← .sr-only, .visually-hidden, .truncate
```

Component CSS consumption path:
```
component.html <style> block
  → CSSStyleSheet.replace(cssText)   ← no DOM <style> tag injected
  → document.adoptedStyleSheets.push(sheet)
```

---

## Deployment Architecture

| Target | Method | Notes |
|---|---|---|
| Local dev | `file://` + drag-and-drop viewer | No server required for demos |
| Local dev server | `npx serve` or any static server | Enables `?canvas=` param in viewer |
| npm registry | `npm publish pseudo-kit-assets` | Peer dep: `pseudo-html-kit` |
| CDN | `unpkg` / `jsDelivr` | `import.meta.url` resolves correctly |

---

## Cross-Cutting Concerns

### Security
- No `eval()` — component `<script>` blocks are executed as ESM modules in strict scope
- No `innerHTML` on user-provided data — slot content injected via DOM APIs only
- Viewer: `FileReader` + `DOMParser` only — no server-side execution, no file system write

### Observability
- No logging infrastructure needed (pure client/static package)
- `pseudo-kit-client` emits `console.warn` on duplicate registration or missing component file
- Viewer: error panel shown inline when canvas load fails

### Resilience
- Missing component file → `renderComponent` throws with descriptive path hint
- Invalid `pseudo-canvas-demo.html` → viewer shows parse error in left panel
- Tokens missing → components degrade gracefully (bare but functional)

### Browser Support
| Browser | Min Version | Blocker Feature |
|---|---|---|
| Chrome | 118 | `@scope` |
| Firefox | 128 | `@scope` |
| Safari | 17.4 | `@scope` |
| Edge | 118 | `@scope` |

---

## Open Architectural Questions

- [x] ~~`pseudo-canvas-viewer` auto-discover assets via `?assets=auto`?~~ → **Yes** — `?assets=auto` loads all `pseudo-kit-assets` components automatically
- [x] ~~SSR hydration marker: explicit `data-pk-hydrated` attribute?~~ → **Yes** — `data-pk-hydrated` on each SSR-rendered component root
