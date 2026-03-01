# pseudo-kit-assets

Pre-built component library and demo pages for [pseudo-html-kit](https://github.com/your-org/pseudo-html-kit) — zero dependencies, no build step, pure ESM.

## What's inside

| Category | Count | Path |
|---|---|---|
| Atoms | 17 | `components/atoms/` |
| Molecules | 16 | `components/molecules/` |
| Organisms | 13 | `components/organisms/` |
| Frames (page skeletons) | 20 | `frames/` |
| Demo apps | 3 | `demos/` |
| Viewer | 1 | `viewer/` |

**Total: 66 assets + 3 complete demo apps**

---

## Quick Start

### 1. Install

```bash
npm install pseudo-html-kit pseudo-kit-assets
# or
pnpm add pseudo-html-kit pseudo-kit-assets
```

### 2. Use in HTML

```html
<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
</head>
<body>
  <navbar-pk sticky>
    <span slot="logo">My App</span>
  </navbar-pk>

  <hero-banner-pk>
    <span slot="headline">Welcome</span>
    <span slot="cta"><button-pk variant="primary">Get Started</button-pk></span>
  </hero-banner-pk>

  <script type="module">
    import PseudoKit from 'pseudo-html-kit';
    import { components, componentNames } from 'pseudo-kit-assets';

    PseudoKit
      .register({ name: componentNames.navbar,     src: components.navbar })
      .register({ name: componentNames.heroBanner, src: components.heroBanner })
      .register({ name: componentNames.button,     src: components.button })
      .init();
  </script>
</body>
</html>
```

### 3. Apply a theme

Each demo includes a ready-to-use `tokens.css`. You can use these directly or create your own:

```html
<link rel="stylesheet" href="node_modules/pseudo-kit-assets/demos/netflix/tokens.css" />
```

---

## Component Catalogue

### Atoms

| Tag name | File | Props |
|---|---|---|
| `button-pk` | `atoms/button.html` | `variant`, `size`, `disabled` |
| `avatar-pk` | `atoms/avatar.html` | `src`, `size`, `alt` |
| `badge-pk` | `atoms/badge.html` | `variant`, `size` |
| `chip-pk` | `atoms/chip.html` | `active`, `disabled` |
| `divider-pk` | `atoms/divider.html` | `vertical`, `label` |
| `icon-pk` | `atoms/icon.html` | `name`, `size` |
| `image-pk` | `atoms/image.html` | `src`, `alt`, `ratio` |
| `input-pk` | `atoms/input.html` | `type`, `placeholder`, `disabled`, `error` |
| `label-pk` | `atoms/label.html` | `for`, `required` |
| `loader-pk` | `atoms/loader.html` | `size`, `variant` |
| `progress-bar-pk` | `atoms/progress-bar.html` | `value`, `max`, `label` |
| `rating-pk` | `atoms/rating.html` | `value`, `max`, `readonly` |
| `skeleton-pk` | `atoms/skeleton.html` | `width`, `height`, `variant` |
| `spinner-pk` | `atoms/spinner.html` | `size`, `variant` |
| `tag-pk` | `atoms/tag.html` | `variant`, `closable` |
| `textarea-pk` | `atoms/textarea.html` | `placeholder`, `rows`, `disabled` |
| `toggle-pk` | `atoms/toggle.html` | `checked`, `disabled`, `label` |

### Molecules

| Tag name | File | Description |
|---|---|---|
| `breadcrumb-pk` | `molecules/breadcrumb.html` | Navigation path |
| `card-pk` | `molecules/card.html` | Content card with slots |
| `card-media-pk` | `molecules/card-media.html` | Media card with overlay |
| `dropdown-pk` | `molecules/dropdown.html` | Dropdown menu `[open]` |
| `form-field-pk` | `molecules/form-field.html` | Label + input + error |
| `list-item-pk` | `molecules/list-item.html` | List entry with avatar/icon |
| `menu-item-pk` | `molecules/menu-item.html` | Sidebar/nav menu entry |
| `modal-pk` | `molecules/modal.html` | Dialog overlay `[open]` |
| `notification-pk` | `molecules/notification.html` | Toast/alert `variant` |
| `pagination-pk` | `molecules/pagination.html` | Page nav |
| `price-tag-pk` | `molecules/price-tag.html` | Price with discount |
| `product-tile-pk` | `molecules/product-tile.html` | Shop product card |
| `search-bar-pk` | `molecules/search-bar.html` | Search input + button |
| `tab-bar-pk` | `molecules/tab-bar.html` | Tab navigation |
| `tooltip-pk` | `molecules/tooltip.html` | Hover tooltip |
| `user-info-pk` | `molecules/user-info.html` | User name + avatar + meta |

### Organisms

| Tag name | File | Description |
|---|---|---|
| `cart-summary-pk` | `organisms/cart-summary.html` | Shopping cart with totals |
| `comment-thread-pk` | `organisms/comment-thread.html` | Nested comments |
| `content-row-pk` | `organisms/content-row.html` | Horizontal scroll row |
| `feed-post-pk` | `organisms/feed-post.html` | Social media post |
| `footer-pk` | `organisms/footer.html` | Site footer |
| `hero-banner-pk` | `organisms/hero-banner.html` | Full-width hero section |
| `navbar-pk` | `organisms/navbar.html` | Top navigation bar |
| `product-detail-pk` | `organisms/product-detail.html` | Product page layout |
| `profile-card-pk` | `organisms/profile-card.html` | User profile card |
| `sidebar-pk` | `organisms/sidebar.html` | Navigation sidebar |
| `story-ring-pk` | `organisms/story-ring.html` | Instagram-style stories row |
| `thumbnail-grid-pk` | `organisms/thumbnail-grid.html` | Masonry-style grid |
| `topbar-pk` | `organisms/topbar.html` | App top bar |

---

## Page Frames

Full HTML skeleton pages with named `<slot>` placeholders. Use as starting points for new pages.

| Frame | File | Description |
|---|---|---|
| `frame-netflix-home` | `frames/frame-netflix-home.html` | Streaming home |
| `frame-netflix-detail` | `frames/frame-netflix-detail.html` | Content detail page |
| `frame-amazon-home` | `frames/frame-amazon-home.html` | E-commerce home |
| `frame-amazon-product` | `frames/frame-amazon-product.html` | Product detail page |
| `frame-amazon-cart` | `frames/frame-amazon-cart.html` | Shopping cart |
| `frame-facebook-feed` | `frames/frame-facebook-feed.html` | Social feed (3-col) |
| `frame-facebook-profile` | `frames/frame-facebook-profile.html` | User profile |
| `frame-dashboard` | `frames/frame-dashboard.html` | Admin dashboard |
| `frame-landing` | `frames/frame-landing.html` | Marketing landing |
| `frame-login` | `frames/frame-login.html` | Login form |
| `frame-signup` | `frames/frame-signup.html` | Registration form |
| `frame-settings` | `frames/frame-settings.html` | User settings |
| `frame-404` | `frames/frame-404.html` | Not found page |
| `frame-blog-home` | `frames/frame-blog-home.html` | Blog listing |
| `frame-blog-post` | `frames/frame-blog-post.html` | Article detail |
| `frame-pricing` | `frames/frame-pricing.html` | Pricing plans |
| `frame-portfolio` | `frames/frame-portfolio.html` | Portfolio showcase |
| `frame-admin` | `frames/frame-admin.html` | Admin panel |
| `frame-chat` | `frames/frame-chat.html` | Messaging UI |
| `frame-search-results` | `frames/frame-search-results.html` | Search results |

---

## Demo Apps

Three fully working demo apps showing real-world usage. Open them directly in a browser (serve with any local HTTP server).

### Netflix-style (`demos/netflix/`)

| File | Description |
|---|---|
| `tokens.css` | Dark theme — `#141414` bg, `#e50914` red |
| `index.html` | Home with hero, Top 10, continue watching |
| `detail.html` | Series detail with episode list |

### Amazon-style (`demos/amazon/`)

| File | Description |
|---|---|
| `tokens.css` | Light theme — `#eaeded` bg, `#ff9900` orange |
| `index.html` | Home with hero carousel, deal widgets, product rows |
| `product.html` | Product detail with gallery, reviews, buy box |
| `cart.html` | Shopping cart with order summary |

### Facebook-style (`demos/facebook/`)

| File | Description |
|---|---|
| `tokens.css` | Light theme — `#f0f2f5` bg, `#1877f2` blue |
| `index.html` | News feed — stories, posts, 3-column layout |
| `profile.html` | User profile with cover, posts, friends grid |

**Serving demos:**

```bash
# Using npx serve
npx serve pseudo-kit-assets/demos/netflix/
open http://localhost:3000

# Using Python
cd pseudo-kit-assets/demos/netflix && python -m http.server 8080
```

---

## Component Viewer (Figma-style)

The included viewer lets you browse, preview, and inspect all components in a Figma-style 3-panel interface.

```bash
# Serve the viewer
npx serve pseudo-kit-assets/viewer/
open http://localhost:3000/pseudo-canvas-viewer.html?assets=auto
```

### Viewer features

- **Component tree** — grouped by atoms / molecules / organisms / frames
- **Live canvas** — responsive preview with device switcher (320 / 768 / 1280 / auto)
- **Props inspector** — view props, slots, and source code
- **Search** — filter components by name
- **Drag & drop** — drop `.html` component files directly onto the canvas
- **URL params** — `?assets=auto` auto-loads from `../index.js`, `?canvas=<url>` loads a specific component

---

## CSS Architecture

All components follow these conventions:

- `@scope (.component-root)` — no global selectors, no class name collisions
- CSS custom properties with fallbacks — work without any `tokens.css`
- Mobile-first breakpoints: `320 / 768 / 1024 / 1440px`
- `clamp()` for fluid typography and spacing

### Theming

Override any component's design by setting CSS custom properties in your `tokens.css`:

```css
:root {
  --color-primary:        #your-brand-color;
  --color-primary-hover:  #your-brand-color-darker;
  --color-surface:        #ffffff;
  --color-text:           #111111;
  --color-border:         #e4e6eb;
  --font-sans:            'Your Font', sans-serif;
  --radius-md:            .5rem;
}
```

---

## Barrel API

```js
import { components, componentNames, frames, componentsMeta, framesMeta } from 'pseudo-kit-assets';

// URL strings — pass to PseudoKit.register()
components.button       // → "...atoms/button.html"
components.heroBanner   // → "...organisms/hero-banner.html"
frames.netflixHome      // → "...frames/frame-netflix-home.html"

// pk-* HTML tag names (avoids conflicts with native HTML elements)
componentNames.button      // → 'pk-button'
componentNames.heroBanner  // → 'pk-hero-banner'
componentNames.footer      // → 'pk-footer'

// Register one
PseudoKit.register({ name: componentNames.button, src: components.button });

// Register all at once
Object.entries(components).forEach(([key, src]) =>
  PseudoKit.register({ name: componentNames[key], src })
);
PseudoKit.init();

// Metadata (for tooling / documentation)
componentsMeta.button   // → { props, slots, layer }
framesMeta.netflixHome  // → { slots, description }
```

---

## License

MIT
