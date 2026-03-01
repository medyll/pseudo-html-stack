/**
 * @fileoverview pseudo-kit-server.test.js
 * Tests for server/pseudo-kit-server.js
 *
 * Run: node --test tests/pseudo-kit-server.test.js
 */

import { describe, it, before, after, beforeEach } from 'node:test';
import assert                         from 'node:assert/strict';
import { writeFile, mkdir, rm }       from 'node:fs/promises';
import { join, isAbsolute }           from 'node:path';
import { tmpdir }                     from 'node:os';
import { pathToFileURL }              from 'node:url';

import PseudoKitServer                from '../src/server/pseudo-kit-server.js';
import { reset_shared }               from '../src/shared/registry-shared.js';

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

const TMP = join(tmpdir(), 'pseudo-kit-server-test');

const FIXTURES = {

  'chat-bubble.html': `
<template>
  <div class="bubble-body">
    <slot data-entity="" data-confidence="" />
  </div>
</template>
<style>
@layer components {
  @scope (chat-bubble) { :scope { border-radius: 8px; } }
}
</style>
<script>
  el.addEventListener('click', () => emit(el, 'select'));
</script>
`,

  'panel.html': `
<template>
  <div class="panel">
    <slot name="header" />
    <slot />
  </div>
</template>
<style>
@layer components {
  @scope (panel) { :scope { display: flex; } }
}
</style>
`,

  'no-template.html': `
<style>@layer components { @scope (bare) { :scope { color: red; } } }</style>
`,

  'empty.html': ``,

  'unreadable.html': null, // created with no read permission
};

async function setupFixtures() {
  await mkdir(TMP, { recursive: true });
  for (const [name, content] of Object.entries(FIXTURES)) {
    if (content !== null) {
      await writeFile(join(TMP, name), content, 'utf-8');
    }
  }
}

async function teardownFixtures() {
  await rm(TMP, { recursive: true, force: true });
}



// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function reg(name, file) {
  PseudoKitServer.register({ name, src: join(TMP, file ?? `${name}.html`) });
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('pseudo-kit-server', () => {

  before(async () => setupFixtures());
  after(async () => teardownFixtures());
  beforeEach(() => reset_shared());

  // ── register ───────────────────────────────────────────────────────────────

  describe('register', () => {

    it('returns PseudoKitServer for chaining', () => {
      assert.equal(
        PseudoKitServer.register({ name: 'chat-bubble', src: join(TMP, 'chat-bubble.html') }),
        PseudoKitServer
      );
    });

    it('supports auto-registration via import.meta-like object', () => {
      assert.doesNotThrow(() =>
        PseudoKitServer.register({ url: `file://${TMP}/panel.html` })
      );
    });

  });

  // ── resolvePath ─────────────────────────────────────────────────────────────

  describe('resolvePath', () => {

    it('resolves file:// URL to filesystem path', () => {
      const filePath = join(TMP, 'chat-bubble.html');
      const fileUrl = pathToFileURL(filePath).href;
      assert.equal(PseudoKitServer.resolvePath(fileUrl), filePath);
    });

    it('resolves relative path with explicit base', () => {
      assert.equal(
        PseudoKitServer.resolvePath('chat-bubble.html', TMP),
        join(TMP, 'chat-bubble.html')
      );
    });

    it('returns an absolute path when given an absolute path', () => {
      const abs = join(TMP, 'panel.html');
      assert.equal(PseudoKitServer.resolvePath(abs), abs);
    });

    it('falls back to process.cwd() when no base provided', () => {
      const result = PseudoKitServer.resolvePath('components/panel.html');
      assert.ok(isAbsolute(result));
      assert.ok(result.endsWith(join('components', 'panel.html')));
    });

  });

  // ── renderComponent ─────────────────────────────────────────────────────────

  describe('renderComponent', () => {

    it('throws if component is not registered', async () => {
      await assert.rejects(
        () => PseudoKitServer.renderComponent('chat-bubble', {}, ''),
        /not registered/i
      );
    });

    it('throws if component file cannot be read', async () => {
      PseudoKitServer.register({ name: 'ghost', src: join(TMP, 'nonexistent.html') });
      await assert.rejects(
        () => PseudoKitServer.renderComponent('ghost', {}, '', TMP),
        /Cannot read/i
      );
    });

    it('renders opening and closing tags', async () => {
      reg('chat-bubble');
      const html = await PseudoKitServer.renderComponent('chat-bubble', {}, '', TMP);
      assert.ok(html.startsWith('<chat-bubble'));
      assert.ok(html.endsWith('</chat-bubble>'));
    });

    it('renders with no props when props is empty', async () => {
      reg('chat-bubble');
      const html = await PseudoKitServer.renderComponent('chat-bubble', {}, '', TMP);
      assert.ok(!html.match(/<chat-bubble\s+>/)); // no stray space before >
    });

    it('applies string props as attributes', async () => {
      reg('chat-bubble');
      const html = await PseudoKitServer.renderComponent(
        'chat-bubble', { role: 'coherence-alert' }, '', TMP
      );
      assert.ok(html.includes('role="coherence-alert"'));
    });

    it('renders boolean true prop as bare attribute', async () => {
      reg('chat-bubble');
      const html = await PseudoKitServer.renderComponent(
        'chat-bubble', { resizable: true }, '', TMP
      );
      assert.ok(html.includes('resizable'));
    });

    it('escapes double quotes in prop values', async () => {
      reg('chat-bubble');
      const html = await PseudoKitServer.renderComponent(
        'chat-bubble', { label: 'say "hi"' }, '', TMP
      );
      assert.ok(html.includes('&quot;'));
    });

    it('injects children into the default slot', async () => {
      reg('chat-bubble');
      const html = await PseudoKitServer.renderComponent(
        'chat-bubble', {}, '<span>Hello</span>', TMP
      );
      // children are wrapped in <pk-slot> — verify they appear somewhere in the output
      assert.ok(html.includes('Hello'));
    });

    it('wraps slot content in <pk-slot> with display:contents', async () => {
      reg('chat-bubble');
      const html = await PseudoKitServer.renderComponent(
        'chat-bubble', {}, '<span>Hi</span>', TMP
      );
      assert.ok(html.includes('<pk-slot'));
      assert.ok(html.includes('style="display:contents"'));
    });

    it('sets data-slot-component on pk-slot wrapper', async () => {
      reg('chat-bubble');
      const html = await PseudoKitServer.renderComponent(
        'chat-bubble', {}, '<span>Hi</span>', TMP
      );
      assert.ok(html.includes('data-slot-component="chat-bubble"'));
    });

    it('sets data-slot-name="default" on unnamed slot wrapper', async () => {
      reg('chat-bubble');
      const html = await PseudoKitServer.renderComponent(
        'chat-bubble', {}, '<span>Hi</span>', TMP
      );
      assert.ok(html.includes('data-slot-name="default"'));
    });

    it('includes data-slot-props when slot declares data-*', async () => {
      reg('chat-bubble');
      const html = await PseudoKitServer.renderComponent(
        'chat-bubble', {}, '<span>Hi</span>', TMP
      );
      assert.ok(html.includes('data-slot-props'));
      const match = html.match(/data-slot-props='([^']+)'/);
      assert.ok(match, 'data-slot-props attribute present');
      const props = JSON.parse(match[1]);
      assert.ok('data-entity' in props);
      assert.ok('data-confidence' in props);
    });

    it('forwards slot data-* to injected child elements', async () => {
      reg('chat-bubble');
      const html = await PseudoKitServer.renderComponent(
        'chat-bubble', {}, '<span>Hi</span>', TMP
      );
      assert.ok(html.includes('data-entity'));
      assert.ok(html.includes('data-confidence'));
    });

    it('does not overwrite existing data-* on injected children', async () => {
      reg('chat-bubble');
      const html = await PseudoKitServer.renderComponent(
        'chat-bubble',
        {},
        '<span data-entity="Aria">Hi</span>',
        TMP
      );
      const matches = html.match(/data-entity="([^"]+)"/g);
      // Only one data-entity="Aria" — not replaced by empty slot default
      assert.ok(matches.every(m => m === 'data-entity="Aria"'));
    });

    it('handles component with no template (uses children directly)', async () => {
      reg('no-template', 'no-template.html');
      const html = await PseudoKitServer.renderComponent(
        'no-template', {}, '<b>raw</b>', TMP
      );
      assert.ok(html.includes('<b>raw</b>'));
    });

    it('handles completely empty component file', async () => {
      reg('empty');
      const html = await PseudoKitServer.renderComponent('empty', {}, '', TMP);
      assert.ok(html.includes('<empty'));
    });

  });

  // ── generateCSS ─────────────────────────────────────────────────────────────

  describe('generateCSS', () => {

    it('returns empty string when no components registered', async () => {
      const css = await PseudoKitServer.generateCSS(TMP);
      assert.equal(css.trim(), '');
    });

    it('includes CSS from registered components', async () => {
      reg('chat-bubble');
      const css = await PseudoKitServer.generateCSS(TMP);
      assert.ok(css.includes('@scope (chat-bubble)'));
    });

    it('includes a comment banner for each component', async () => {
      reg('chat-bubble');
      const css = await PseudoKitServer.generateCSS(TMP);
      assert.ok(css.includes('/* ── chat-bubble ── */'));
    });

    it('concatenates CSS from multiple components', async () => {
      reg('chat-bubble');
      reg('panel');
      const css = await PseudoKitServer.generateCSS(TMP);
      assert.ok(css.includes('@scope (chat-bubble)'));
      assert.ok(css.includes('@scope (panel)'));
    });

    it('skips components with no style block (no throw)', async () => {
      reg('empty');
      const css = await PseudoKitServer.generateCSS(TMP);
      assert.equal(css.trim(), '');
    });

    it('skips unreadable component files with a warning (no throw)', async () => {
      PseudoKitServer.register({ name: 'ghost', src: join(TMP, 'ghost.html') });
      const warnings = [];
      const orig = console.warn;
      console.warn = (...args) => warnings.push(args.join(' '));

      await assert.doesNotReject(() => PseudoKitServer.generateCSS(TMP));
      console.warn = orig;

      assert.ok(warnings.some(w => w.includes('ghost')));
    });

  });

  // ── validate ────────────────────────────────────────────────────────────────

  describe('validate', () => {

    it('returns valid:true for a layout with only registered components', async () => {
      reg('chat-bubble');
      const layoutPath = join(TMP, 'valid-layout.html');
      await writeFile(layoutPath, `
        <column>
          <chat-bubble role="coherence-alert"></chat-bubble>
        </column>
      `);
      const result = await PseudoKitServer.validate(layoutPath);
      assert.equal(result.valid, true);
      assert.equal(result.errors.length, 0);
    });

    it('returns valid:false for unknown component', async () => {
      const layoutPath = join(TMP, 'invalid-layout.html');
      await writeFile(layoutPath, `<unknown-widget />`);
      const result = await PseudoKitServer.validate(layoutPath);
      assert.equal(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('unknown-widget')));
    });

    it('ignores known layout elements (row, column, grid…)', async () => {
      const layoutPath = join(TMP, 'layout-elements.html');
      await writeFile(layoutPath, `
        <row><column><grid><cell><stack><spacer></spacer></stack></cell></grid></column></row>
      `);
      const result = await PseudoKitServer.validate(layoutPath);
      assert.equal(result.valid, true);
    });

    it('returns valid:false if layout file cannot be read', async () => {
      const result = await PseudoKitServer.validate(join(TMP, 'nonexistent-layout.html'));
      assert.equal(result.valid, false);
      assert.ok(result.errors[0].includes('Cannot read'));
    });

    it('emits a warning for loop="" elements', async () => {
      reg('chat-bubble');
      const layoutPath = join(TMP, 'loop-layout.html');
      await writeFile(layoutPath, `
        <column><chat-bubble loop=""></chat-bubble></column>
      `);
      const result = await PseudoKitServer.validate(layoutPath);
      assert.ok(result.warnings.length > 0);
      assert.ok(result.warnings.some(w => w.includes('loop')));
    });

    it('returns both errors and warnings arrays regardless of outcome', async () => {
      const layoutPath = join(TMP, 'both-layout.html');
      await writeFile(layoutPath, `<foo-bar loop=""></foo-bar>`);
      const result = await PseudoKitServer.validate(layoutPath);
      assert.ok(Array.isArray(result.errors));
      assert.ok(Array.isArray(result.warnings));
    });

  });

  // ── serializeState ──────────────────────────────────────────────────────────

  describe('serializeState', () => {

    it('returns a <script> tag string', () => {
      const tag = PseudoKitServer.serializeState();
      assert.ok(tag.includes('<script'));
      assert.ok(tag.includes('</script>'));
    });

    it('embeds state overrides in the tag', () => {
      const tag   = PseudoKitServer.serializeState({ focusMode: true });
      const match = tag.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      const state = JSON.parse(match[1]);
      assert.equal(state.focusMode, true);
    });

    it('uses default state when called with no args', () => {
      const tag   = PseudoKitServer.serializeState();
      const match = tag.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      const state = JSON.parse(match[1]);
      assert.equal(state.focusMode, false);
      assert.equal(state.tabSuggestionsActive, true);
    });

  });


});
