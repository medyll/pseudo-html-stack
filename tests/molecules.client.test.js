/**
 * @fileoverview molecules.client.test.js
 * Vitest unit tests for all 16 molecule-layer pseudo-kit components.
 * Story: S8-02
 *
 * Run: npx vitest run tests/molecules.client.test.js
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

const MOLECULES_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '../src/pseudo-assets/components/molecules',
);

function readMolecule(filename) {
  return readFileSync(join(MOLECULES_DIR, filename), 'utf8');
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
// breadcrumb-pk
// =============================================================================

describe('breadcrumb-pk', () => {
  const HTML = readMolecule('breadcrumb-pk.html');
  const SRC  = 'components/breadcrumb-pk.html';

  it('resolves', async () => {
    const obs = registerAndInit('breadcrumb-pk', SRC, HTML);
    document.body.innerHTML = '<breadcrumb-pk><a slot="items" href="/">Home</a><span slot="items">Page</span></breadcrumb-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('breadcrumb-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps nav.breadcrumb with aria-label', async () => {
    const obs = registerAndInit('breadcrumb-pk', SRC, HTML);
    document.body.innerHTML = '<breadcrumb-pk><a slot="items" href="/">Home</a><span slot="items">Page</span></breadcrumb-pk>';
    PseudoKit.init(document.body);
    await flush();
    const nav = document.querySelector('nav.breadcrumb');
    expect(nav).toBeTruthy();
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
    obs.disconnect();
  });

  it('contains ol.breadcrumb__list', async () => {
    const obs = registerAndInit('breadcrumb-pk', SRC, HTML);
    document.body.innerHTML = '<breadcrumb-pk><a slot="items" href="/">Home</a><span slot="items">Page</span></breadcrumb-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('ol.breadcrumb__list')).toBeTruthy();
    obs.disconnect();
  });

  it('wraps items in li.breadcrumb__item elements', async () => {
    const obs = registerAndInit('breadcrumb-pk', SRC, HTML);
    document.body.innerHTML = '<breadcrumb-pk><a slot="items" href="/">Home</a><a slot="items" href="/cat">Category</a><span slot="items">Page</span></breadcrumb-pk>';
    PseudoKit.init(document.body);
    await flush();
    const items = document.querySelectorAll('li.breadcrumb__item');
    expect(items.length).toBe(3);
    obs.disconnect();
  });

  it('marks last item with aria-current="page"', async () => {
    const obs = registerAndInit('breadcrumb-pk', SRC, HTML);
    document.body.innerHTML = '<breadcrumb-pk><a slot="items" href="/">Home</a><span slot="items">Current</span></breadcrumb-pk>';
    PseudoKit.init(document.body);
    await flush();
    const items = document.querySelectorAll('li.breadcrumb__item');
    const lastItem = items[items.length - 1].firstElementChild;
    expect(lastItem.getAttribute('aria-current')).toBe('page');
    obs.disconnect();
  });

  it('uses custom label prop for nav aria-label', async () => {
    const obs = registerAndInit('breadcrumb-pk', SRC, HTML);
    document.body.innerHTML = '<breadcrumb-pk label="You are here"><span slot="items">Home</span></breadcrumb-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('nav.breadcrumb').getAttribute('aria-label')).toBe('You are here');
    obs.disconnect();
  });

  it('sets data-ready="true" on init', async () => {
    const obs = registerAndInit('breadcrumb-pk', SRC, HTML);
    document.body.innerHTML = '<breadcrumb-pk><span slot="items">Home</span></breadcrumb-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('breadcrumb-pk').getAttribute('data-ready')).toBe('true');
    obs.disconnect();
  });
});

// =============================================================================
// card-pk
// =============================================================================

describe('card-pk', () => {
  const HTML = readMolecule('card.html');
  const SRC  = 'components/card.html';

  it('resolves', async () => {
    const obs = registerAndInit('card-pk', SRC, HTML);
    document.body.innerHTML = '<card-pk></card-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('card-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps article.card with all slot wrappers', async () => {
    const obs = registerAndInit('card-pk', SRC, HTML);
    document.body.innerHTML = '<card-pk></card-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('article.card')).toBeTruthy();
    expect(document.querySelector('.card__media')).toBeTruthy();
    expect(document.querySelector('.card__header')).toBeTruthy();
    expect(document.querySelector('.card__body')).toBeTruthy();
    expect(document.querySelector('.card__actions')).toBeTruthy();
    obs.disconnect();
  });

  it('routes named slot "actions" content', async () => {
    const obs = registerAndInit('card-pk', SRC, HTML);
    document.body.innerHTML = '<card-pk><button slot="actions" class="action-btn">Buy</button></card-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.action-btn')).toBeTruthy();
    obs.disconnect();
  });

  it('reflects elevated attribute', async () => {
    const obs = registerAndInit('card-pk', SRC, HTML);
    document.body.innerHTML = '<card-pk elevated></card-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('card-pk').hasAttribute('elevated')).toBe(true);
    obs.disconnect();
  });
});

// =============================================================================
// card-media-pk
// =============================================================================

describe('card-media-pk', () => {
  const HTML = readMolecule('card-media.html');
  const SRC  = 'components/card-media.html';

  it('resolves', async () => {
    const obs = registerAndInit('card-media-pk', SRC, HTML);
    document.body.innerHTML = '<card-media-pk src="img.jpg" alt="x"></card-media-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('card-media-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps figure.card-media with img and overlay', async () => {
    const obs = registerAndInit('card-media-pk', SRC, HTML);
    document.body.innerHTML = '<card-media-pk src="img.jpg" alt="x"></card-media-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('figure.card-media')).toBeTruthy();
    expect(document.querySelector('img.card-media__img')).toBeTruthy();
    expect(document.querySelector('.card-media__overlay')).toBeTruthy();
    obs.disconnect();
  });

  it('accepts overlay named slot', async () => {
    const obs = registerAndInit('card-media-pk', SRC, HTML);
    document.body.innerHTML = '<card-media-pk src="img.jpg" alt="x"><span slot="overlay" class="overlay-badge">NEW</span></card-media-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.overlay-badge')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// dropdown-pk
// =============================================================================

describe('dropdown-pk', () => {
  const HTML = readMolecule('dropdown.html');
  const SRC  = 'components/dropdown.html';

  it('resolves', async () => {
    const obs = registerAndInit('dropdown-pk', SRC, HTML);
    document.body.innerHTML = '<dropdown-pk label="Options"></dropdown-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('dropdown-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .dropdown with trigger button and menu', async () => {
    const obs = registerAndInit('dropdown-pk', SRC, HTML);
    document.body.innerHTML = '<dropdown-pk label="Menu"></dropdown-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.dropdown')).toBeTruthy();
    expect(document.querySelector('button.dropdown__trigger')).toBeTruthy();
    expect(document.querySelector('ul.dropdown__menu[role="listbox"]')).toBeTruthy();
    obs.disconnect();
  });

  it('contains .dropdown__arrow', async () => {
    const obs = registerAndInit('dropdown-pk', SRC, HTML);
    document.body.innerHTML = '<dropdown-pk></dropdown-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.dropdown__arrow')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// form-field-pk
// =============================================================================

describe('form-field-pk', () => {
  const HTML = readMolecule('form-field.html');
  const SRC  = 'components/form-field.html';

  it('resolves', async () => {
    const obs = registerAndInit('form-field-pk', SRC, HTML);
    document.body.innerHTML = '<form-field-pk label="Email" name="email"></form-field-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('form-field-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .form-field with label, control, hint and error slots', async () => {
    const obs = registerAndInit('form-field-pk', SRC, HTML);
    document.body.innerHTML = '<form-field-pk name="email"></form-field-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.form-field')).toBeTruthy();
    expect(document.querySelector('.form-field__label')).toBeTruthy();
    expect(document.querySelector('.form-field__control')).toBeTruthy();
    expect(document.querySelector('.form-field__error[role="alert"]')).toBeTruthy();
    obs.disconnect();
  });

  it('contains .form-field__required marker', async () => {
    const obs = registerAndInit('form-field-pk', SRC, HTML);
    document.body.innerHTML = '<form-field-pk required name="email"></form-field-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.form-field__required')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// list-item-pk
// =============================================================================

describe('list-item-pk', () => {
  const HTML = readMolecule('list-item.html');
  const SRC  = 'components/list-item.html';

  it('resolves', async () => {
    const obs = registerAndInit('list-item-pk', SRC, HTML);
    document.body.innerHTML = '<list-item-pk primary="Item"></list-item-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('list-item-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .list-item with leading, content and trailing sections', async () => {
    const obs = registerAndInit('list-item-pk', SRC, HTML);
    document.body.innerHTML = '<list-item-pk primary="Item"></list-item-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.list-item')).toBeTruthy();
    expect(document.querySelector('.list-item__leading')).toBeTruthy();
    expect(document.querySelector('.list-item__content')).toBeTruthy();
    expect(document.querySelector('.list-item__trailing')).toBeTruthy();
    obs.disconnect();
  });

  it('routes leading slot content', async () => {
    const obs = registerAndInit('list-item-pk', SRC, HTML);
    document.body.innerHTML = '<list-item-pk primary="X"><span slot="leading" class="lead-icon">★</span></list-item-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.lead-icon')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// menu-item-pk
// =============================================================================

describe('menu-item-pk', () => {
  const HTML = readMolecule('menu-item.html');
  const SRC  = 'components/menu-item.html';

  it('resolves', async () => {
    const obs = registerAndInit('menu-item-pk', SRC, HTML);
    document.body.innerHTML = '<menu-item-pk label="Settings"></menu-item-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('menu-item-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps li.menu-item with anchor link', async () => {
    const obs = registerAndInit('menu-item-pk', SRC, HTML);
    document.body.innerHTML = '<menu-item-pk label="Profile"></menu-item-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('li.menu-item[role="none"]')).toBeTruthy();
    expect(document.querySelector('a.menu-item__link[role="menuitem"]')).toBeTruthy();
    obs.disconnect();
  });

  it('contains icon and label slot wrappers', async () => {
    const obs = registerAndInit('menu-item-pk', SRC, HTML);
    document.body.innerHTML = '<menu-item-pk label="Docs"><span slot="icon" class="menu-icon">📄</span></menu-item-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.menu-item__icon')).toBeTruthy();
    expect(document.querySelector('.menu-item__label')).toBeTruthy();
    expect(document.querySelector('.menu-icon')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// modal-pk
// =============================================================================

describe('modal-pk', () => {
  const HTML = readMolecule('modal.html');
  const SRC  = 'components/modal.html';

  it('resolves', async () => {
    const obs = registerAndInit('modal-pk', SRC, HTML);
    document.body.innerHTML = '<modal-pk></modal-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('modal-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps <dialog> element with implicit dialog role and aria-labelledby', async () => {
    const obs = registerAndInit('modal-pk', SRC, HTML);
    document.body.innerHTML = '<modal-pk></modal-pk>';
    PseudoKit.init(document.body);
    await flush();
    const dialog = document.querySelector('dialog.modal');
    expect(dialog).toBeTruthy();
    // <dialog> provides implicit role="dialog" and aria-modal="true" — no manual attributes needed
    expect(dialog.getAttribute('aria-labelledby')).toBe('modal-title');
    obs.disconnect();
  });

  it('contains container, header, body, footer and close button (no backdrop DOM)', async () => {
    const obs = registerAndInit('modal-pk', SRC, HTML);
    document.body.innerHTML = '<modal-pk></modal-pk>';
    PseudoKit.init(document.body);
    await flush();
    // <dialog> element (replaces .modal div)
    expect(document.querySelector('dialog.modal')).toBeTruthy();
    // .modal__backdrop removed — ::backdrop pseudo-element is native now
    expect(document.querySelector('.modal__backdrop')).toBeFalsy();
    // Container and slots preserved
    expect(document.querySelector('.modal__container')).toBeTruthy();
    expect(document.querySelector('.modal__header')).toBeTruthy();
    expect(document.querySelector('.modal__body')).toBeTruthy();
    expect(document.querySelector('.modal__footer')).toBeTruthy();
    expect(document.querySelector('button.modal__close')).toBeTruthy();
    obs.disconnect();
  });

  it('routes footer slot content', async () => {
    const obs = registerAndInit('modal-pk', SRC, HTML);
    document.body.innerHTML = '<modal-pk><button slot="footer" class="confirm-btn">OK</button></modal-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.confirm-btn')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// notification-pk
// =============================================================================

describe('notification-pk', () => {
  const HTML = readMolecule('notification.html');
  const SRC  = 'components/notification.html';

  it('resolves', async () => {
    const obs = registerAndInit('notification-pk', SRC, HTML);
    document.body.innerHTML = '<notification-pk></notification-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('notification-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .notification with role=alert', async () => {
    const obs = registerAndInit('notification-pk', SRC, HTML);
    document.body.innerHTML = '<notification-pk></notification-pk>';
    PseudoKit.init(document.body);
    await flush();
    const el = document.querySelector('.notification');
    expect(el).toBeTruthy();
    expect(el.getAttribute('role')).toBe('alert');
    obs.disconnect();
  });

  it('contains icon, content, action and dismiss sections', async () => {
    const obs = registerAndInit('notification-pk', SRC, HTML);
    document.body.innerHTML = '<notification-pk></notification-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.notification__icon')).toBeTruthy();
    expect(document.querySelector('.notification__content')).toBeTruthy();
    expect(document.querySelector('.notification__action')).toBeTruthy();
    expect(document.querySelector('button.notification__dismiss')).toBeTruthy();
    obs.disconnect();
  });

  it('reflects variant attribute', async () => {
    const obs = registerAndInit('notification-pk', SRC, HTML);
    document.body.innerHTML = '<notification-pk variant="success"></notification-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('notification-pk').getAttribute('variant')).toBe('success');
    obs.disconnect();
  });
});

// =============================================================================
// pagination-pk
// =============================================================================

describe('pagination-pk', () => {
  const HTML = readMolecule('pagination.html');
  const SRC  = 'components/pagination.html';

  it('resolves', async () => {
    const obs = registerAndInit('pagination-pk', SRC, HTML);
    document.body.innerHTML = '<pagination-pk page="1" total="10"></pagination-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('pagination-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps nav.pagination with prev/next buttons', async () => {
    const obs = registerAndInit('pagination-pk', SRC, HTML);
    document.body.innerHTML = '<pagination-pk page="2" total="5"></pagination-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('nav.pagination[aria-label="Pagination"]')).toBeTruthy();
    expect(document.querySelector('.pagination__btn--prev')).toBeTruthy();
    expect(document.querySelector('.pagination__btn--next')).toBeTruthy();
    obs.disconnect();
  });

  it('contains pagination list with page buttons', async () => {
    const obs = registerAndInit('pagination-pk', SRC, HTML);
    document.body.innerHTML = '<pagination-pk page="1" total="3"></pagination-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('ul.pagination__list')).toBeTruthy();
    expect(document.querySelectorAll('.pagination__page').length).toBeGreaterThan(0);
    obs.disconnect();
  });
});

// =============================================================================
// price-tag-pk
// =============================================================================

describe('price-tag-pk', () => {
  const HTML = readMolecule('price-tag.html');
  const SRC  = 'components/price-tag.html';

  it('resolves', async () => {
    const obs = registerAndInit('price-tag-pk', SRC, HTML);
    document.body.innerHTML = '<price-tag-pk price="9.99"></price-tag-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('price-tag-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .price-tag with current and original slots', async () => {
    const obs = registerAndInit('price-tag-pk', SRC, HTML);
    document.body.innerHTML = '<price-tag-pk price="9.99"></price-tag-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.price-tag')).toBeTruthy();
    expect(document.querySelector('.price-tag__current')).toBeTruthy();
    expect(document.querySelector('.price-tag__original')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// product-tile-pk
// =============================================================================

describe('product-tile-pk', () => {
  const HTML = readMolecule('product-tile.html');
  const SRC  = 'components/product-tile.html';

  it('resolves', async () => {
    const obs = registerAndInit('product-tile-pk', SRC, HTML);
    document.body.innerHTML = '<product-tile-pk title="Widget" price="29"></product-tile-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('product-tile-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps article.product-tile with badge, media, body and actions', async () => {
    const obs = registerAndInit('product-tile-pk', SRC, HTML);
    document.body.innerHTML = '<product-tile-pk title="Shoe" price="49"></product-tile-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('article.product-tile')).toBeTruthy();
    expect(document.querySelector('.product-tile__badge')).toBeTruthy();
    expect(document.querySelector('.product-tile__media')).toBeTruthy();
    expect(document.querySelector('.product-tile__body')).toBeTruthy();
    expect(document.querySelector('.product-tile__actions')).toBeTruthy();
    obs.disconnect();
  });

  it('routes actions slot content', async () => {
    const obs = registerAndInit('product-tile-pk', SRC, HTML);
    document.body.innerHTML = '<product-tile-pk title="X" price="1"><button slot="actions" class="add-to-cart">Add</button></product-tile-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.add-to-cart')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// search-bar-pk
// =============================================================================

describe('search-bar-pk', () => {
  const HTML = readMolecule('search-bar.html');
  const SRC  = 'components/search-bar.html';

  it('resolves', async () => {
    const obs = registerAndInit('search-bar-pk', SRC, HTML);
    document.body.innerHTML = '<search-bar-pk></search-bar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('search-bar-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .search-bar with role=search and input', async () => {
    const obs = registerAndInit('search-bar-pk', SRC, HTML);
    document.body.innerHTML = '<search-bar-pk></search-bar-pk>';
    PseudoKit.init(document.body);
    await flush();
    const el = document.querySelector('.search-bar');
    expect(el).toBeTruthy();
    expect(el.getAttribute('role')).toBe('search');
    expect(document.querySelector('input.search-bar__input[type="search"]')).toBeTruthy();
    obs.disconnect();
  });

  it('contains prefix, suffix and loader sections', async () => {
    const obs = registerAndInit('search-bar-pk', SRC, HTML);
    document.body.innerHTML = '<search-bar-pk></search-bar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.search-bar__icon')).toBeTruthy();
    expect(document.querySelector('.search-bar__suffix')).toBeTruthy();
    expect(document.querySelector('.search-bar__loader')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// tab-bar-pk
// =============================================================================

describe('tab-bar-pk', () => {
  const HTML = readMolecule('tab-bar.html');
  const SRC  = 'components/tab-bar.html';

  it('resolves', async () => {
    const obs = registerAndInit('tab-bar-pk', SRC, HTML);
    document.body.innerHTML = '<tab-bar-pk></tab-bar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('tab-bar-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .tab-bar with role=tablist', async () => {
    const obs = registerAndInit('tab-bar-pk', SRC, HTML);
    document.body.innerHTML = '<tab-bar-pk></tab-bar-pk>';
    PseudoKit.init(document.body);
    await flush();
    const el = document.querySelector('.tab-bar');
    expect(el).toBeTruthy();
    expect(el.getAttribute('role')).toBe('tablist');
    obs.disconnect();
  });

  it('contains tab buttons with role=tab', async () => {
    const obs = registerAndInit('tab-bar-pk', SRC, HTML);
    document.body.innerHTML = '<tab-bar-pk></tab-bar-pk>';
    PseudoKit.init(document.body);
    await flush();
    const tabs = document.querySelectorAll('.tab-bar__tab[role="tab"]');
    expect(tabs.length).toBeGreaterThanOrEqual(2);
    obs.disconnect();
  });

  it('has first tab marked as active with aria-selected=true', async () => {
    const obs = registerAndInit('tab-bar-pk', SRC, HTML);
    document.body.innerHTML = '<tab-bar-pk></tab-bar-pk>';
    PseudoKit.init(document.body);
    await flush();
    const active = document.querySelector('.tab-bar__tab--active');
    expect(active).toBeTruthy();
    expect(active.getAttribute('aria-selected')).toBe('true');
    obs.disconnect();
  });
});

// =============================================================================
// tooltip-pk
// =============================================================================

describe('tooltip-pk', () => {
  const HTML = readMolecule('tooltip.html');
  const SRC  = 'components/tooltip.html';

  it('resolves', async () => {
    const obs = registerAndInit('tooltip-pk', SRC, HTML);
    document.body.innerHTML = '<tooltip-pk content="Help text">Hover</tooltip-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('tooltip-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps span.tooltip with role=tooltip', async () => {
    const obs = registerAndInit('tooltip-pk', SRC, HTML);
    document.body.innerHTML = '<tooltip-pk content="Info">Label</tooltip-pk>';
    PseudoKit.init(document.body);
    await flush();
    const el = document.querySelector('span.tooltip');
    expect(el).toBeTruthy();
    expect(el.getAttribute('role')).toBe('tooltip');
    obs.disconnect();
  });

  it('contains trigger and content wrappers', async () => {
    const obs = registerAndInit('tooltip-pk', SRC, HTML);
    document.body.innerHTML = '<tooltip-pk>Click</tooltip-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.tooltip__trigger')).toBeTruthy();
    expect(document.querySelector('.tooltip__content')).toBeTruthy();
    obs.disconnect();
  });

  it('reflects position attribute', async () => {
    const obs = registerAndInit('tooltip-pk', SRC, HTML);
    document.body.innerHTML = '<tooltip-pk position="bottom">Label</tooltip-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('tooltip-pk').getAttribute('position')).toBe('bottom');
    obs.disconnect();
  });
});

// =============================================================================
// user-info-pk
// =============================================================================

describe('user-info-pk', () => {
  const HTML = readMolecule('user-info.html');
  const SRC  = 'components/user-info.html';

  it('resolves', async () => {
    const obs = registerAndInit('user-info-pk', SRC, HTML);
    document.body.innerHTML = '<user-info-pk name="Alice"></user-info-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('user-info-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .user-info with avatar, text and actions sections', async () => {
    const obs = registerAndInit('user-info-pk', SRC, HTML);
    document.body.innerHTML = '<user-info-pk name="Bob"></user-info-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.user-info')).toBeTruthy();
    expect(document.querySelector('.user-info__avatar')).toBeTruthy();
    expect(document.querySelector('.user-info__text')).toBeTruthy();
    expect(document.querySelector('.user-info__actions')).toBeTruthy();
    obs.disconnect();
  });

  it('contains name and role sub-elements', async () => {
    const obs = registerAndInit('user-info-pk', SRC, HTML);
    document.body.innerHTML = '<user-info-pk name="Carol"></user-info-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.user-info__name')).toBeTruthy();
    expect(document.querySelector('.user-info__role')).toBeTruthy();
    obs.disconnect();
  });

  it('routes avatar and actions slots', async () => {
    const obs = registerAndInit('user-info-pk', SRC, HTML);
    document.body.innerHTML = '<user-info-pk name="Dan"><img slot="avatar" class="custom-avatar" src="x.png" alt=""/><button slot="actions" class="follow-btn">Follow</button></user-info-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.custom-avatar')).toBeTruthy();
    expect(document.querySelector('.follow-btn')).toBeTruthy();
    obs.disconnect();
  });
});


// =============================================================================
// combobox-pk
// =============================================================================

describe('combobox-pk', () => {
  const HTML = readMolecule('combobox-pk.html');
  const SRC  = 'components/combobox-pk.html';

  it('resolves', async () => {
    const obs = registerAndInit('combobox-pk', SRC, HTML);
    document.body.innerHTML = '<combobox-pk name="lang"><option value="en">English</option></combobox-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('combobox-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .combobox wrapper with .combobox__input', async () => {
    const obs = registerAndInit('combobox-pk', SRC, HTML);
    document.body.innerHTML = '<combobox-pk name="lang"></combobox-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.combobox')).toBeTruthy();
    expect(document.querySelector('input.combobox__input')).toBeTruthy();
    obs.disconnect();
  });

  it('contains .combobox__listbox with role=listbox', async () => {
    const obs = registerAndInit('combobox-pk', SRC, HTML);
    document.body.innerHTML = '<combobox-pk name="lang"></combobox-pk>';
    PseudoKit.init(document.body);
    await flush();
    const listbox = document.querySelector('.combobox__listbox');
    expect(listbox).toBeTruthy();
    expect(listbox.getAttribute('role')).toBe('listbox');
    obs.disconnect();
  });

  it('contains .combobox__hidden for form submission', async () => {
    const obs = registerAndInit('combobox-pk', SRC, HTML);
    document.body.innerHTML = '<combobox-pk name="country"></combobox-pk>';
    PseudoKit.init(document.body);
    await flush();
    const hidden = document.querySelector('input.combobox__hidden');
    expect(hidden).toBeTruthy();
    expect(hidden.type).toBe('hidden');
    expect(hidden.getAttribute('name')).toBe('country');
    obs.disconnect();
  });
});