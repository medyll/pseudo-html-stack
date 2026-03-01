/**
 * @fileoverview registry-shared.test.js
 * Tests for shared/registry-shared.js
 *
 * Run: node --test tests/registry-shared.test.js
 */

import { describe, it, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';

import {
  register_shared,
  lookup_shared,
  all_shared,
  isRegistered_shared,
  reset_shared,
} from '../src/shared/registry-shared.js';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const MANUAL = { name: 'chat-bubble', src: 'components/chat-bubble.html' };
const MANUAL_2 = { name: 'panel', src: 'components/panel.html' };
const IMPORT_META = { url: 'file:///project/components/toolbar.html' };

// ─────────────────────────────────────────────────────────────────────────────
// SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('registry-shared', () => {

  beforeEach(() => {
    reset_shared();
  });

  // ── register_shared ─────────────────────────────────────────────────────

  describe('register_shared — manual', () => {

    it('registers a component with name and src', () => {
      const def = register_shared(MANUAL);
      assert.equal(def.name, 'chat-bubble');
      assert.equal(def.src, 'components/chat-bubble.html');
    });

    it('sets loaded to false on registration', () => {
      const def = register_shared(MANUAL);
      assert.equal(def.loaded, false);
    });

    it('sets autoReg to false on manual registration', () => {
      const def = register_shared(MANUAL);
      assert.equal(def.autoReg, false);
    });

    it('throws if name is missing', () => {
      assert.throws(
        () => register_shared({ src: 'components/foo.html' }),
        /name.*required/i
      );
    });

    it('throws if name is empty string', () => {
      assert.throws(
        () => register_shared({ name: '', src: 'components/foo.html' }),
        /name.*required/i
      );
    });

    it('throws if src is missing', () => {
      assert.throws(
        () => register_shared({ name: 'foo-bar' }),
        /src.*required/i
      );
    });

    it('throws if src is empty string', () => {
      assert.throws(
        () => register_shared({ name: 'foo-bar', src: '' }),
        /src.*required/i
      );
    });

    it('returns the existing definition on duplicate registration', () => {
      const first  = register_shared(MANUAL);
      const second = register_shared(MANUAL);
      assert.equal(first, second);
    });

    it('emits a warning on duplicate registration', () => {
      const warnings = [];
      const orig = console.warn;
      console.warn = (...args) => warnings.push(args.join(' '));

      register_shared(MANUAL);
      register_shared(MANUAL);

      console.warn = orig;
      assert.ok(warnings.some(w => w.includes('chat-bubble')));
    });

  });

  describe('register_shared — auto (import.meta)', () => {

    it('derives name from filename', () => {
      const def = register_shared(IMPORT_META);
      assert.equal(def.name, 'toolbar');
    });

    it('sets src to the import.meta url', () => {
      const def = register_shared(IMPORT_META);
      assert.equal(def.src, IMPORT_META.url);
    });

    it('sets autoReg to true', () => {
      const def = register_shared(IMPORT_META);
      assert.equal(def.autoReg, true);
    });

    it('sets loaded to false', () => {
      const def = register_shared(IMPORT_META);
      assert.equal(def.loaded, false);
    });

    it('throws if url is empty', () => {
      assert.throws(
        () => register_shared({ url: '' }),
        /name/i
      );
    });

    it('throws if filename cannot be derived', () => {
      assert.throws(
        () => register_shared({ url: 'file:///project/components/' }),
        /Cannot derive/i
      );
    });

    it('handles http:// URLs', () => {
      const def = register_shared({ url: 'http://localhost/components/badge.html' });
      assert.equal(def.name, 'badge');
    });

    it('handles relative-style paths as URL', () => {
      const def = register_shared({ url: '/components/diff-view.html' });
      assert.equal(def.name, 'diff-view');
    });

  });

  // ── lookup_shared ────────────────────────────────────────────────────────

  describe('lookup_shared', () => {

    it('returns the definition after registration', () => {
      register_shared(MANUAL);
      const def = lookup_shared('chat-bubble');
      assert.equal(def.name, 'chat-bubble');
    });

    it('returns undefined for unknown component', () => {
      assert.equal(lookup_shared('unknown-thing'), undefined);
    });

    it('returns undefined before any registration', () => {
      assert.equal(lookup_shared('panel'), undefined);
    });

  });

  // ── all_shared ───────────────────────────────────────────────────────────

  describe('all_shared', () => {

    it('returns empty array when registry is empty', () => {
      assert.deepEqual(all_shared(), []);
    });

    it('returns all registered definitions', () => {
      register_shared(MANUAL);
      register_shared(MANUAL_2);
      const all = all_shared();
      assert.equal(all.length, 2);
      assert.ok(all.some(d => d.name === 'chat-bubble'));
      assert.ok(all.some(d => d.name === 'panel'));
    });

    it('preserves registration order', () => {
      register_shared(MANUAL);
      register_shared(MANUAL_2);
      const names = all_shared().map(d => d.name);
      assert.deepEqual(names, ['chat-bubble', 'panel']);
    });

    it('returns a copy — mutating the array does not affect the registry', () => {
      register_shared(MANUAL);
      const all = all_shared();
      all.length = 0;
      assert.equal(all_shared().length, 1);
    });

  });

  // ── isRegistered_shared ──────────────────────────────────────────────────

  describe('isRegistered_shared', () => {

    it('returns true for a registered component', () => {
      register_shared(MANUAL);
      assert.equal(isRegistered_shared('chat-bubble'), true);
    });

    it('returns false for an unregistered component', () => {
      assert.equal(isRegistered_shared('chat-bubble'), false);
    });

    it('returns false after reset', () => {
      register_shared(MANUAL);
      reset_shared();
      assert.equal(isRegistered_shared('chat-bubble'), false);
    });

  });

  // ── reset_shared ─────────────────────────────────────────────────────────

  describe('reset_shared', () => {

    it('clears all registrations', () => {
      register_shared(MANUAL);
      register_shared(MANUAL_2);
      reset_shared();
      assert.equal(all_shared().length, 0);
    });

    it('allows re-registering after reset', () => {
      register_shared(MANUAL);
      reset_shared();
      const def = register_shared(MANUAL);
      assert.equal(def.name, 'chat-bubble');
    });

  });

  // ── definition shape ─────────────────────────────────────────────────────

  describe('ComponentDefinition shape', () => {

    it('has exactly the expected keys', () => {
      const def = register_shared(MANUAL);
      const keys = Object.keys(def).sort();
      assert.deepEqual(keys, ['autoReg', 'loaded', 'name', 'src']);
    });

  });

});
