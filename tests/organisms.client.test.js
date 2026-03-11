/**
 * @fileoverview organisms.client.test.js
 * Vitest unit tests for all 13 organism-layer pseudo-kit components.
 * Story: S8-03
 *
 * Run: npx vitest run tests/organisms.client.test.js
 * Env: happy-dom (configured in vitest.config.js)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

// ── DOM polyfills ────────────────────────────────────────────────────────────
if (!document.adoptedStyleSheets) {
  Object.defineProperty(document, 'adoptedStyleSheets', { value: [], writable: true });
}

import PseudoKit from '../src/client/pseudo-kit-client.js';
import { reset_shared } from '../src/shared/registry-shared.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const ORGANISMS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '../src/pseudo-assets/components/organisms',
);

function readOrganism(filename) {
  return readFileSync(join(ORGANISMS_DIR, filename), 'utf8');
}

function mockFetch(map) {
  vi.stubGlobal('fetch', vi.fn((url) => {
    const content = map[url] ?? map['*'];
    if (content === undefined) return Promise.resolve({ ok: false, status: 404 });
    return Promise.resolve({ ok: true, text: () => Promise.resolve(content) });
  }));
}

function flush() {
  return new Promise(r => setTimeout(r, 0));
}

function registerAndInit(name, src, htmlContent) {
  mockFetch({ [src]: htmlContent });
  PseudoKit.register({ name, src });
  return PseudoKit.init(document.body);
}

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  reset_shared();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

// =============================================================================
// cart-summary-pk
// =============================================================================

describe('cart-summary-pk', () => {
  const HTML = readOrganism('cart-summary.html');
  const SRC  = 'components/cart-summary.html';

  it('resolves', async () => {
    const obs = registerAndInit('cart-summary-pk', SRC, HTML);
    document.body.innerHTML = '<cart-summary-pk></cart-summary-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('cart-summary-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps aside.cart-summary with header, items, promo sections', async () => {
    const obs = registerAndInit('cart-summary-pk', SRC, HTML);
    document.body.innerHTML = '<cart-summary-pk></cart-summary-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('aside.cart-summary')).toBeTruthy();
    expect(document.querySelector('.cart-summary__header')).toBeTruthy();
    expect(document.querySelector('.cart-summary__items')).toBeTruthy();
    obs.disconnect();
  });

  it('routes items slot content', async () => {
    const obs = registerAndInit('cart-summary-pk', SRC, HTML);
    document.body.innerHTML = '<cart-summary-pk><li slot="items" class="cart-item">Item</li></cart-summary-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.cart-item')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// comment-thread-pk
// =============================================================================

describe('comment-thread-pk', () => {
  const HTML = readOrganism('comment-thread.html');
  const SRC  = 'components/comment-thread.html';

  it('resolves', async () => {
    const obs = registerAndInit('comment-thread-pk', SRC, HTML);
    document.body.innerHTML = '<comment-thread-pk></comment-thread-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('comment-thread-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps section.comment-thread with header, list and composer', async () => {
    const obs = registerAndInit('comment-thread-pk', SRC, HTML);
    document.body.innerHTML = '<comment-thread-pk></comment-thread-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('section.comment-thread')).toBeTruthy();
    expect(document.querySelector('.comment-thread__header')).toBeTruthy();
    expect(document.querySelector('.comment-thread__list')).toBeTruthy();
    expect(document.querySelector('.comment-thread__composer')).toBeTruthy();
    obs.disconnect();
  });

  it('routes composer slot content', async () => {
    const obs = registerAndInit('comment-thread-pk', SRC, HTML);
    document.body.innerHTML = '<comment-thread-pk><textarea slot="composer" class="compose-box"></textarea></comment-thread-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.compose-box')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// content-row-pk
// =============================================================================

describe('content-row-pk', () => {
  const HTML = readOrganism('content-row.html');
  const SRC  = 'components/content-row.html';

  it('resolves', async () => {
    const obs = registerAndInit('content-row-pk', SRC, HTML);
    document.body.innerHTML = '<content-row-pk title="Movies"></content-row-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('content-row-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps section.content-row with header and track', async () => {
    const obs = registerAndInit('content-row-pk', SRC, HTML);
    document.body.innerHTML = '<content-row-pk></content-row-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('section.content-row')).toBeTruthy();
    expect(document.querySelector('.content-row__header')).toBeTruthy();
    expect(document.querySelector('.content-row__track')).toBeTruthy();
    obs.disconnect();
  });

  it('routes default slot content into track', async () => {
    const obs = registerAndInit('content-row-pk', SRC, HTML);
    document.body.innerHTML = '<content-row-pk><div class="tile">Tile</div></content-row-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.tile')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// feed-post-pk
// =============================================================================

describe('feed-post-pk', () => {
  const HTML = readOrganism('feed-post.html');
  const SRC  = 'components/feed-post.html';

  it('resolves', async () => {
    const obs = registerAndInit('feed-post-pk', SRC, HTML);
    document.body.innerHTML = '<feed-post-pk></feed-post-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('feed-post-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps article.feed-post with header section', async () => {
    const obs = registerAndInit('feed-post-pk', SRC, HTML);
    document.body.innerHTML = '<feed-post-pk></feed-post-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('article.feed-post')).toBeTruthy();
    expect(document.querySelector('.feed-post__header')).toBeTruthy();
    obs.disconnect();
  });

  it('routes avatar slot content', async () => {
    const obs = registerAndInit('feed-post-pk', SRC, HTML);
    document.body.innerHTML = '<feed-post-pk><img slot="avatar" class="post-avatar" src="x.png" alt=""/></feed-post-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.post-avatar')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// footer-pk (organism)
// =============================================================================

describe('footer-pk', () => {
  const HTML = readOrganism('footer-pk.html');
  const SRC  = 'components/footer-pk.html';

  it('resolves', async () => {
    const obs = registerAndInit('footer-pk', SRC, HTML);
    document.body.innerHTML = '<footer-pk></footer-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('footer-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps footer.footer with brand, links, social and legal zones', async () => {
    const obs = registerAndInit('footer-pk', SRC, HTML);
    document.body.innerHTML = '<footer-pk></footer-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('footer.footer')).toBeTruthy();
    expect(document.querySelector('.footer__brand')).toBeTruthy();
    expect(document.querySelector('nav.footer__links')).toBeTruthy();
    expect(document.querySelector('.footer__social')).toBeTruthy();
    expect(document.querySelector('.footer__legal')).toBeTruthy();
    obs.disconnect();
  });

  it('routes links slot content', async () => {
    const obs = registerAndInit('footer-pk', SRC, HTML);
    document.body.innerHTML = '<footer-pk><a slot="links" class="footer-link" href="#">About</a></footer-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.footer-link')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// hero-banner-pk
// =============================================================================

describe('hero-banner-pk', () => {
  const HTML = readOrganism('hero-banner.html');
  const SRC  = 'components/hero-banner.html';

  it('resolves', async () => {
    const obs = registerAndInit('hero-banner-pk', SRC, HTML);
    document.body.innerHTML = '<hero-banner-pk></hero-banner-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('hero-banner-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps section.hero-banner with media, content, badge and headline zones', async () => {
    const obs = registerAndInit('hero-banner-pk', SRC, HTML);
    document.body.innerHTML = '<hero-banner-pk></hero-banner-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('section.hero-banner')).toBeTruthy();
    expect(document.querySelector('.hero-banner__media')).toBeTruthy();
    expect(document.querySelector('.hero-banner__content')).toBeTruthy();
    expect(document.querySelector('.hero-banner__headline')).toBeTruthy();
    obs.disconnect();
  });

  it('routes cta slot content', async () => {
    const obs = registerAndInit('hero-banner-pk', SRC, HTML);
    document.body.innerHTML = '<hero-banner-pk><button slot="cta" class="hero-cta">Watch now</button></hero-banner-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.hero-cta')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// navbar-pk
// =============================================================================

describe('navbar-pk', () => {
  const HTML = readOrganism('navbar.html');
  const SRC  = 'components/navbar.html';

  it('resolves', async () => {
    const obs = registerAndInit('navbar-pk', SRC, HTML);
    document.body.innerHTML = '<navbar-pk></navbar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('navbar-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps header.navbar with logo, nav links, actions and hamburger', async () => {
    const obs = registerAndInit('navbar-pk', SRC, HTML);
    document.body.innerHTML = '<navbar-pk></navbar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('header.navbar')).toBeTruthy();
    expect(document.querySelector('.navbar__logo')).toBeTruthy();
    expect(document.querySelector('nav.navbar__links')).toBeTruthy();
    expect(document.querySelector('.navbar__actions')).toBeTruthy();
    expect(document.querySelector('button.navbar__hamburger')).toBeTruthy();
    obs.disconnect();
  });

  it('routes logo slot content', async () => {
    const obs = registerAndInit('navbar-pk', SRC, HTML);
    document.body.innerHTML = '<navbar-pk><span slot="logo" class="brand-logo">Brand</span></navbar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.brand-logo')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// product-detail-pk
// =============================================================================

describe('product-detail-pk', () => {
  const HTML = readOrganism('product-detail.html');
  const SRC  = 'components/product-detail.html';

  it('resolves', async () => {
    const obs = registerAndInit('product-detail-pk', SRC, HTML);
    document.body.innerHTML = '<product-detail-pk></product-detail-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('product-detail-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .product-detail with layout, gallery and panel', async () => {
    const obs = registerAndInit('product-detail-pk', SRC, HTML);
    document.body.innerHTML = '<product-detail-pk></product-detail-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.product-detail')).toBeTruthy();
    expect(document.querySelector('.product-detail__layout')).toBeTruthy();
    expect(document.querySelector('.product-detail__gallery')).toBeTruthy();
    expect(document.querySelector('.product-detail__panel')).toBeTruthy();
    obs.disconnect();
  });

  it('routes actions slot content', async () => {
    const obs = registerAndInit('product-detail-pk', SRC, HTML);
    document.body.innerHTML = '<product-detail-pk><button slot="actions" class="buy-btn">Buy now</button></product-detail-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.buy-btn')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// profile-card-pk
// =============================================================================

describe('profile-card-pk', () => {
  const HTML = readOrganism('profile-card.html');
  const SRC  = 'components/profile-card.html';

  it('resolves', async () => {
    const obs = registerAndInit('profile-card-pk', SRC, HTML);
    document.body.innerHTML = '<profile-card-pk></profile-card-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('profile-card-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps article.profile-card with cover, avatar, info and stats sections', async () => {
    const obs = registerAndInit('profile-card-pk', SRC, HTML);
    document.body.innerHTML = '<profile-card-pk></profile-card-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('article.profile-card')).toBeTruthy();
    expect(document.querySelector('.profile-card__cover')).toBeTruthy();
    expect(document.querySelector('.profile-card__avatar')).toBeTruthy();
    expect(document.querySelector('.profile-card__info')).toBeTruthy();
    obs.disconnect();
  });

  it('routes actions slot content', async () => {
    const obs = registerAndInit('profile-card-pk', SRC, HTML);
    document.body.innerHTML = '<profile-card-pk><button slot="actions" class="follow-btn">Follow</button></profile-card-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.follow-btn')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// sidebar-pk
// =============================================================================

describe('sidebar-pk', () => {
  const HTML = readOrganism('sidebar.html');
  const SRC  = 'components/sidebar.html';

  it('resolves', async () => {
    const obs = registerAndInit('sidebar-pk', SRC, HTML);
    document.body.innerHTML = '<sidebar-pk></sidebar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('sidebar-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps aside.sidebar with backdrop, panel, header, body and footer', async () => {
    const obs = registerAndInit('sidebar-pk', SRC, HTML);
    document.body.innerHTML = '<sidebar-pk></sidebar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('aside.sidebar')).toBeTruthy();
    expect(document.querySelector('.sidebar__backdrop')).toBeTruthy();
    expect(document.querySelector('.sidebar__panel')).toBeTruthy();
    expect(document.querySelector('.sidebar__header')).toBeTruthy();
    expect(document.querySelector('nav.sidebar__body')).toBeTruthy();
    expect(document.querySelector('.sidebar__footer')).toBeTruthy();
    obs.disconnect();
  });

  it('routes header slot content', async () => {
    const obs = registerAndInit('sidebar-pk', SRC, HTML);
    document.body.innerHTML = '<sidebar-pk><h2 slot="header" class="sidebar-heading">Menu</h2></sidebar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.sidebar-heading')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// story-ring-pk
// =============================================================================

describe('story-ring-pk', () => {
  const HTML = readOrganism('story-ring.html');
  const SRC  = 'components/story-ring.html';

  it('resolves', async () => {
    const obs = registerAndInit('story-ring-pk', SRC, HTML);
    document.body.innerHTML = '<story-ring-pk></story-ring-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('story-ring-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .story-ring with track', async () => {
    const obs = registerAndInit('story-ring-pk', SRC, HTML);
    document.body.innerHTML = '<story-ring-pk></story-ring-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.story-ring')).toBeTruthy();
    expect(document.querySelector('.story-ring__track')).toBeTruthy();
    obs.disconnect();
  });

  it('routes default slot content', async () => {
    const obs = registerAndInit('story-ring-pk', SRC, HTML);
    document.body.innerHTML = '<story-ring-pk><div class="story-item">Story</div></story-ring-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.story-item')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// accordion-pk
// =============================================================================

describe('accordion-pk', () => {
  const HTML = readOrganism('accordion-pk.html');
  const SRC  = 'components/accordion-pk.html';

  it('resolves', async () => {
    const obs = registerAndInit('accordion-pk', SRC, HTML);
    document.body.innerHTML = '<accordion-pk></accordion-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('accordion-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .accordion wrapper', async () => {
    const obs = registerAndInit('accordion-pk', SRC, HTML);
    document.body.innerHTML = '<accordion-pk></accordion-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.accordion')).toBeTruthy();
    obs.disconnect();
  });

  it('routes slotted <details> elements through default slot', async () => {
    const obs = registerAndInit('accordion-pk', SRC, HTML);
    document.body.innerHTML = `
      <accordion-pk>
        <details class="panel-a"><summary>Panel A</summary><div class="accordion__content">Content A</div></details>
        <details class="panel-b"><summary>Panel B</summary><div class="accordion__content">Content B</div></details>
      </accordion-pk>`;
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.panel-a')).toBeTruthy();
    expect(document.querySelector('.panel-b')).toBeTruthy();
    obs.disconnect();
  });

  it('toggles panel open state on summary click', async () => {
    const obs = registerAndInit('accordion-pk', SRC, HTML);
    document.body.innerHTML = `
      <accordion-pk>
        <details class="panel-one"><summary class="panel-one-summary">Panel 1</summary><div class="accordion__content">Body 1</div></details>
      </accordion-pk>`;
    PseudoKit.init(document.body);
    await flush();
    const details = document.querySelector('.panel-one');
    const summary = document.querySelector('.panel-one-summary');
    expect(details.hasAttribute('open')).toBe(false);
    summary.click();
    await flush();
    expect(details.hasAttribute('open')).toBe(true);
    obs.disconnect();
  });

  it('closes other panels in exclusive mode', async () => {
    const obs = registerAndInit('accordion-pk', SRC, HTML);
    document.body.innerHTML = `
      <accordion-pk exclusive>
        <details class="p1" open><summary class="s1">Panel 1</summary><div class="accordion__content">Body 1</div></details>
        <details class="p2"><summary class="s2">Panel 2</summary><div class="accordion__content">Body 2</div></details>
      </accordion-pk>`;
    PseudoKit.init(document.body);
    await flush();
    const p1 = document.querySelector('.p1');
    const s2 = document.querySelector('.s2');
    expect(p1.hasAttribute('open')).toBe(true);
    s2.click();
    await flush();
    expect(p1.hasAttribute('open')).toBe(false);
    expect(document.querySelector('.p2').hasAttribute('open')).toBe(true);
    obs.disconnect();
  });
});

// =============================================================================
// thumbnail-grid-pk
// =============================================================================

describe('thumbnail-grid-pk', () => {
  const HTML = readOrganism('thumbnail-grid.html');
  const SRC  = 'components/thumbnail-grid.html';

  it('resolves', async () => {
    const obs = registerAndInit('thumbnail-grid-pk', SRC, HTML);
    document.body.innerHTML = '<thumbnail-grid-pk></thumbnail-grid-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('thumbnail-grid-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .thumbnail-grid container', async () => {
    const obs = registerAndInit('thumbnail-grid-pk', SRC, HTML);
    document.body.innerHTML = '<thumbnail-grid-pk></thumbnail-grid-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.thumbnail-grid')).toBeTruthy();
    obs.disconnect();
  });

  it('routes default slot content', async () => {
    const obs = registerAndInit('thumbnail-grid-pk', SRC, HTML);
    document.body.innerHTML = '<thumbnail-grid-pk><div class="thumb">Thumb</div><div class="thumb">Thumb</div></thumbnail-grid-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelectorAll('.thumb').length).toBe(2);
    obs.disconnect();
  });
});

// =============================================================================
// topbar-pk
// =============================================================================

describe('topbar-pk', () => {
  const HTML = readOrganism('topbar.html');
  const SRC  = 'components/topbar.html';

  it('resolves', async () => {
    const obs = registerAndInit('topbar-pk', SRC, HTML);
    document.body.innerHTML = '<topbar-pk></topbar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('topbar-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .topbar with leading, title and actions zones', async () => {
    const obs = registerAndInit('topbar-pk', SRC, HTML);
    document.body.innerHTML = '<topbar-pk></topbar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.topbar')).toBeTruthy();
    expect(document.querySelector('.topbar__leading')).toBeTruthy();
    expect(document.querySelector('.topbar__title')).toBeTruthy();
    expect(document.querySelector('.topbar__actions')).toBeTruthy();
    obs.disconnect();
  });

  it('routes title and actions slot content', async () => {
    const obs = registerAndInit('topbar-pk', SRC, HTML);
    document.body.innerHTML = '<topbar-pk><span slot="title" class="page-title">Home</span><button slot="actions" class="action-btn">Search</button></topbar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.page-title')).toBeTruthy();
    expect(document.querySelector('.action-btn')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// tabs-pk
// =============================================================================

describe('tabs-pk', () => {
  const HTML = readOrganism('tabs-pk.html');
  const SRC  = 'components/tabs-pk.html';

  it('resolves', async () => {
    const obs = registerAndInit('tabs-pk', SRC, HTML);
    document.body.innerHTML = `
      <tabs-pk>
        <button slot="tabs" data-panel="p1">Tab 1</button>
        <div slot="panels" id="p1">Panel 1</div>
      </tabs-pk>`;
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('tabs-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .tabs structure with nav and body', async () => {
    const obs = registerAndInit('tabs-pk', SRC, HTML);
    document.body.innerHTML = `
      <tabs-pk>
        <button slot="tabs" data-panel="p1">Tab 1</button>
        <div slot="panels" id="p1">Panel 1</div>
      </tabs-pk>`;
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.tabs')).toBeTruthy();
    expect(document.querySelector('.tabs__nav')).toBeTruthy();
    expect(document.querySelector('.tabs__body')).toBeTruthy();
    obs.disconnect();
  });

  it('activates first tab by default (aria-selected="true")', async () => {
    const obs = registerAndInit('tabs-pk', SRC, HTML);
    document.body.innerHTML = `
      <tabs-pk>
        <button slot="tabs" data-panel="p1">Tab 1</button>
        <button slot="tabs" data-panel="p2">Tab 2</button>
        <div slot="panels" id="p1">Panel 1</div>
        <div slot="panels" id="p2">Panel 2</div>
      </tabs-pk>`;
    PseudoKit.init(document.body);
    await flush();
    const tabs = document.querySelectorAll('button[role="tab"]');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    obs.disconnect();
  });

  it('shows first panel and hides others', async () => {
    const obs = registerAndInit('tabs-pk', SRC, HTML);
    document.body.innerHTML = `
      <tabs-pk>
        <button slot="tabs" data-panel="p1">Tab 1</button>
        <button slot="tabs" data-panel="p2">Tab 2</button>
        <div slot="panels" id="p1">Panel 1</div>
        <div slot="panels" id="p2">Panel 2</div>
      </tabs-pk>`;
    PseudoKit.init(document.body);
    await flush();
    expect(document.getElementById('p1').hasAttribute('hidden')).toBe(false);
    expect(document.getElementById('p2').hasAttribute('hidden')).toBe(true);
    obs.disconnect();
  });

  it('wires ARIA roles and relationships', async () => {
    const obs = registerAndInit('tabs-pk', SRC, HTML);
    document.body.innerHTML = `
      <tabs-pk>
        <button slot="tabs" data-panel="p1">Tab 1</button>
        <div slot="panels" id="p1">Panel 1</div>
      </tabs-pk>`;
    PseudoKit.init(document.body);
    await flush();
    const tab   = document.querySelector('button[role="tab"]');
    const panel = document.getElementById('p1');
    expect(tab.getAttribute('aria-controls')).toBe('p1');
    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
    obs.disconnect();
  });

  it('activates tab by [active] prop', async () => {
    const obs = registerAndInit('tabs-pk', SRC, HTML);
    document.body.innerHTML = `
      <tabs-pk active="p2">
        <button slot="tabs" data-panel="p1">Tab 1</button>
        <button slot="tabs" data-panel="p2">Tab 2</button>
        <div slot="panels" id="p1">Panel 1</div>
        <div slot="panels" id="p2">Panel 2</div>
      </tabs-pk>`;
    PseudoKit.init(document.body);
    await flush();
    const tabs = document.querySelectorAll('button[role="tab"]');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(document.getElementById('p2').hasAttribute('hidden')).toBe(false);
    expect(document.getElementById('p1').hasAttribute('hidden')).toBe(true);
    obs.disconnect();
  });

  it('sets data-ready="true" on init', async () => {
    const obs = registerAndInit('tabs-pk', SRC, HTML);
    document.body.innerHTML = `
      <tabs-pk>
        <button slot="tabs" data-panel="p1">Tab 1</button>
        <div slot="panels" id="p1">Panel 1</div>
      </tabs-pk>`;
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('tabs-pk').getAttribute('data-ready')).toBe('true');
    obs.disconnect();
  });
});
