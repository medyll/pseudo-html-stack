# SKILL — Pseudo-HTML Layout Descriptor

## What is pseudo-HTML?

Pseudo-HTML is a language-agnostic interface descriptor. It describes GUI layouts, components, their props, data, events, and behaviour — without styling or business logic. It serves as a single source of truth consumed by AI code generators, developers, and documentation tools.

It is **not** valid HTML. It borrows HTML syntax for readability, but its semantics are its own.

---

## References

This skill is split into focused reference documents:

| File | Purpose |
|---|---|
| `docs/SPEC.md` | Full attribute model, type grammar, conventions |
| `docs/REACT.md` | Generating React components from pseudo-HTML |
| `docs/SVELTE.md` | Pseudo-HTML → Svelte 5 mapping |
| `docs/pseudo-svelte-5-reference.md` | Svelte 5 syntax rules and non-regression log |
| `docs/PSEUDO-KIT.md` | Generating vanilla HTML with the pseudo-html-kit component system |

**Always read SPEC.md first**, then the target framework reference.

**For Svelte targets specifically:**
1. Read `docs/SPEC.md`
2. Read `docs/pseudo-svelte-5-reference.md` — mandatory before writing any Svelte code
3. Read `docs/SVELTE.md`

⚠️ If a Svelte 4 pattern is used and then corrected during generation, append the regression to the `[Non-regression log]` section of `pseudo-svelte-5-reference.md`.

---

## When to use this skill

- Read a pseudo-HTML file and generate an implementation (screen, component, or both)
- Write or extend a pseudo-HTML descriptor from a natural language description
- Translate a pseudo-HTML descriptor into React, Svelte, or pseudo-html-kit (vanilla HTML5)

---

## Generation workflow — applies to all targets

### Step 1 — Read the file header
Read `[spec:attribute-model]`, `[spec:type-grammar]`, `[spec:conventions]`, and `[spec:state-refs]`. These define the rules for this specific project.

### Step 2 — Read the `<component-registry>`
Build a component registry:
- `element="*"` → native element, no component to create
- no `element` → real component to implement
- Note `props`, `data`, `on`, `layer`, `types-reference`, `note`, and inner content for each

### Step 3 — Identify the target
- **Screen** → find the matching screen section and implement the full tree
- **Component** → find its declaration in `<component-registry>` and all its instances for context

### Step 4 — Generate
Follow the appropriate reference document for the target framework.

---

## Writing a pseudo-HTML descriptor

1. Start with `<component-registry>` — declare every component before using it.
2. Declare layout elements first, components after.
3. For each component: decide `props` (config) vs `data` (state) vs `on` (events).
4. Declare inner content inside the component tag when it is functionally part of the component.
5. Use `note` for explanations that cannot be typed.
6. Use `behavior` only for runtime logic with no typed equivalent.
7. In the body, always set `role=""` on every instance.
8. Use `when-*` for all conditional display and triggers.
9. Use `loop=""` on a child to mark it as repeated for each item in the parent data source.
10. Place the `<style>` block at the very end of the file.

---

## Common mistakes to avoid

| Mistake | Correct |
|---|---|
| Using `fields` | Use `data` |
| Using `visible-when` | Use `when-visible` |
| Using `ai:note` / `ai:element` | Use `note` / `element` |
| Declaring props on layout elements | Layout elements have no props |
| Putting behavior in `note` | `note` = annotation, `behavior` = logic |
| Creating a component for `row` / `column` | They are native elements |
| Omitting `role` on instances | Every instance needs a contextual `role` |
| Using `[brackets]` as identifiers | Comments only — use `id` for references |
| Wrapping repeated children in a `<loop>` tag | Use `loop=""` on the child itself |
