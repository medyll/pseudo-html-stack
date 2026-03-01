/**
 * @fileoverview state-shared.test.js
 * Tests for shared/state-shared.js
 *
 * Run: node --test tests/state-shared.test.js
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_STATE,
  STATE_SCRIPT_ID,
  serialize_shared,
  serializeToTag_shared,
  deserialize_shared,
  deserializeFromTag_shared,
  merge_shared,
  defaultState_shared,
} from '../src/shared/state-shared.js';

// ─────────────────────────────────────────────────────────────────────────────
// SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('state-shared', () => {

  // ── DEFAULT_STATE ────────────────────────────────────────────────────────

  describe('DEFAULT_STATE', () => {

    it('is frozen', () => {
      assert.ok(Object.isFrozen(DEFAULT_STATE));
    });

    it('has all required keys', () => {
      const keys = Object.keys(DEFAULT_STATE).sort();
      assert.deepEqual(keys, [
        'aiRunning',
        'diffLaunched',
        'focusMode',
        'step',
        'suggestionsAvailable',
        'tabCoherenceActive',
        'tabHistoryActive',
        'tabStyleActive',
        'tabSuggestionsActive',
      ]);
    });

    it('has correct default values', () => {
      assert.equal(DEFAULT_STATE.focusMode,            false);
      assert.equal(DEFAULT_STATE.aiRunning,            false);
      assert.equal(DEFAULT_STATE.suggestionsAvailable, false);
      assert.equal(DEFAULT_STATE.tabSuggestionsActive, true);
      assert.equal(DEFAULT_STATE.tabCoherenceActive,   false);
      assert.equal(DEFAULT_STATE.tabStyleActive,       false);
      assert.equal(DEFAULT_STATE.tabHistoryActive,     false);
      assert.equal(DEFAULT_STATE.diffLaunched,         false);
      assert.equal(DEFAULT_STATE.step,                 1);
    });

  });

  // ── STATE_SCRIPT_ID ──────────────────────────────────────────────────────

  describe('STATE_SCRIPT_ID', () => {

    it('is a non-empty string', () => {
      assert.ok(typeof STATE_SCRIPT_ID === 'string');
      assert.ok(STATE_SCRIPT_ID.length > 0);
    });

    it('equals pk-state', () => {
      assert.equal(STATE_SCRIPT_ID, 'pk-state');
    });

  });

  // ── serialize_shared ─────────────────────────────────────────────────────

  describe('serialize_shared', () => {

    it('returns a valid JSON string', () => {
      const json = serialize_shared({});
      assert.doesNotThrow(() => JSON.parse(json));
    });

    it('merges overrides with DEFAULT_STATE', () => {
      const json   = serialize_shared({ focusMode: true });
      const parsed = JSON.parse(json);
      assert.equal(parsed.focusMode, true);
      assert.equal(parsed.aiRunning, false); // default preserved
    });

    it('serializes full state when no overrides', () => {
      const json   = serialize_shared({});
      const parsed = JSON.parse(json);
      assert.deepEqual(parsed, DEFAULT_STATE);
    });

    it('handles step as string (2b)', () => {
      const json   = serialize_shared({ step: '2b' });
      const parsed = JSON.parse(json);
      assert.equal(parsed.step, '2b');
    });

    it('handles step as string (2c)', () => {
      const json   = serialize_shared({ step: '2c' });
      const parsed = JSON.parse(json);
      assert.equal(parsed.step, '2c');
    });

    it('does not mutate DEFAULT_STATE', () => {
      serialize_shared({ focusMode: true });
      assert.equal(DEFAULT_STATE.focusMode, false);
    });

  });

  // ── serializeToTag_shared ────────────────────────────────────────────────

  describe('serializeToTag_shared', () => {

    it('returns a string containing <script>', () => {
      const tag = serializeToTag_shared();
      assert.ok(tag.includes('<script'));
    });

    it('contains the STATE_SCRIPT_ID as id attribute', () => {
      const tag = serializeToTag_shared();
      assert.ok(tag.includes(`id="${STATE_SCRIPT_ID}"`));
    });

    it('uses type="application/json"', () => {
      const tag = serializeToTag_shared();
      assert.ok(tag.includes('type="application/json"'));
    });

    it('closes with </script>', () => {
      const tag = serializeToTag_shared();
      assert.ok(tag.includes('</script>'));
    });

    it('embeds valid JSON', () => {
      const tag   = serializeToTag_shared({ focusMode: true });
      const match = tag.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      assert.ok(match);
      const parsed = JSON.parse(match[1]);
      assert.equal(parsed.focusMode, true);
    });

    it('defaults to empty overrides', () => {
      const tag    = serializeToTag_shared();
      const match  = tag.match(/<script[^>]*>([\s\S]*?)<\/script>/);
      const parsed = JSON.parse(match[1]);
      assert.deepEqual(parsed, DEFAULT_STATE);
    });

  });

  // ── deserialize_shared ───────────────────────────────────────────────────

  describe('deserialize_shared', () => {

    it('parses a valid JSON string', () => {
      const json  = serialize_shared({ focusMode: true });
      const state = deserialize_shared(json);
      assert.equal(state.focusMode, true);
    });

    it('fills missing keys with DEFAULT_STATE values', () => {
      const state = deserialize_shared('{"focusMode":true}');
      assert.equal(state.aiRunning, false);
      assert.equal(state.step,      1);
    });

    it('returns a full AppState with all keys', () => {
      const state = deserialize_shared('{}');
      assert.deepEqual(Object.keys(state).sort(), Object.keys(DEFAULT_STATE).sort());
    });

    it('throws on malformed JSON', () => {
      assert.throws(
        () => deserialize_shared('not json'),
        /Failed to deserialize/i
      );
    });

    it('throws on empty string', () => {
      assert.throws(
        () => deserialize_shared(''),
        /Failed to deserialize/i
      );
    });

  });

  // ── deserializeFromTag_shared ────────────────────────────────────────────

  describe('deserializeFromTag_shared', () => {

    it('returns DEFAULT_STATE when document is undefined', () => {
      // In Node.js, document is undefined — this is the expected path
      const state = deserializeFromTag_shared();
      assert.deepEqual(state, DEFAULT_STATE);
    });

    it('returns a copy, not the DEFAULT_STATE reference', () => {
      const state = deserializeFromTag_shared();
      assert.notEqual(state, DEFAULT_STATE);
    });

    it('result is not frozen (mutable)', () => {
      const state = deserializeFromTag_shared();
      assert.doesNotThrow(() => { state.focusMode = true; });
    });

  });

  // ── merge_shared ─────────────────────────────────────────────────────────

  describe('merge_shared', () => {

    it('merges patch into current state', () => {
      const current = defaultState_shared();
      const next    = merge_shared(current, { focusMode: true });
      assert.equal(next.focusMode, true);
    });

    it('does not mutate the current state', () => {
      const current = defaultState_shared();
      merge_shared(current, { focusMode: true });
      assert.equal(current.focusMode, false);
    });

    it('preserves unpatched keys', () => {
      const current = defaultState_shared();
      const next    = merge_shared(current, { focusMode: true });
      assert.equal(next.aiRunning,            false);
      assert.equal(next.tabSuggestionsActive, true);
    });

    it('handles empty patch', () => {
      const current = defaultState_shared();
      const next    = merge_shared(current, {});
      assert.deepEqual(next, current);
    });

    it('returns a new object reference', () => {
      const current = defaultState_shared();
      const next    = merge_shared(current, {});
      assert.notEqual(next, current);
    });

  });

  // ── defaultState_shared ──────────────────────────────────────────────────

  describe('defaultState_shared', () => {

    it('returns an object equal to DEFAULT_STATE', () => {
      assert.deepEqual(defaultState_shared(), DEFAULT_STATE);
    });

    it('returns a new object each call', () => {
      const a = defaultState_shared();
      const b = defaultState_shared();
      assert.notEqual(a, b);
    });

    it('is mutable — does not affect DEFAULT_STATE', () => {
      const state = defaultState_shared();
      state.focusMode = true;
      assert.equal(DEFAULT_STATE.focusMode, false);
    });

  });

});
