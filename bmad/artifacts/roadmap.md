# Roadmap — pseudo-html-kit

> **Status:** Living Document  
> **Last updated:** 2026-03-07  
> **Current release:** v0.4.0 GA

---

## Vision

pseudo-kit is the **zero-dependency, no-build component runtime for the 2026 Web Platform**. Every new browser API — Anchor Positioning, Popover, View Transitions, Listbox API, `field-sizing`, CSS `if()` — lands in pseudo-kit components first, with graceful fallbacks for all supported browsers. pseudo-HTML stays the single source of truth for UI specification across all frameworks.

---

## Released

| Version | Theme | Key Deliverables |
|:--------|:------|:-----------------|
| **v0.1.0** | Core runtime | `pseudo-kit-client.js`, template stamping, slots, reactive state |
| **v0.2.0** | SSR + shared | `pseudo-kit-server.js`, state hydration, canvas validator/normalizer |
| **v0.3.0** | Asset library | 46 components (atoms/molecules/organisms), 20 frames, 3 demo apps, Playwright E2E |
| **v0.4.0** | 2026 API migration | Modal (`<dialog>`), Dropdown (Popover), Tooltip (Anchor Positioning), Notification (Interest Invokers), Input (Constraint Validation), Checkbox/Radio, Grid (Container Queries), Select (Listbox API), Combobox, Textarea (anchor hints), Accordion (View Transitions) |

---

## Near-term — v0.5.0

**Theme: CSS 2026 — Progressive Layout & Visual Enhancements**

| Story | Component | Feature | Priority |
|:------|:----------|:--------|:--------:|
| S12-01 | `color-swatch-pk` (atom) | `color-mix()` + `oklch()` color tokens for live palette preview | Should |
| S12-02 | `text-pk` (atom) | `text-wrap: balance/pretty`, `hyphenate-limit-chars`, `hanging-punctuation` | Should |
| S12-03 | `carousel-pk` (molecule) | CSS Scroll Snap + Scroll-driven Animations (`@scroll-timeline`) | Must |
| S12-04 | `date-picker-pk` (molecule) | Native `<input type="date">` + Popover calendar overlay with Anchor Positioning | Must |
| S12-05 | `nav-pk` (organism) | `@starting-style` entrance animation + `overlay` property for top-layer transitions | Should |
| S12-06 | CSS `if()` pass | Audit all components — replace JS-computed conditional classes with native CSS `if()` where applicable | Should |
| S12-07 | E2E + tests (Sprint 12) | Vitest + Playwright coverage for new components | Must |

**Target:** Sprint 12 · ~2 weeks

---

## Medium-term — v0.6.0

**Theme: Developer Experience + Framework Bridges**

| Deliverable | Description | Priority |
|:------------|:------------|:--------:|
| `pseudo-kit-react` package | Stable React adapter — `useComponent(url)`, `usePseudoKit(urls)`, auto-registration | Must |
| `pseudo-kit-svelte` package | Svelte 5 adapter with `$state()` / `$props()` bridge | Should |
| VSCode extension (basic) | Syntax highlight + `component-role` + `props` autocomplete for pseudo-HTML `.html` files | Should |
| Canvas live preview | `?canvas=file.html` URL → pseudo-kit renders it in the viewer with live reload | Should |
| `pseudo-kit-cli` scaffold | `npx pseudo-kit init` → creates a project with viewer, demo, and component stubs | Could |

---

## Long-term — v1.0.0

**Theme: Stable Public API**

| Goal | Acceptance Criteria |
|:-----|:--------------------|
| Public API lock | No breaking changes after v1.0.0 without a major version bump |
| Full documentation site | Hosted docs with live examples (no Storybook dependency) |
| 100% component coverage | Every component has unit + E2E tests (vitest + Playwright) |
| Accessibility audit | WCAG 2.2 AA pass for all 52+ components |
| Performance budget | Time-to-interactive < 100ms for any frame loaded with full component set |
| LLM context pack | `manifestText` generation for all 52 components + all 20 frames; validated against 5 common LLM generation targets |

---

## Out of Scope (deliberate non-goals)

- **Build step** — pseudo-kit will never require a bundler or compiler
- **Virtual DOM** — no diffing, no reactivity framework
- **SSR framework coupling** — server module stays framework-agnostic (works with Express, Fastify, Deno, Bun)
- **CSS-in-JS** — all styles stay in `.html` component files under `@scope`
- **Auto-publish** — CI-only; `npm publish` is never run manually

---

## Dependency / Sequencing

```
v0.5.0 (CSS 2026)
  └─ S12-01 color-swatch-pk
  └─ S12-02 text-pk
  └─ S12-03 carousel-pk        ← scroll-snap + scroll-driven animations
  └─ S12-04 date-picker-pk     ← depends: anchor positioning (done in v0.4.0)
  └─ S12-05 nav-pk             ← depends: @starting-style
  └─ S12-06 CSS if() pass      ← depends: all component styles
  └─ S12-07 E2E + tests

v0.6.0 (DX + Bridges)
  └─ pseudo-kit-react          ← depends: v0.5.0 stable API
  └─ pseudo-kit-svelte
  └─ VSCode extension

v1.0.0 (Stable)
  └─ API lock
  └─ Docs site
  └─ Full accessibility audit
```
