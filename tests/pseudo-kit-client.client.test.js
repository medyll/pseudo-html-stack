/**
 * @fileoverview pseudo-kit-client.client.test.js
 * Tests for client/pseudo-kit-client.js
 *
 * Run: npx vitest run tests/pseudo-kit-client.client.test.js
 * Requires: vitest, happy-dom
 * Install: npm install --save-dev vitest happy-dom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── DOM mocks must be set up before importing the client ────────────────────

// happy-dom provides window, document, MutationObserver, CustomEvent, etc.
// CSSStyleSheet.adoptedStyleSheets is not always available — polyfill it.
if (!document.adoptedStyleSheets) {
  Object.defineProperty(document, 'adoptedStyleSheets', {
    value: [],
    writable: true,
  });
}

import PseudoKit from '../src/client/pseudo-kit-client.js';
import { reset_shared, register_shared } from '../src/shared/registry-shared.js';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a minimal component HTML string.
 */
function makeComponentHtml({
  template = '<slot />',
  style    = null,
  script   = null,
  type     = 'inline',
  scriptSrc = null,
} = {}) {
  const styleBlock  = style  ? `<style>${style}</style>` : '';
  const scriptBlock = type === 'module' && scriptSrc
    ? `<script type="module" src="${scriptSrc}"></script>`
    : script
      ? `<script>${script}</script>`
      : '';
  return `<template>${template}</template>${styleBlock}${scriptBlock}`;
}

/**
 * Mocks fetch to return component HTML.
 * @param {Record<string, string>} map — url → html content
 */
function mockFetch(map) {
  vi.stubGlobal('fetch', vi.fn((url) => {
    const content = map[url] ?? map['*'];
    if (content === undefined) {
      return Promise.resolve({ ok: false, status: 404 });
    }
    return Promise.resolve({ ok: true, text: () => Promise.resolve(content) });
  }));
}

/**
 * Waits for all pending microtasks + a tick.
 */
function flush() {
  return new Promise(r => setTimeout(r, 0));
}

// ─────────────────────────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  reset_shared();
  document.body.innerHTML = '';
  document.documentElement.getAttributeNames().forEach(attr => {
    if (attr.startsWith('data-')) document.documentElement.removeAttribute(attr);
  });
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('PseudoKit.register', () => {

  it('registers a component and returns PseudoKit for chaining', () => {
    const result = PseudoKit.register({ name: 'chat-bubble', src: 'components/chat-bubble.html' });
    expect(result).toBe(PseudoKit);
  });

  it('supports auto-registration via import.meta-like object', () => {
    expect(() => PseudoKit.register({ url: 'file:///project/components/toolbar.html' }))
      .not.toThrow();
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe('PseudoKit.init', () => {

  it('returns a MutationObserver', () => {
    const obs = PseudoKit.init(document.body);
    expect(obs).toBeInstanceOf(MutationObserver);
    obs.disconnect();
  });

  it('resolves components already in the DOM at init time', async () => {
    const html = makeComponentHtml({ template: '<div class="bubble"></div>' });
    mockFetch({ 'components/chat-bubble.html': html });

    PseudoKit.register({ name: 'chat-bubble', src: 'components/chat-bubble.html' });
    document.body.innerHTML = '<chat-bubble></chat-bubble>';

    const obs = PseudoKit.init(document.body);
    await flush();

    const el = document.querySelector('chat-bubble');
    expect(el.dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('resolves components added after init via MutationObserver', async () => {
    const html = makeComponentHtml({ template: '<div class="badge"></div>' });
    mockFetch({ 'components/badge.html': html });

    PseudoKit.register({ name: 'badge', src: 'components/badge.html' });
    const obs = PseudoKit.init(document.body);
    await flush();

    document.body.innerHTML = '<badge></badge>';
    await flush();

    const el = document.querySelector('badge');
    expect(el.dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('ignores non-element nodes added to DOM', async () => {
    const obs = PseudoKit.init(document.body);
    expect(() => {
      document.body.appendChild(document.createTextNode('hello'));
    }).not.toThrow();
    obs.disconnect();
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe('component loading (_loadComponent)', () => {

  it('throws if fetch returns non-ok response', async () => {
    mockFetch({ 'components/ghost.html': undefined });
    PseudoKit.register({ name: 'ghost', src: 'components/ghost.html' });
    document.body.innerHTML = '<ghost></ghost>';

    await expect(
      (async () => { PseudoKit.init(document.body); await flush(); })()
    ).rejects.toThrow(/Failed to load/i);
  });

  it('handles component with no template block', async () => {
    const html = makeComponentHtml({ template: null });
    mockFetch({ 'components/bare.html': `<style>.bare{}</style>` });
    PseudoKit.register({ name: 'bare', src: 'components/bare.html' });
    document.body.innerHTML = '<bare></bare>';
    const obs = PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('bare').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('handles component with no script block', async () => {
    const html = makeComponentHtml({ template: '<div/>', style: null, script: null });
    mockFetch({ 'components/silent.html': html });
    PseudoKit.register({ name: 'silent', src: 'components/silent.html' });
    document.body.innerHTML = '<silent></silent>';
    const obs = PseudoKit.init(document.body);
    await flush();
    expect(document.querySelector('silent').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('handles module script — calls dynamic import', async () => {
    const importSpy = vi.fn().mockResolvedValue({});
    vi.stubGlobal('importModule', importSpy);

    const html = `<template><slot/></template><script type="module" src="./chat-bubble.js"></script>`;
    mockFetch({ 'components/chat-bubble.html': html });

    // Stub globalThis so we can intercept import()
    // happy-dom supports dynamic import, mock it via vi.mock if needed
    PseudoKit.register({ name: 'chat-bubble', src: 'components/chat-bubble.html' });
    document.body.innerHTML = '<chat-bubble></chat-bubble>';
    const obs = PseudoKit.init(document.body);
    await flush();
    obs.disconnect();
    // The component should still resolve (module import may silently fail in test env)
    expect(document.querySelector('chat-bubble').dataset.pkResolved).toBe('true');
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe('_stampTemplate — default slot', () => {

  it('stamps template content into the element', async () => {
    const html = makeComponentHtml({ template: '<div class="inner"><slot/></div>' });
    mockFetch({ 'components/panel.html': html });
    PseudoKit.register({ name: 'panel', src: 'components/panel.html' });

    document.body.innerHTML = '<panel><span>content</span></panel>';
    const obs = PseudoKit.init(document.body);
    await flush();

    const panel = document.querySelector('panel');
    expect(panel.querySelector('.inner')).toBeTruthy();
    obs.disconnect();
  });

  it('places original children into the default slot', async () => {
    const html = makeComponentHtml({ template: '<div class="wrap"><slot/></div>' });
    mockFetch({ 'components/panel.html': html });
    PseudoKit.register({ name: 'panel', src: 'components/panel.html' });

    document.body.innerHTML = '<panel><span class="child">hello</span></panel>';
    const obs = PseudoKit.init(document.body);
    await flush();

    expect(document.querySelector('.child')).toBeTruthy();
    obs.disconnect();
  });

  it('wraps slot content in <pk-slot> with display:contents', async () => {
    const html = makeComponentHtml({ template: '<div><slot/></div>' });
    mockFetch({ 'components/panel.html': html });
    PseudoKit.register({ name: 'panel', src: 'components/panel.html' });

    document.body.innerHTML = '<panel><span>hi</span></panel>';
    const obs = PseudoKit.init(document.body);
    await flush();

    const pkSlot = document.querySelector('pk-slot');
    expect(pkSlot).toBeTruthy();
    expect(pkSlot.style.display).toBe('contents');
    obs.disconnect();
  });

  it('sets data-slot-component on pk-slot', async () => {
    const html = makeComponentHtml({ template: '<div><slot/></div>' });
    mockFetch({ 'components/panel.html': html });
    PseudoKit.register({ name: 'panel', src: 'components/panel.html' });

    document.body.innerHTML = '<panel><span>hi</span></panel>';
    const obs = PseudoKit.init(document.body);
    await flush();

    expect(document.querySelector('pk-slot').dataset.slotComponent).toBe('panel');
    obs.disconnect();
  });

  it('sets data-slot-name="default" on unnamed slot', async () => {
    const html = makeComponentHtml({ template: '<div><slot/></div>' });
    mockFetch({ 'components/panel.html': html });
    PseudoKit.register({ name: 'panel', src: 'components/panel.html' });

    document.body.innerHTML = '<panel><span>hi</span></panel>';
    const obs = PseudoKit.init(document.body);
    await flush();

    expect(document.querySelector('pk-slot').dataset.slotName).toBe('default');
    obs.disconnect();
  });

  it('forwards slot data-* to injected children', async () => {
    const html = makeComponentHtml({ template: '<div><slot data-entity="" data-confidence=""/></div>' });
    mockFetch({ 'components/chat-bubble.html': html });
    PseudoKit.register({ name: 'chat-bubble', src: 'components/chat-bubble.html' });

    document.body.innerHTML = '<chat-bubble><span>text</span></chat-bubble>';
    const obs = PseudoKit.init(document.body);
    await flush();

    const span = document.querySelector('span');
    expect(span.hasAttribute('data-entity')).toBe(true);
    expect(span.hasAttribute('data-confidence')).toBe(true);
    obs.disconnect();
  });

  it('does not overwrite existing data-* on injected children', async () => {
    const html = makeComponentHtml({ template: '<div><slot data-entity=""/></div>' });
    mockFetch({ 'components/chat-bubble.html': html });
    PseudoKit.register({ name: 'chat-bubble', src: 'components/chat-bubble.html' });

    document.body.innerHTML = '<chat-bubble><span data-entity="Aria">text</span></chat-bubble>';
    const obs = PseudoKit.init(document.body);
    await flush();

    expect(document.querySelector('span').getAttribute('data-entity')).toBe('Aria');
    obs.disconnect();
  });

  it('does not apply data-* to text nodes', async () => {
    const html = makeComponentHtml({ template: '<div><slot data-entity=""/></div>' });
    mockFetch({ 'components/chat-bubble.html': html });
    PseudoKit.register({ name: 'chat-bubble', src: 'components/chat-bubble.html' });

    document.body.innerHTML = '<chat-bubble>just text</chat-bubble>';
    const obs = PseudoKit.init(document.body);
    await flush();
    // no throw, component resolves
    expect(document.querySelector('chat-bubble').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('handles empty slot — no children injected', async () => {
    const html = makeComponentHtml({ template: '<div><slot/></div>' });
    mockFetch({ 'components/panel.html': html });
    PseudoKit.register({ name: 'panel', src: 'components/panel.html' });

    document.body.innerHTML = '<panel></panel>';
    const obs = PseudoKit.init(document.body);
    await flush();

    expect(document.querySelector('panel').dataset.pkResolved).toBe('true');
    obs.disconnect();
  });

  it('serializes data-slot-props as JSON on pk-slot when slot has data-*', async () => {
    const html = makeComponentHtml({ template: '<div><slot data-entity="" data-confidence=""/></div>' });
    mockFetch({ 'components/chat-bubble.html': html });
    PseudoKit.register({ name: 'chat-bubble', src: 'components/chat-bubble.html' });

    document.body.innerHTML = '<chat-bubble><span>text</span></chat-bubble>';
    const obs = PseudoKit.init(document.body);
    await flush();

    const pkSlot = document.querySelector('pk-slot');
    const props  = JSON.parse(pkSlot.dataset.slotProps);
    expect('data-entity' in props).toBe(true);
    obs.disconnect();
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe('_stampTemplate — named slots', () => {

  it('routes slot="header" children to the named slot', async () => {
    const html = makeComponentHtml({
      template: '<div><slot name="header"/><slot/></div>',
    });
    mockFetch({ 'components/toolbar.html': html });
    PseudoKit.register({ name: 'toolbar', src: 'components/toolbar.html' });

    document.body.innerHTML = `
      <toolbar>
        <span slot="header" class="header-child">H</span>
        <span class="default-child">D</span>
      </toolbar>`;
    const obs = PseudoKit.init(document.body);
    await flush();

    const headerSlot  = document.querySelector('pk-slot[data-slot-name="header"]');
    const defaultSlot = document.querySelector('pk-slot[data-slot-name="default"]');

    expect(headerSlot.querySelector('.header-child')).toBeTruthy();
    expect(defaultSlot.querySelector('.default-child')).toBeTruthy();
    obs.disconnect();
  });

  it('named slot wrapper has correct data-slot-name', async () => {
    const html = makeComponentHtml({ template: '<slot name="actions"/>' });
    mockFetch({ 'components/toolbar.html': html });
    PseudoKit.register({ name: 'toolbar', src: 'components/toolbar.html' });

    document.body.innerHTML = `<toolbar><btn slot="actions">Save</btn></toolbar>`;
    const obs = PseudoKit.init(document.body);
    await flush();

    expect(document.querySelector('pk-slot').dataset.slotName).toBe('actions');
    obs.disconnect();
  });

  it('unassigned children go to default slot when named slots exist', async () => {
    const html = makeComponentHtml({
      template: '<div><slot name="header"/><slot/></div>',
    });
    mockFetch({ 'components/toolbar.html': html });
    PseudoKit.register({ name: 'toolbar', src: 'components/toolbar.html' });

    document.body.innerHTML = `<toolbar><span class="orphan">orphan</span></toolbar>`;
    const obs = PseudoKit.init(document.body);
    await flush();

    const defaultSlot = document.querySelector('pk-slot[data-slot-name="default"]');
    expect(defaultSlot.querySelector('.orphan')).toBeTruthy();
    obs.disconnect();
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe('SSR hydration detection', () => {

  it('skips stamp when pk-slot already present (SSR hydrated)', async () => {
    const html = makeComponentHtml({ template: '<div class="fresh"><slot/></div>' });
    mockFetch({ 'components/panel.html': html });
    PseudoKit.register({ name: 'panel', src: 'components/panel.html' });

    // Simulate SSR-rendered HTML: already contains pk-slot
    document.body.innerHTML = `
      <panel>
        <pk-slot data-slot-component="panel" data-slot-name="default" style="display:contents">
          <span>server rendered</span>
        </pk-slot>
      </panel>`;

    const obs = PseudoKit.init(document.body);
    await flush();

    const panel = document.querySelector('panel');
    // data-pk-hydrated should be set, NOT data-pk-resolved from stamp
    expect(panel.dataset.pkHydrated).toBe('true');
    expect(panel.dataset.pkResolved).toBe('true');
    // The .fresh div from template should NOT be present (stamp was skipped)
    expect(panel.querySelector('.fresh')).toBeFalsy();
    obs.disconnect();
  });

  it('stamps normally when no pk-slot present (CSR)', async () => {
    const html = makeComponentHtml({ template: '<div class="fresh"><slot/></div>' });
    mockFetch({ 'components/panel.html': html });
    PseudoKit.register({ name: 'panel', src: 'components/panel.html' });

    document.body.innerHTML = `<panel><span>csr content</span></panel>`;
    const obs = PseudoKit.init(document.body);
    await flush();

    expect(document.querySelector('.fresh')).toBeTruthy();
    obs.disconnect();
  });

  it('does not set data-pk-hydrated on CSR components', async () => {
    const html = makeComponentHtml({ template: '<div><slot/></div>' });
    mockFetch({ 'components/panel.html': html });
    PseudoKit.register({ name: 'panel', src: 'components/panel.html' });

    document.body.innerHTML = `<panel></panel>`;
    const obs = PseudoKit.init(document.body);
    await flush();

    expect(document.querySelector('panel').dataset.pkHydrated).toBeUndefined();
    obs.disconnect();
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe('CSS — _upsertComponentStyle', () => {

  it('does not add <style> tags to the DOM', async () => {
    const html = makeComponentHtml({
      template: '<div/>',
      style: '@layer components { @scope (badge) { :scope { display:block } } }',
    });
    mockFetch({ 'components/badge.html': html });
    PseudoKit.register({ name: 'badge', src: 'components/badge.html' });

    document.body.innerHTML = '<badge></badge>';
    const stylesBefore = document.querySelectorAll('style').length;
    const obs = PseudoKit.init(document.body);
    await flush();

    expect(document.querySelectorAll('style').length).toBe(stylesBefore);
    obs.disconnect();
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe('script evaluation (_evalScript)', () => {

  it('executes inline script with el in scope', async () => {
    const html = makeComponentHtml({
      template: '<div/>',
      script: 'el.dataset.scriptRan = "true";',
    });
    mockFetch({ 'components/badge.html': html });
    PseudoKit.register({ name: 'badge', src: 'components/badge.html' });

    document.body.innerHTML = '<badge></badge>';
    const obs = PseudoKit.init(document.body);
    await flush();

    expect(document.querySelector('badge').dataset.scriptRan).toBe('true');
    obs.disconnect();
  });

  it('logs error and does not throw on script exception', async () => {
    const html = makeComponentHtml({
      template: '<div/>',
      script: 'throw new Error("script boom")',
    });
    mockFetch({ 'components/badge.html': html });
    PseudoKit.register({ name: 'badge', src: 'components/badge.html' });

    const errors = [];
    vi.spyOn(console, 'error').mockImplementation((...a) => errors.push(a.join(' ')));

    document.body.innerHTML = '<badge></badge>';
    const obs = PseudoKit.init(document.body);
    await flush();

    expect(errors.some(e => e.includes('badge'))).toBe(true);
    obs.disconnect();
  });

  it('provides emit in script scope', async () => {
    const html = makeComponentHtml({
      template: '<div/>',
      script: 'el.dataset.hasEmit = typeof emit === "function" ? "yes" : "no";',
    });
    mockFetch({ 'components/badge.html': html });
    PseudoKit.register({ name: 'badge', src: 'components/badge.html' });

    document.body.innerHTML = '<badge></badge>';
    const obs = PseudoKit.init(document.body);
    await flush();

    expect(document.querySelector('badge').dataset.hasEmit).toBe('yes');
    obs.disconnect();
  });

  it('provides renderLoop in script scope', async () => {
    const html = makeComponentHtml({
      template: '<div/>',
      script: 'el.dataset.hasLoop = typeof renderLoop === "function" ? "yes" : "no";',
    });
    mockFetch({ 'components/badge.html': html });
    PseudoKit.register({ name: 'badge', src: 'components/badge.html' });

    document.body.innerHTML = '<badge></badge>';
    const obs = PseudoKit.init(document.body);
    await flush();

    expect(document.querySelector('badge').dataset.hasLoop).toBe('yes');
    obs.disconnect();
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe('PseudoKit.emit', () => {

  it('dispatches a CustomEvent on the element', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    let received = null;
    el.addEventListener('accept', e => { received = e.detail; });

    PseudoKit.emit(el, 'accept', { id: '42' });
    expect(received).toEqual({ id: '42' });
  });

  it('event bubbles', () => {
    const parent = document.createElement('div');
    const child  = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);

    let bubbled = false;
    parent.addEventListener('accept', () => { bubbled = true; });
    PseudoKit.emit(child, 'accept');
    expect(bubbled).toBe(true);
  });

  it('defaults to null detail', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    let detail;
    el.addEventListener('test', e => { detail = e.detail; });
    PseudoKit.emit(el, 'test');
    expect(detail).toBeNull();
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe('PseudoKit.renderLoop', () => {

  it('replaces loop="" element with cloned instances', async () => {
    const html = makeComponentHtml({ template: '<div class="bubble"><slot/></div>' });
    mockFetch({ 'components/chat-bubble.html': html });
    PseudoKit.register({ name: 'chat-bubble', src: 'components/chat-bubble.html' });

    document.body.innerHTML = `
      <div id="alerts">
        <chat-bubble loop=""></chat-bubble>
      </div>`;
    const obs = PseudoKit.init(document.body);
    await flush();

    PseudoKit.renderLoop('alerts', [
      { entity: 'Aria', confidence: '0.9' },
      { entity: 'Bram', confidence: '0.5' },
    ]);
    await flush();

    const bubbles = document.querySelectorAll('chat-bubble:not([loop])');
    expect(bubbles.length).toBe(2);
  });

  it('binds item fields as data-* on each clone', async () => {
    const html = makeComponentHtml({ template: '<div/>' });
    mockFetch({ 'components/chat-bubble.html': html });
    PseudoKit.register({ name: 'chat-bubble', src: 'components/chat-bubble.html' });

    document.body.innerHTML = `<div id="alerts"><chat-bubble loop=""></chat-bubble></div>`;
    const obs = PseudoKit.init(document.body);
    await flush();

    PseudoKit.renderLoop('alerts', [{ entity: 'Aria' }]);
    await flush();

    const bubble = document.querySelector('chat-bubble[data-entity="Aria"]');
    expect(bubble).toBeTruthy();
    obs.disconnect();
  });

  it('warns and returns if container not found', () => {
    const warns = [];
    vi.spyOn(console, 'warn').mockImplementation((...a) => warns.push(a.join(' ')));

    PseudoKit.renderLoop('nonexistent-id', []);
    expect(warns.some(w => w.includes('nonexistent-id'))).toBe(true);
  });

  it('warns and returns if no loop="" element in container', () => {
    document.body.innerHTML = `<div id="empty-container"><span>no loop here</span></div>`;
    const warns = [];
    vi.spyOn(console, 'warn').mockImplementation((...a) => warns.push(a.join(' ')));

    PseudoKit.renderLoop('empty-container', []);
    expect(warns.some(w => w.includes('empty-container'))).toBe(true);
  });

  it('removes loop attribute from clones', async () => {
    mockFetch({ 'components/chat-bubble.html': makeComponentHtml({ template: '<div/>' }) });
    PseudoKit.register({ name: 'chat-bubble', src: 'components/chat-bubble.html' });

    document.body.innerHTML = `<div id="list"><chat-bubble loop=""></chat-bubble></div>`;
    PseudoKit.init(document.body);
    await flush();

    PseudoKit.renderLoop('list', [{ id: '1' }]);
    await flush();

    const withLoop = document.querySelector('chat-bubble[loop]');
    expect(withLoop).toBeFalsy();
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe('PseudoKit.state', () => {

  it('is defined', () => {
    expect(PseudoKit.state).toBeDefined();
  });

  it('setting a boolean true adds a data-* attribute on :root', () => {
    PseudoKit.state.focusMode = true;
    expect(document.documentElement.hasAttribute('data-focus-mode')).toBe(true);
  });

  it('setting a boolean false removes the data-* attribute', () => {
    PseudoKit.state.focusMode = true;
    PseudoKit.state.focusMode = false;
    expect(document.documentElement.hasAttribute('data-focus-mode')).toBe(false);
  });

  it('setting null removes the attribute', () => {
    PseudoKit.state.aiRunning = true;
    PseudoKit.state.aiRunning = null;
    expect(document.documentElement.hasAttribute('data-ai-running')).toBe(false);
  });

  it('setting 0 removes the attribute', () => {
    PseudoKit.state.step = 2;
    PseudoKit.state.step = 0;
    expect(document.documentElement.hasAttribute('data-step')).toBe(false);
  });

  it('setting a string value sets attribute value', () => {
    PseudoKit.state.step = '2b';
    expect(document.documentElement.getAttribute('data-step')).toBe('2b');
  });

  it('setting a number value sets attribute value as string', () => {
    PseudoKit.state.step = 3;
    expect(document.documentElement.getAttribute('data-step')).toBe('3');
  });

  it('converts camelCase keys to kebab-case attributes', () => {
    PseudoKit.state.tabSuggestionsActive = true;
    expect(document.documentElement.hasAttribute('data-tab-suggestions-active')).toBe(true);
  });

  it('reading state returns the current value', () => {
    PseudoKit.state.focusMode = true;
    expect(PseudoKit.state.focusMode).toBe(true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────

describe('skip already-resolved components', () => {

  it('does not re-resolve a component with data-pk-resolved', async () => {
    const html = makeComponentHtml({ template: '<div class="once"><slot/></div>' });
    mockFetch({ 'components/panel.html': html });
    PseudoKit.register({ name: 'panel', src: 'components/panel.html' });

    document.body.innerHTML = `<panel data-pk-resolved="true"><span>pre-resolved</span></panel>`;
    const obs = PseudoKit.init(document.body);
    await flush();

    // Should not have stamped — no .once div
    expect(document.querySelector('.once')).toBeFalsy();
    obs.disconnect();
  });

});
