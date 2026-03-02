/**
 * @fileoverview canvas-normalize.test.js
 * Tests for server/canvas-normalize.js
 *
 * Covers:
 *  - _renameObsoleteAttrs: fields→data, visible-when→when-visible, hidden-when→when-hidden
 *  - _addMissingComponentRoles: injects component-role="" on declarations lacking it
 *  - _addMissingRoles: injects role="" on frame instances lacking it
 *  - _findBlock: returns correct fullStart/fullEnd positions
 *  - Already-normalized: no changes applied, no duplicates injected
 *  - inPlace option: overwrites original
 *  - Default option: writes .normalized.html alongside original
 *  - Error: throws when file cannot be read
 *
 * Run: node --test tests/canvas-normalize.test.js
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { normalizeCanvas } from '../src/server/canvas-normalize.js';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const TMP = join(tmpdir(), 'pseudo-kit-normalize-test');

async function writeCanvas(name, content) {
  const file = join(TMP, name);
  await writeFile(file, content, 'utf-8');
  return file;
}

function makeCanvas({ registry = '', frames = '', style = '' } = {}) {
  return [
    '<component-registry>',
    registry,
    '</component-registry>',
    frames,
    style ? `<style>\n${style}\n</style>` : '',
  ].filter(Boolean).join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// SETUP / TEARDOWN
// ─────────────────────────────────────────────────────────────────────────────

before(async () => { await mkdir(TMP, { recursive: true }); });
after(async ()  => { await rm(TMP, { recursive: true, force: true }); });

// ─────────────────────────────────────────────────────────────────────────────
// SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('canvas-normalize', () => {

  // ── _renameObsoleteAttrs ───────────────────────────────────────────────────

  describe('_renameObsoleteAttrs', () => {

    it('renames fields → data', async () => {
      const file = await writeCanvas('rename-fields.html', makeCanvas({
        registry: `<chat-bubble fields="text:string" component-role="msg" />`,
      }));
      const { output, changes } = await normalizeCanvas(file, { inPlace: true });
      assert.ok(output.includes('data="text:string"'), 'expected data=');
      assert.ok(!output.includes('fields='), 'fields= should be removed');
      assert.ok(changes.some(c => c.includes('fields') && c.includes('data')));
    });

    it('renames visible-when → when-visible', async () => {
      const file = await writeCanvas('rename-visible-when.html', makeCanvas({
        frames: `<frame id="f1">\n  <panel visible-when="logged-in" role="main" />\n</frame>`,
      }));
      const { output, changes } = await normalizeCanvas(file, { inPlace: true });
      assert.ok(output.includes('when-visible='));
      assert.ok(!output.includes('visible-when='));
      assert.ok(changes.some(c => c.includes('visible-when') && c.includes('when-visible')));
    });

    it('renames hidden-when → when-hidden', async () => {
      const file = await writeCanvas('rename-hidden-when.html', makeCanvas({
        frames: `<frame id="f1">\n  <panel hidden-when="logged-out" role="main" />\n</frame>`,
      }));
      const { output, changes } = await normalizeCanvas(file, { inPlace: true });
      assert.ok(output.includes('when-hidden='));
      assert.ok(!output.includes('hidden-when='));
      assert.ok(changes.some(c => c.includes('hidden-when') && c.includes('when-hidden')));
    });

    it('renames multiple obsolete attrs in one pass', async () => {
      const file = await writeCanvas('rename-multiple.html', makeCanvas({
        registry: `<card fields="title:string" component-role="card" />`,
        frames: `<frame id="f1">\n  <card visible-when="ready" hidden-when="loading" role="item" />\n</frame>`,
      }));
      const { changes } = await normalizeCanvas(file, { inPlace: true });
      assert.ok(changes.some(c => c.includes('fields')));
      assert.ok(changes.some(c => c.includes('visible-when')));
      assert.ok(changes.some(c => c.includes('hidden-when')));
    });

    it('counts multiple occurrences of same obsolete attr', async () => {
      const file = await writeCanvas('rename-count.html', makeCanvas({
        registry: `<panel fields="a:string" component-role="p" />\n<card fields="b:string" component-role="c" />`,
      }));
      const { changes } = await normalizeCanvas(file, { inPlace: true });
      const fieldsChange = changes.find(c => c.includes('fields') && c.includes('data'));
      assert.ok(fieldsChange, 'should report fields→data change');
      assert.ok(fieldsChange.includes('2×'), `expected count 2× in: ${fieldsChange}`);
    });

    it('does not rename attr names inside attribute values', async () => {
      const file = await writeCanvas('rename-no-value.html', makeCanvas({
        registry: `<panel data="fields:string" component-role="p" />`,
        frames: `<frame id="f1">\n  <panel role="fields panel" />\n</frame>`,
      }));
      const { output, changes } = await normalizeCanvas(file, { inPlace: true });
      // 'fields' appears in a value — should not be renamed
      assert.ok(output.includes('data="fields:string"'));
      assert.ok(output.includes('role="fields panel"'));
      assert.ok(!changes.some(c => c.includes('fields')));
    });

  });

  // ── _addMissingComponentRoles ──────────────────────────────────────────────

  describe('_addMissingComponentRoles', () => {

    it('adds component-role="" to a declaration missing it', async () => {
      const file = await writeCanvas('missing-crole.html', makeCanvas({
        registry: `<chat-bubble props="text:string" />`,
      }));
      const { output, changes } = await normalizeCanvas(file, { inPlace: true });
      assert.ok(output.includes('component-role=""'));
      assert.ok(changes.some(c => c.includes('component-role') && c.includes('chat-bubble')));
    });

    it('does not add component-role="" when already present', async () => {
      const file = await writeCanvas('has-crole.html', makeCanvas({
        registry: `<chat-bubble props="text:string" component-role="a message" />`,
      }));
      const { changes } = await normalizeCanvas(file, { inPlace: true });
      assert.ok(!changes.some(c => c.includes('component-role') && c.includes('chat-bubble')));
    });

    it('does not add component-role="" to layout elements (element="*")', async () => {
      const file = await writeCanvas('layout-element.html', makeCanvas({
        registry: `<message-row element="row" />`,
      }));
      const { output, changes } = await normalizeCanvas(file, { inPlace: true });
      assert.ok(!changes.some(c => c.includes('component-role')));
      // must not have injected component-role
      const registryBlock = output.match(/<component-registry>([\s\S]*?)<\/component-registry>/)?.[1] ?? '';
      assert.ok(!registryBlock.includes('component-role'));
    });

    it('does not add component-role="" to native layout elements (row, column…)', async () => {
      const file = await writeCanvas('native-layout.html', makeCanvas({
        registry: `<row />\n<column />`,
      }));
      const { changes } = await normalizeCanvas(file, { inPlace: true });
      assert.ok(!changes.some(c => c.includes('component-role')));
    });

    it('handles multiple declarations — injects only on those missing component-role', async () => {
      const file = await writeCanvas('partial-crole.html', makeCanvas({
        registry: [
          `<panel props="title:string" component-role="panel" />`,
          `<card props="img:string" />`,
        ].join('\n'),
      }));
      const { output, changes } = await normalizeCanvas(file, { inPlace: true });
      // panel already has it — only card should get it
      const croleChanges = changes.filter(c => c.includes('component-role'));
      assert.equal(croleChanges.length, 1);
      assert.ok(croleChanges[0].includes('card'));
    });

  });

  // ── _addMissingRoles ───────────────────────────────────────────────────────

  describe('_addMissingRoles', () => {

    it('adds role="" to a frame instance missing it', async () => {
      const file = await writeCanvas('missing-role.html', makeCanvas({
        registry: `<panel component-role="panel" />`,
        frames: `<frame id="f1">\n  <panel id="main-panel" />\n</frame>`,
      }));
      const { output, changes } = await normalizeCanvas(file, { inPlace: true });
      assert.ok(output.includes('role=""'));
      assert.ok(changes.some(c => c.includes('role=""') && c.includes('panel')));
    });

    it('does not add role="" when already present', async () => {
      const file = await writeCanvas('has-role.html', makeCanvas({
        registry: `<panel component-role="panel" />`,
        frames: `<frame id="f1">\n  <panel role="main content" />\n</frame>`,
      }));
      const { changes } = await normalizeCanvas(file, { inPlace: true });
      assert.ok(!changes.some(c => c.includes('role=""') && c.includes('panel')));
    });

    it('does not add role="" to layout elements in frames', async () => {
      const file = await writeCanvas('layout-in-frame.html', makeCanvas({
        registry: `<panel component-role="p" />`,
        frames: `<frame id="f1">\n  <panel role="main" />\n  <row />\n  <column />\n</frame>`,
      }));
      const { changes } = await normalizeCanvas(file, { inPlace: true });
      // only panel was missing role; row/column are layout — should not add role to them
      assert.ok(!changes.some(c => c.includes('row') || c.includes('column')));
    });

    it('does not inject role into component-registry block', async () => {
      const file = await writeCanvas('no-role-in-registry.html', makeCanvas({
        registry: `<chat-bubble props="t:string" component-role="msg" />`,
        frames: `<frame id="f1">\n  <chat-bubble role="user" />\n</frame>`,
      }));
      const { output } = await normalizeCanvas(file, { inPlace: true });
      const registryBlock = output.match(/<component-registry>([\s\S]*?)<\/component-registry>/)?.[1] ?? '';
      // component-registry entry should NOT have role="" injected
      assert.ok(!registryBlock.includes('role=""'));
    });

    it('handles multiple instances across multiple frames', async () => {
      const file = await writeCanvas('multi-frame.html', makeCanvas({
        registry: `<card component-role="c" />`,
        frames: [
          `<frame id="f1">\n  <card id="c1" />\n</frame>`,
          `<frame id="f2">\n  <card id="c2" />\n</frame>`,
        ].join('\n'),
      }));
      const { changes } = await normalizeCanvas(file, { inPlace: true });
      const roleChanges = changes.filter(c => c.includes('role=""') && c.includes('card'));
      assert.equal(roleChanges.length, 2, 'should add role to both instances');
    });

  });

  // ── _findBlock ─────────────────────────────────────────────────────────────

  describe('_findBlock (via normalizeCanvas output)', () => {

    it('correctly scopes changes inside component-registry, not outside', async () => {
      // A tag outside the registry must not get component-role injected
      const html = [
        '<component-registry>',
        '  <chat-bubble props="t:string" component-role="msg" />',
        '</component-registry>',
        '<frame id="f1">',
        '  <chat-bubble role="user" />',
        '</frame>',
      ].join('\n');
      const file = await writeCanvas('scope-check.html', html);
      const { output } = await normalizeCanvas(file, { inPlace: true });
      // The frame instance should not gain component-role
      const framesSection = output.slice(output.indexOf('</component-registry>'));
      assert.ok(!framesSection.includes('component-role='));
    });

  });

  // ── Already normalized ─────────────────────────────────────────────────────

  describe('already normalized canvas', () => {

    it('reports zero changes on a clean canvas', async () => {
      const file = await writeCanvas('clean.html', makeCanvas({
        registry: `<panel props="title:string" component-role="layout panel" />`,
        frames: `<frame id="f1">\n  <panel role="main" />\n</frame>`,
      }));
      const { changes } = await normalizeCanvas(file, { inPlace: true });
      assert.deepEqual(changes, []);
    });

  });

  // ── Output modes ───────────────────────────────────────────────────────────

  describe('output modes', () => {

    it('default: writes <name>.normalized.html and does not overwrite original', async () => {
      const original = makeCanvas({
        registry: `<card fields="img:string" component-role="c" />`,
      });
      const file = await writeCanvas('out-default.html', original);
      const { writtenTo } = await normalizeCanvas(file);

      assert.ok(writtenTo.endsWith('.normalized.html'), `unexpected path: ${writtenTo}`);
      // original must be unchanged
      const originalContent = await readFile(file, 'utf-8');
      assert.equal(originalContent, original);
      // normalized file must have the rename
      const normalizedContent = await readFile(writtenTo, 'utf-8');
      assert.ok(normalizedContent.includes('data="img:string"'));
    });

    it('inPlace: overwrites the original file', async () => {
      const original = makeCanvas({
        registry: `<badge fields="count:number" component-role="b" />`,
      });
      const file = await writeCanvas('out-inplace.html', original);
      const { writtenTo } = await normalizeCanvas(file, { inPlace: true });

      assert.equal(writtenTo, file);
      const content = await readFile(file, 'utf-8');
      assert.ok(content.includes('data="count:number"'));
    });

  });

  // ── Error handling ─────────────────────────────────────────────────────────

  describe('error handling', () => {

    it('throws when file cannot be read', async () => {
      await assert.rejects(
        () => normalizeCanvas('/nonexistent/path/canvas.html'),
        /cannot read/i
      );
    });

  });

});
