# pseudo-kit-svelte

> Thin Svelte 5 adapter for [pseudo-stack](https://github.com/your-org/pseudo-kit) components.
> Load and register pseudo-html components directly inside Svelte 5 apps — no build step.

---

## Install

```bash
npm install pseudo-kit-svelte
# peer dep: svelte >= 5.0.0
```

---

## Quick Start

### 1. Load `pseudo-kit-client.js` in your HTML

```html
<script type="module">
  import PseudoKit from 'pseudo-stack/client';
  globalThis.PseudoKit = PseudoKit;
</script>
```

### 2. Use in a Svelte 5 component

```svelte
<script>
  import { createComponent } from 'pseudo-kit-svelte';

  let ready = $state(false);

  $effect(() => {
    createComponent('/components/button-pk.html').then(() => {
      ready = true;
    });
  });
</script>

{#if ready}
  <button-pk variant="primary">Click me</button-pk>
{/if}
```

### Multiple components

```svelte
<script>
  import { createComponents } from 'pseudo-kit-svelte';

  let ready = $state(false);

  $effect(() => {
    createComponents([
      '/components/card.html',
      '/components/badge.html',
    ]).then(() => { ready = true; });
  });
</script>
```

### With `pseudoKit` helper

```svelte
<script>
  import { pseudoKit } from 'pseudo-kit-svelte';

  const { ready: readyPromise } = pseudoKit([
    '/components/button-pk.html',
    '/components/card.html',
  ]);

  let ready = $state(false);
  $effect(() => { readyPromise.then(() => { ready = true; }); });
</script>
```

---

## API

### `createComponent(url: string): Promise<void>`

Loads and registers a single component by URL. Resolves when ready.

### `createComponents(urls: string[]): Promise<void>`

Loads and registers multiple components at once. Resolves when all are ready.

### `pseudoKit(urlOrUrls: string | string[]): { ready: Promise<void> }`

Convenience wrapper — accepts one URL or an array. Returns `{ ready }` promise.

### `initPseudoKit(urls: string[], root?: Element): Promise<void>`

Registers components and runs `PseudoKit.init(root)`. Designed for `onMount` or `$effect`.

### `nameFromUrl(url: string): string`

Utility — extracts the component tag name from a URL.
`'/components/button-pk.html'` → `'button-pk'`

---

## Notes

- **No Svelte compiler required** — the adapter is plain ES module JS.
- Rune-based integration (`$state`, `$effect`) is the caller's responsibility — the adapter exposes plain async functions.
- Calling `createComponent` with the same URL multiple times is safe (PseudoKit.register is idempotent).
- Requires `PseudoKit` on `globalThis` before any function is called.

---

## License

MIT
