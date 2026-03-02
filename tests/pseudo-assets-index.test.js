/**
 * @fileoverview pseudo-assets-index.test.js
 * Tests for src/pseudo-assets/index.js
 *
 * Covers:
 *  - NOM-06: 5 component files renamed to -pk suffix — URLs must resolve correctly
 *  - Sanity: all exported component keys map to existing .html URLs
 *
 * Run: node --test tests/pseudo-assets-index.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { components, componentNames, frames } from '../src/pseudo-assets/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Convert a file:// URL exported by index.js to a local path for fs.access */
function urlToPath(href) {
  try {
    return fileURLToPath(href);
  } catch {
    return null;
  }
}

async function exists(href) {
  const p = urlToPath(href);
  if (!p) return false;
  try { await access(p); return true; } catch { return false; }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('pseudo-assets index.js', () => {

  // ── NOM-06: renamed files ──────────────────────────────────────────────────

  describe('NOM-06 — renamed component files end with -pk.html', () => {
    const renamed = {
      button:   'button-pk.html',
      input:    'input-pk.html',
      label:    'label-pk.html',
      textarea: 'textarea-pk.html',
      footer:   'footer-pk.html',
    };

    for (const [key, expectedFilename] of Object.entries(renamed)) {
      it(`components.${key} URL ends with ${expectedFilename}`, () => {
        const url = components[key];
        assert.ok(url, `components.${key} is not exported`);
        assert.ok(url.endsWith(expectedFilename),
          `Expected URL to end with ${expectedFilename}, got: ${url}`);
      });

      it(`components.${key} file exists on disk`, async () => {
        const ok = await exists(components[key]);
        assert.ok(ok, `File not found: ${components[key]}`);
      });
    }
  });

  // ── All component URLs exist on disk ───────────────────────────────────────

  describe('all component URLs resolve to existing files', () => {
    for (const [key, url] of Object.entries(components)) {
      it(`components.${key} exists`, async () => {
        const ok = await exists(url);
        assert.ok(ok, `Missing file for components.${key}: ${url}`);
      });
    }
  });

  // ── All frame URLs exist on disk ───────────────────────────────────────────

  describe('all frame URLs resolve to existing files', () => {
    for (const [key, url] of Object.entries(frames)) {
      it(`frames.${key} exists`, async () => {
        const ok = await exists(url);
        assert.ok(ok, `Missing file for frames.${key}: ${url}`);
      });
    }
  });

  // ── componentNames all end with -pk ────────────────────────────────────────

  describe('componentNames', () => {
    it('all tag names end with -pk', () => {
      for (const [key, tagName] of Object.entries(componentNames)) {
        assert.ok(tagName.endsWith('-pk'),
          `componentNames.${key} = "${tagName}" does not end with -pk`);
      }
    });

    it('components keys match componentNames keys', () => {
      const compKeys = new Set(Object.keys(components));
      const nameKeys = new Set(Object.keys(componentNames));
      for (const k of nameKeys) {
        assert.ok(compKeys.has(k), `componentNames has "${k}" but components does not`);
      }
    });
  });

});
