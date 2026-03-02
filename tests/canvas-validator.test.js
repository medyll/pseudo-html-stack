/**
 * @fileoverview canvas-validator.test.js
 * Tests for server/canvas-validator.js
 *
 * Covers:
 *  - BUG-02: _findInstances uses m.index — same tag in two frames gets distinct frameIds
 *  - BUG-03: 'button' removed from LAYOUT_ELEMENTS — reported as undeclared
 *  - BUG-05: _parseAttrs — tag name used as attribute value is not skipped
 *  - General: valid canvas passes, missing registry, undeclared tag
 *
 * Run: node --test tests/canvas-validator.test.js
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { validateCanvas } from '../src/server/canvas-validator.js';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const TMP = join(tmpdir(), 'pseudo-kit-validator-test');

async function writeCanvas(name, content) {
  const file = join(TMP, name);
  await writeFile(file, content, 'utf-8');
  return file;
}

function makeCanvas({ registry = '', frames = '' } = {}) {
  return `
<component-registry>
${registry}
</component-registry>
${frames}
`.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// SETUP / TEARDOWN
// ─────────────────────────────────────────────────────────────────────────────

before(async () => { await mkdir(TMP, { recursive: true }); });
after(async ()  => { await rm(TMP, { recursive: true, force: true }); });

// ─────────────────────────────────────────────────────────────────────────────
// SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('canvas-validator', () => {

  // ── General ────────────────────────────────────────────────────────────────

  describe('valid canvas', () => {
    it('returns valid:true when all declared components are used correctly', async () => {
      const file = await writeCanvas('valid.html', makeCanvas({
        registry: `<chat-bubble props="text:string" component-role="chat message" layer="components" />`,
        frames: `
<frame id="main">
  <chat-bubble role="user message" />
</frame>`,
      }));
      const result = await validateCanvas(file);
      assert.equal(result.valid, true, JSON.stringify(result.errors));
      assert.deepEqual(result.errors, []);
    });

    it('returns valid:false when no <component-registry> block', async () => {
      const file = await writeCanvas('no-registry.html', '<frame id="main"></frame>');
      const result = await validateCanvas(file);
      assert.equal(result.valid, false);
      assert.ok(result.errors.some(e => /component-registry/i.test(e)));
    });

    it('returns valid:false when canvas file cannot be read', async () => {
      const result = await validateCanvas('/nonexistent/canvas.html');
      assert.equal(result.valid, false);
    });
  });

  // ── Undeclared tags ─────────────────────────────────────────────────────────

  describe('undeclared tags', () => {
    it('errors when a tag used in a frame is not in the registry', async () => {
      const file = await writeCanvas('undeclared.html', makeCanvas({
        registry: `<chat-bubble props="text:string" component-role="x" layer="components" />`,
        frames: `
<frame id="main">
  <chat-bubble role="msg" />
  <unknown-widget role="sidebar" />
</frame>`,
      }));
      const result = await validateCanvas(file);
      assert.equal(result.valid, false);
      assert.ok(result.errors.some(e => /unknown-widget/.test(e)));
    });
  });

  // ── BUG-03 regression: button not silently ignored ─────────────────────────

  describe('BUG-03 — button is not a layout element', () => {
    it('reports <button> used without declaration as an error', async () => {
      const file = await writeCanvas('bug03-button.html', makeCanvas({
        registry: `<chat-bubble props="text:string" component-role="x" layer="components" />`,
        frames: `
<frame id="main">
  <chat-bubble role="msg" />
  <button />
</frame>`,
      }));
      const result = await validateCanvas(file);
      // button is no longer in LAYOUT_ELEMENTS — it must be declared
      assert.equal(result.valid, false);
      assert.ok(result.errors.some(e => /button/.test(e)), `Expected button error, got: ${result.errors}`);
    });

    it('accepts <button> when explicitly declared in registry', async () => {
      const file = await writeCanvas('bug03-button-declared.html', makeCanvas({
        registry: `<button element="*" />`,
        frames: `
<frame id="main">
  <button />
</frame>`,
      }));
      const result = await validateCanvas(file);
      assert.equal(result.valid, true, JSON.stringify(result.errors));
    });
  });

  // ── BUG-02 regression: multi-frame frameId correctness ────────────────────

  describe('BUG-02 — _findInstances assigns correct frameId per occurrence', () => {
    it('two identical tags in different frames get distinct frameIds in manifest', async () => {
      const file = await writeCanvas('bug02-multiframe.html', makeCanvas({
        registry: `<icon-btn props="action:string" component-role="action trigger" layer="components" />`,
        frames: `
<frame id="frame-a">
  <icon-btn role="save" />
</frame>
<frame id="frame-b">
  <icon-btn role="cancel" />
</frame>`,
      }));
      const result = await validateCanvas(file);
      // Both instances should be present in the manifest with correct frames
      const entry = result.manifest.find(e => e.name === 'icon-btn');
      assert.ok(entry, 'icon-btn missing from manifest');
      const frameIds = entry.instances.map(i => i.frameId);
      assert.ok(frameIds.includes('frame-a'), `Expected frame-a in ${frameIds}`);
      assert.ok(frameIds.includes('frame-b'), `Expected frame-b in ${frameIds}`);
      // No duplicate: each instance in a distinct frame
      assert.equal(new Set(frameIds).size, 2, `Expected 2 distinct frames, got: ${frameIds}`);
    });
  });

  // ── BUG-05 regression: tag name used as attribute ─────────────────────────

  describe('BUG-05 — _parseAttrs does not skip attribute matching the tag name', () => {
    it('reports missing role when a component has a same-name attribute', async () => {
      // <row-header row="x" /> — 'row' attr must not cause skip of role check
      const file = await writeCanvas('bug05-sameattr.html', makeCanvas({
        registry: `<row-header props="row:string" component-role="table row" layer="components" />`,
        frames: `
<frame id="main">
  <row-header row="1" />
</frame>`,
      }));
      const result = await validateCanvas(file);
      // Missing role="" should generate a warning, not be silently swallowed
      assert.ok(
        result.warnings.some(w => /row-header/.test(w) && /role/.test(w)),
        `Expected missing-role warning for row-header, got: ${result.warnings}`,
      );
    });
  });

  // ── button-theme is a layout element (NOM-02) ──────────────────────────────

  describe('NOM-02 — button-theme is a layout element', () => {
    it('does not error when <button-theme> used without declaration', async () => {
      const file = await writeCanvas('nom02-button-theme.html', makeCanvas({
        registry: `<my-btn props="label:string" component-role="action" layer="components" />`,
        frames: `
<frame id="main">
  <button-theme variant="primary">
    <my-btn role="cta" />
  </button-theme>
</frame>`,
      }));
      const result = await validateCanvas(file);
      assert.ok(!result.errors.some(e => /button-theme/.test(e)),
        `button-theme should not appear in errors: ${result.errors}`);
    });
  });

});
