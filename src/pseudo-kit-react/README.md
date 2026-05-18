# pseudo-kit-react

> Thin React 18 adapter for [pseudo-stack](https://github.com/your-org/pseudo-kit) components.  
> Load and register pseudo-html components directly inside React apps — no build step.

---

## Install

```bash
npm install pseudo-kit-react
# peer deps: react >= 18, react-dom >= 18
```

---

## Usage

### 1. Load `pseudo-kit-client.js` in your HTML

```html
<script type="module">
  import PseudoKit from 'pseudo-stack/client';
  globalThis.PseudoKit = PseudoKit;
</script>
```

### 2. Use the hooks in your React components

```jsx
import { useComponent, usePseudoKit } from 'pseudo-kit-react';

// Load a single component
function ButtonDemo() {
  const { ready } = useComponent('/components/button-pk.html');
  if (!ready) return null;
  return <button-pk variant="primary">Click me</button-pk>;
}

// Load multiple components at once
function CardDemo() {
  const { ready } = usePseudoKit([
    '/components/card.html',
    '/components/card-media.html',
  ]);
  if (!ready) return null;
  return (
    <card-pk>
      <card-media-pk slot="media" src="/img/cover.jpg" alt="Cover" />
      Hello from pseudo-kit inside React!
    </card-pk>
  );
}
```

---

## API

### `useComponent(url: string): { ready: boolean }`

Loads and registers a single pseudo-stack component by URL.  
Returns `{ ready: false }` until the component is registered, then `{ ready: true }`.

| Parameter | Type | Description |
|---|---|---|
| `url` | `string` | Absolute or relative URL to the component `.html` file |

### `usePseudoKit(urls: string[]): { ready: boolean }`

Loads and registers multiple components at once.

| Parameter | Type | Description |
|---|---|---|
| `urls` | `string[]` | Array of component `.html` file URLs |

---

## Demo

Serve from the project root and open `demo/index.html`:

```bash
npx serve .
# → http://localhost:3000/src/pseudo-kit-react/demo/index.html
```

---

## Notes

- **Client-side only** in v0.3.0 — SSR adapter planned for v0.4.0.
- Component name is derived from the filename stem: `button-pk.html` → `button-pk` tag.
- Calling `useComponent` with the same URL multiple times is safe (idempotent).
- Requires `PseudoKit` to be available on `globalThis` before the hook runs.

---

## License

MIT
