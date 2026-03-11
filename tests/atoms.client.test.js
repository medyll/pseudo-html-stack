/**
 * @fileoverview atoms.client.test.js
 * Vitest unit tests for all 17 atom-layer pseudo-kit components.
 * Story: S8-01
 *
 * Run: npx vitest run tests/atoms.client.test.js
 * Env: happy-dom (configured in vitest.config.js)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

const ATOMS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '../src/pseudo-assets/components/atoms',
);

function readAtom(filename) {
  return readFileSync(join(ATOMS_DIR, filename), 'utf8');
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
  const obs = PseudoKit.init(document.body);
  return obs;
}

// ── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  reset_shared();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

// =============================================================================
// avatar
// =============================================================================

describe('avatar-pk', () => {
  const HTML = readAtom('avatar.html');
  const SRC  = 'components/avatar.html';

  it('resolves', async () => {
    const obs = registerAndInit('avatar-pk', SRC, HTML);
    document.body.innerHTML = '<avatar-pk></avatar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('avatar-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .avatar root element', async () => {
    const obs = registerAndInit('avatar-pk', SRC, HTML);
    document.body.innerHTML = '<avatar-pk></avatar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.avatar')).toBeTruthy();
    obs.disconnect();
  });

  it('contains .avatar__initials span', async () => {
    const obs = registerAndInit('avatar-pk', SRC, HTML);
    document.body.innerHTML = '<avatar-pk></avatar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.avatar__initials')).toBeTruthy();
    obs.disconnect();
  });

  it('accepts default slot content', async () => {
    const obs = registerAndInit('avatar-pk', SRC, HTML);
    document.body.innerHTML = '<avatar-pk><img class="custom-img" src="x.png" alt="x"/></avatar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.custom-img')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// badge
// =============================================================================

describe('badge-pk', () => {
  const HTML = readAtom('badge.html');
  const SRC  = 'components/badge.html';

  it('resolves', async () => {
    const obs = registerAndInit('badge-pk', SRC, HTML);
    document.body.innerHTML = '<badge-pk></badge-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('badge-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .badge root element', async () => {
    const obs = registerAndInit('badge-pk', SRC, HTML);
    document.body.innerHTML = '<badge-pk></badge-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.badge')).toBeTruthy();
    obs.disconnect();
  });

  it('contains .badge__label and .badge__dot', async () => {
    const obs = registerAndInit('badge-pk', SRC, HTML);
    document.body.innerHTML = '<badge-pk></badge-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.badge__label')).toBeTruthy();
    expect(document.querySelector('.badge__dot')).toBeTruthy();
    obs.disconnect();
  });

  it('reflects variant attribute on host element', async () => {
    const obs = registerAndInit('badge-pk', SRC, HTML);
    document.body.innerHTML = '<badge-pk variant="success"></badge-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('badge-pk').getAttribute('variant')).toBe('success');
    obs.disconnect();
  });
});

// =============================================================================
// button-pk
// =============================================================================

describe('button-pk', () => {
  const HTML = readAtom('button-pk.html');
  const SRC  = 'components/button-pk.html';

  it('resolves', async () => {
    const obs = registerAndInit('button-pk', SRC, HTML);
    document.body.innerHTML = '<button-pk></button-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('button-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .button element', async () => {
    const obs = registerAndInit('button-pk', SRC, HTML);
    document.body.innerHTML = '<button-pk></button-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.button')).toBeTruthy();
    obs.disconnect();
  });

  it('has default slot via .button__label', async () => {
    const obs = registerAndInit('button-pk', SRC, HTML);
    document.body.innerHTML = '<button-pk>Save</button-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.button__label')).toBeTruthy();
    obs.disconnect();
  });

  it('contains icon-left and icon-right slot wrappers', async () => {
    const obs = registerAndInit('button-pk', SRC, HTML);
    document.body.innerHTML = '<button-pk><span slot="icon-left">←</span></button-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.button__icon-left')).toBeTruthy();
    expect(document.querySelector('.button__icon-right')).toBeTruthy();
    obs.disconnect();
  });

  it('reflects variant attribute', async () => {
    const obs = registerAndInit('button-pk', SRC, HTML);
    document.body.innerHTML = '<button-pk variant="primary">OK</button-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('button-pk').getAttribute('variant')).toBe('primary');
    obs.disconnect();
  });
});

// =============================================================================
// chip-pk
// =============================================================================

describe('chip-pk', () => {
  const HTML = readAtom('chip.html');
  const SRC  = 'components/chip.html';

  it('resolves', async () => {
    const obs = registerAndInit('chip-pk', SRC, HTML);
    document.body.innerHTML = '<chip-pk></chip-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('chip-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .chip root and .chip__label', async () => {
    const obs = registerAndInit('chip-pk', SRC, HTML);
    document.body.innerHTML = '<chip-pk></chip-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.chip')).toBeTruthy();
    expect(document.querySelector('.chip__label')).toBeTruthy();
    obs.disconnect();
  });

  it('contains icon named slot wrapper', async () => {
    const obs = registerAndInit('chip-pk', SRC, HTML);
    document.body.innerHTML = '<chip-pk><span slot="icon">★</span></chip-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.chip__icon')).toBeTruthy();
    obs.disconnect();
  });

  it('contains remove button', async () => {
    const obs = registerAndInit('chip-pk', SRC, HTML);
    document.body.innerHTML = '<chip-pk></chip-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.chip__remove')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// divider-pk
// =============================================================================

describe('divider-pk', () => {
  const HTML = readAtom('divider.html');
  const SRC  = 'components/divider.html';

  it('resolves', async () => {
    const obs = registerAndInit('divider-pk', SRC, HTML);
    document.body.innerHTML = '<divider-pk></divider-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('divider-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .divider with role=separator', async () => {
    const obs = registerAndInit('divider-pk', SRC, HTML);
    document.body.innerHTML = '<divider-pk></divider-pk>';
    PseudoKit.init(document.body);
    await flush();
    const el = document.querySelector('.divider');
    expect(el).toBeTruthy();
    expect(el.getAttribute('role')).toBe('separator');
    obs.disconnect();
  });

  it('contains .divider__label slot wrapper', async () => {
    const obs = registerAndInit('divider-pk', SRC, HTML);
    document.body.innerHTML = '<divider-pk>OR</divider-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.divider__label')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// icon-pk
// =============================================================================

describe('icon-pk', () => {
  const HTML = readAtom('icon.html');
  const SRC  = 'components/icon.html';

  it('resolves', async () => {
    const obs = registerAndInit('icon-pk', SRC, HTML);
    document.body.innerHTML = '<icon-pk></icon-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('icon-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .icon with role=img', async () => {
    const obs = registerAndInit('icon-pk', SRC, HTML);
    document.body.innerHTML = '<icon-pk></icon-pk>';
    PseudoKit.init(document.body);
    await flush();
    const el = document.querySelector('.icon');
    expect(el).toBeTruthy();
    expect(el.getAttribute('role')).toBe('img');
    obs.disconnect();
  });

  it('places SVG slot content inside .icon', async () => {
    const obs = registerAndInit('icon-pk', SRC, HTML);
    document.body.innerHTML = '<icon-pk><svg class="my-svg"></svg></icon-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.my-svg')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// image-pk
// =============================================================================

describe('image-pk', () => {
  const HTML = readAtom('image.html');
  const SRC  = 'components/image.html';

  it('resolves', async () => {
    const obs = registerAndInit('image-pk', SRC, HTML);
    document.body.innerHTML = '<image-pk src="img.png" alt="test"></image-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('image-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps figure.image with .image__img and .image__fallback', async () => {
    const obs = registerAndInit('image-pk', SRC, HTML);
    document.body.innerHTML = '<image-pk src="img.png" alt="test"></image-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('figure.image')).toBeTruthy();
    expect(document.querySelector('.image__img')).toBeTruthy();
    expect(document.querySelector('.image__fallback')).toBeTruthy();
    obs.disconnect();
  });

  it('accepts custom fallback slot', async () => {
    const obs = registerAndInit('image-pk', SRC, HTML);
    document.body.innerHTML = '<image-pk><span slot="fallback" class="custom-fallback">N/A</span></image-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.custom-fallback')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// input-pk
// =============================================================================

describe('input-pk', () => {
  const HTML = readAtom('input-pk.html');
  const SRC  = 'components/input-pk.html';

  it('resolves', async () => {
    const obs = registerAndInit('input-pk', SRC, HTML);
    document.body.innerHTML = '<input-pk name="email"></input-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('input-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .input wrapper with input.input__field', async () => {
    const obs = registerAndInit('input-pk', SRC, HTML);
    document.body.innerHTML = '<input-pk name="q"></input-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.input')).toBeTruthy();
    expect(document.querySelector('input.input__field')).toBeTruthy();
    obs.disconnect();
  });

  it('contains prefix and suffix slot wrappers', async () => {
    const obs = registerAndInit('input-pk', SRC, HTML);
    document.body.innerHTML = '<input-pk name="q"><span slot="prefix">@</span></input-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.input__prefix')).toBeTruthy();
    expect(document.querySelector('.input__suffix')).toBeTruthy();
    obs.disconnect();
  });

  it('contains .input__error-fallback for alert messages', async () => {
    const obs = registerAndInit('input-pk', SRC, HTML);
    document.body.innerHTML = '<input-pk name="q"></input-pk>';
    PseudoKit.init(document.body);
    await flush();
    const err = document.querySelector('.input__error-fallback');
    expect(err).toBeTruthy();
    expect(err.getAttribute('role')).toBe('alert');
    obs.disconnect();
  });
});

// =============================================================================
// label-pk
// =============================================================================

describe('label-pk', () => {
  const HTML = readAtom('label-pk.html');
  const SRC  = 'components/label-pk.html';

  it('resolves', async () => {
    const obs = registerAndInit('label-pk', SRC, HTML);
    document.body.innerHTML = '<label-pk>Email</label-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('label-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps label.label element', async () => {
    const obs = registerAndInit('label-pk', SRC, HTML);
    document.body.innerHTML = '<label-pk>Name</label-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('label.label')).toBeTruthy();
    obs.disconnect();
  });

  it('contains .label__required span', async () => {
    const obs = registerAndInit('label-pk', SRC, HTML);
    document.body.innerHTML = '<label-pk required>Name</label-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.label__required')).toBeTruthy();
    obs.disconnect();
  });

  it('reflects default slot text', async () => {
    const obs = registerAndInit('label-pk', SRC, HTML);
    document.body.innerHTML = '<label-pk><span class="label-text">Username</span></label-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.label-text')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// loader-pk
// =============================================================================

describe('loader-pk', () => {
  const HTML = readAtom('loader.html');
  const SRC  = 'components/loader.html';

  it('resolves', async () => {
    const obs = registerAndInit('loader-pk', SRC, HTML);
    document.body.innerHTML = '<loader-pk></loader-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('loader-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .loader with role=status', async () => {
    const obs = registerAndInit('loader-pk', SRC, HTML);
    document.body.innerHTML = '<loader-pk></loader-pk>';
    PseudoKit.init(document.body);
    await flush();
    const el = document.querySelector('.loader');
    expect(el).toBeTruthy();
    expect(el.getAttribute('role')).toBe('status');
    obs.disconnect();
  });

  it('contains three .loader__bar elements', async () => {
    const obs = registerAndInit('loader-pk', SRC, HTML);
    document.body.innerHTML = '<loader-pk></loader-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelectorAll('.loader__bar').length).toBe(3);
    obs.disconnect();
  });
});

// =============================================================================
// progress-bar-pk
// =============================================================================

describe('progress-bar-pk', () => {
  const HTML = readAtom('progress-bar.html');
  const SRC  = 'components/progress-bar.html';

  it('resolves', async () => {
    const obs = registerAndInit('progress-bar-pk', SRC, HTML);
    document.body.innerHTML = '<progress-bar-pk value="50"></progress-bar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('progress-bar-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .progress-bar with role=progressbar', async () => {
    const obs = registerAndInit('progress-bar-pk', SRC, HTML);
    document.body.innerHTML = '<progress-bar-pk value="75"></progress-bar-pk>';
    PseudoKit.init(document.body);
    await flush();
    const el = document.querySelector('.progress-bar');
    expect(el).toBeTruthy();
    expect(el.getAttribute('role')).toBe('progressbar');
    obs.disconnect();
  });

  it('contains .progress-bar__track and .progress-bar__fill', async () => {
    const obs = registerAndInit('progress-bar-pk', SRC, HTML);
    document.body.innerHTML = '<progress-bar-pk value="30"></progress-bar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.progress-bar__track')).toBeTruthy();
    expect(document.querySelector('.progress-bar__fill')).toBeTruthy();
    obs.disconnect();
  });

  it('reflects variant attribute', async () => {
    const obs = registerAndInit('progress-bar-pk', SRC, HTML);
    document.body.innerHTML = '<progress-bar-pk value="60" variant="success"></progress-bar-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('progress-bar-pk').getAttribute('variant')).toBe('success');
    obs.disconnect();
  });
});

// =============================================================================
// rating-pk
// =============================================================================

describe('rating-pk', () => {
  const HTML = readAtom('rating.html');
  const SRC  = 'components/rating.html';

  it('resolves', async () => {
    const obs = registerAndInit('rating-pk', SRC, HTML);
    document.body.innerHTML = '<rating-pk value="3"></rating-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('rating-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .rating with role=img', async () => {
    const obs = registerAndInit('rating-pk', SRC, HTML);
    document.body.innerHTML = '<rating-pk value="4"></rating-pk>';
    PseudoKit.init(document.body);
    await flush();
    const el = document.querySelector('.rating');
    expect(el).toBeTruthy();
    expect(el.getAttribute('role')).toBe('img');
    obs.disconnect();
  });

  it('contains five .rating__star elements', async () => {
    const obs = registerAndInit('rating-pk', SRC, HTML);
    document.body.innerHTML = '<rating-pk value="2"></rating-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelectorAll('.rating__star').length).toBe(5);
    obs.disconnect();
  });

  it('contains .rating__value sr-only span', async () => {
    const obs = registerAndInit('rating-pk', SRC, HTML);
    document.body.innerHTML = '<rating-pk value="5"></rating-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.rating__value')).toBeTruthy();
    obs.disconnect();
  });
});

// =============================================================================
// skeleton-pk
// =============================================================================

describe('skeleton-pk', () => {
  const HTML = readAtom('skeleton.html');
  const SRC  = 'components/skeleton.html';

  it('resolves', async () => {
    const obs = registerAndInit('skeleton-pk', SRC, HTML);
    document.body.innerHTML = '<skeleton-pk></skeleton-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('skeleton-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .skeleton with aria-hidden and aria-busy', async () => {
    const obs = registerAndInit('skeleton-pk', SRC, HTML);
    document.body.innerHTML = '<skeleton-pk></skeleton-pk>';
    PseudoKit.init(document.body);
    await flush();
    const el = document.querySelector('.skeleton');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.getAttribute('aria-busy')).toBe('true');
    obs.disconnect();
  });

  it('reflects variant attribute', async () => {
    const obs = registerAndInit('skeleton-pk', SRC, HTML);
    document.body.innerHTML = '<skeleton-pk variant="circle"></skeleton-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('skeleton-pk').getAttribute('variant')).toBe('circle');
    obs.disconnect();
  });
});

// =============================================================================
// spinner-pk
// =============================================================================

describe('spinner-pk', () => {
  const HTML = readAtom('spinner.html');
  const SRC  = 'components/spinner.html';

  it('resolves', async () => {
    const obs = registerAndInit('spinner-pk', SRC, HTML);
    document.body.innerHTML = '<spinner-pk></spinner-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('spinner-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .spinner with role=status', async () => {
    const obs = registerAndInit('spinner-pk', SRC, HTML);
    document.body.innerHTML = '<spinner-pk></spinner-pk>';
    PseudoKit.init(document.body);
    await flush();
    const el = document.querySelector('.spinner');
    expect(el).toBeTruthy();
    expect(el.getAttribute('role')).toBe('status');
    obs.disconnect();
  });

  it('contains .spinner__svg with .spinner__track and .spinner__arc', async () => {
    const obs = registerAndInit('spinner-pk', SRC, HTML);
    document.body.innerHTML = '<spinner-pk></spinner-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.spinner__svg')).toBeTruthy();
    expect(document.querySelector('.spinner__track')).toBeTruthy();
    expect(document.querySelector('.spinner__arc')).toBeTruthy();
    obs.disconnect();
  });

  it('reflects size attribute', async () => {
    const obs = registerAndInit('spinner-pk', SRC, HTML);
    document.body.innerHTML = '<spinner-pk size="lg"></spinner-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('spinner-pk').getAttribute('size')).toBe('lg');
    obs.disconnect();
  });
});

// =============================================================================
// tag-pk
// =============================================================================

describe('tag-pk', () => {
  const HTML = readAtom('tag.html');
  const SRC  = 'components/tag.html';

  it('resolves', async () => {
    const obs = registerAndInit('tag-pk', SRC, HTML);
    document.body.innerHTML = '<tag-pk></tag-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('tag-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .tag with .tag__label', async () => {
    const obs = registerAndInit('tag-pk', SRC, HTML);
    document.body.innerHTML = '<tag-pk></tag-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.tag')).toBeTruthy();
    expect(document.querySelector('.tag__label')).toBeTruthy();
    obs.disconnect();
  });

  it('contains .tag__icon named slot wrapper', async () => {
    const obs = registerAndInit('tag-pk', SRC, HTML);
    document.body.innerHTML = '<tag-pk><span slot="icon">★</span></tag-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.tag__icon')).toBeTruthy();
    obs.disconnect();
  });

  it('reflects variant and outline attributes', async () => {
    const obs = registerAndInit('tag-pk', SRC, HTML);
    document.body.innerHTML = '<tag-pk variant="danger" outline></tag-pk>';
    PseudoKit.init(document.body);
    await flush();
    const host = document.querySelector('tag-pk');
    expect(host.getAttribute('variant')).toBe('danger');
    expect(host.hasAttribute('outline')).toBe(true);
    obs.disconnect();
  });
});

// =============================================================================
// textarea-pk
// =============================================================================

describe('textarea-pk', () => {
  const HTML = readAtom('textarea-pk.html');
  const SRC  = 'components/textarea-pk.html';

  it('resolves', async () => {
    const obs = registerAndInit('textarea-pk', SRC, HTML);
    document.body.innerHTML = '<textarea-pk name="bio"></textarea-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('textarea-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .textarea wrapper with textarea.textarea__field', async () => {
    const obs = registerAndInit('textarea-pk', SRC, HTML);
    document.body.innerHTML = '<textarea-pk name="bio"></textarea-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.textarea')).toBeTruthy();
    expect(document.querySelector('textarea.textarea__field')).toBeTruthy();
    obs.disconnect();
  });

  it('contains .textarea__error alert span', async () => {
    const obs = registerAndInit('textarea-pk', SRC, HTML);
    document.body.innerHTML = '<textarea-pk name="bio"></textarea-pk>';
    PseudoKit.init(document.body);
    await flush();
    const err = document.querySelector('.textarea__error');
    expect(err).toBeTruthy();
    expect(err.getAttribute('role')).toBe('alert');
    obs.disconnect();
  });

  it('contains .textarea__hint element', async () => {
    const obs = registerAndInit('textarea-pk', SRC, HTML);
    document.body.innerHTML = '<textarea-pk name="bio"></textarea-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.textarea__hint')).toBeTruthy();
    obs.disconnect();
  });

  it('forwards maxlength to inner textarea and initialises hint count', async () => {
    const obs = registerAndInit('textarea-pk', SRC, HTML);
    document.body.innerHTML = '<textarea-pk name="bio" maxlength="200"></textarea-pk>';
    PseudoKit.init(document.body);
    await flush();
    const field = document.querySelector('textarea.textarea__field');
    expect(field.getAttribute('maxlength')).toBe('200');
    const hint = document.querySelector('.textarea__hint');
    expect(hint.textContent).toBe('0 / 200');
    obs.disconnect();
  });
});

// =============================================================================
// toggle-pk
// =============================================================================

describe('toggle-pk', () => {
  const HTML = readAtom('toggle.html');
  const SRC  = 'components/toggle.html';

  it('resolves', async () => {
    const obs = registerAndInit('toggle-pk', SRC, HTML);
    document.body.innerHTML = '<toggle-pk name="notify"></toggle-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('toggle-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps label.toggle with checkbox input', async () => {
    const obs = registerAndInit('toggle-pk', SRC, HTML);
    document.body.innerHTML = '<toggle-pk name="notify"></toggle-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('label.toggle')).toBeTruthy();
    const input = document.querySelector('input.toggle__input');
    expect(input).toBeTruthy();
    expect(input.type).toBe('checkbox');
    obs.disconnect();
  });

  it('contains .toggle__track and .toggle__thumb', async () => {
    const obs = registerAndInit('toggle-pk', SRC, HTML);
    document.body.innerHTML = '<toggle-pk name="notify"></toggle-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.toggle__track')).toBeTruthy();
    expect(document.querySelector('.toggle__thumb')).toBeTruthy();
    obs.disconnect();
  });

  it('accepts label named slot', async () => {
    const obs = registerAndInit('toggle-pk', SRC, HTML);
    document.body.innerHTML = '<toggle-pk name="notify"><span slot="label" class="toggle-label-text">Enable</span></toggle-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.toggle-label-text')).toBeTruthy();
    obs.disconnect();
  });
});


// =============================================================================
// progress-pk
// =============================================================================

describe('progress-pk', () => {
  const HTML = readAtom('progress-pk.html');
  const SRC  = 'components/progress-pk.html';

  it('resolves', async () => {
    const obs = registerAndInit('progress-pk', SRC, HTML);
    document.body.innerHTML = '<progress-pk value="50"></progress-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('progress-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .progress wrapper with progress.progress__track', async () => {
    const obs = registerAndInit('progress-pk', SRC, HTML);
    document.body.innerHTML = '<progress-pk value="40"></progress-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.progress')).toBeTruthy();
    expect(document.querySelector('progress.progress__track')).toBeTruthy();
    obs.disconnect();
  });

  it('sets value and max on native progress element', async () => {
    const obs = registerAndInit('progress-pk', SRC, HTML);
    document.body.innerHTML = '<progress-pk value="30" max="200"></progress-pk>';
    PseudoKit.init(document.body);
    await flush();
    const track = document.querySelector('progress.progress__track');
    expect(track.getAttribute('value')).toBe('30');
    expect(track.getAttribute('max')).toBe('200');
    obs.disconnect();
  });

  it('marks indeterminate when value is absent', async () => {
    const obs = registerAndInit('progress-pk', SRC, HTML);
    document.body.innerHTML = '<progress-pk></progress-pk>';
    PseudoKit.init(document.body);
    await flush();
    const host  = document.querySelector('progress-pk');
    const track = document.querySelector('progress.progress__track');
    expect(host.hasAttribute('indeterminate')).toBe(true);
    expect(track.hasAttribute('value')).toBe(false);
    obs.disconnect();
  });

  it('sets aria-label from label prop (defaults to "Progress")', async () => {
    const obs = registerAndInit('progress-pk', SRC, HTML);
    document.body.innerHTML = '<progress-pk value="10" label="Upload progress"></progress-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('progress.progress__track').getAttribute('aria-label')).toBe('Upload progress');
    obs.disconnect();
  });

  it('sets data-ready="true" on init', async () => {
    const obs = registerAndInit('progress-pk', SRC, HTML);
    document.body.innerHTML = '<progress-pk value="75"></progress-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('progress-pk').getAttribute('data-ready')).toBe('true');
    obs.disconnect();
  });
});

// =============================================================================
// select-pk
// =============================================================================

describe('select-pk', () => {
  const HTML = readAtom('select-pk.html');
  const SRC  = 'components/select-pk.html';

  it('resolves', async () => {
    const obs = registerAndInit('select-pk', SRC, HTML);
    document.body.innerHTML = '<select-pk name="country"></select-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('select-pk').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('stamps .select wrapper with select.select__field', async () => {
    const obs = registerAndInit('select-pk', SRC, HTML);
    document.body.innerHTML = '<select-pk name="country"></select-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('.select')).toBeTruthy();
    expect(document.querySelector('select.select__field')).toBeTruthy();
    obs.disconnect();
  });

  it('contains .select__arrow decorative element', async () => {
    const obs = registerAndInit('select-pk', SRC, HTML);
    document.body.innerHTML = '<select-pk name="country"></select-pk>';
    PseudoKit.init(document.body);
    await flush();
    const arrow = document.querySelector('.select__arrow');
    expect(arrow).toBeTruthy();
    expect(arrow.getAttribute('aria-hidden')).toBe('true');
    obs.disconnect();
  });

  it('forwards name attribute to inner select', async () => {
    const obs = registerAndInit('select-pk', SRC, HTML);
    document.body.innerHTML = '<select-pk name="lang"></select-pk>';
    PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('select.select__field').getAttribute('name')).toBe('lang');
    obs.disconnect();
  });
});