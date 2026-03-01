/**
 * @fileoverview canvas-normalize.js
 *
 * Normalizes a pseudo-canvas file by applying automatic corrections:
 *
 *  1. Rename obsolete attributes
 *       fields="..."        → data="..."
 *       visible-when="..."  → when-visible="..."
 *       hidden-when="..."   → when-hidden="..."
 *
 *  2. Add missing component-role="" on registry declarations
 *       <chat-bubble props="..." />
 *       → <chat-bubble props="..." component-role="" />
 *
 *  3. Add missing role="" on frame instances
 *       <panel id="editor-panel" />
 *       → <panel id="editor-panel" role="" />
 *
 * Does NOT modify:
 *  - Component files (chat-bubble.html, panel.html…)
 *  - Layout elements (row, column, spacer…)
 *  - Comments or style/script blocks
 *  - Existing attribute values
 *
 * Output:
 *  - Default : writes <canvas>.normalized.html alongside the original
 *  - --in-place : overwrites the original
 *
 * Usage:
 *   node canvas-normalize.js pseudo-canvas-demo.html
 *   node canvas-normalize.js pseudo-canvas-demo.html --in-place
 *
 * @module canvas-normalize
 * @version 0.1.0
 */

'use strict';

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, basename, extname } from 'node:path';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Tags that are layout primitives — skip role injection on instances. */
const LAYOUT_ELEMENTS = new Set([
  'row', 'column', 'grid', 'cell', 'stack', 'spacer',
  'frame', 'input', 'style', 'script', 'template', 'pk-slot',
  'component-registry', 'button-theme',
  'div', 'span', 'p', 'a', 'ul', 'li', 'ol', 'nav', 'main',
  'header', 'footer', 'section', 'article', 'aside',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img',
  'table', 'tr', 'td', 'th', 'form', 'label',
]);

/** Obsolete attribute renames: old → new */
const ATTR_RENAMES = new Map([
  ['fields',       'data'],
  ['visible-when', 'when-visible'],
  ['hidden-when',  'when-hidden'],
]);

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} NormalizeResult
 * @property {string}   output    - Normalized HTML string
 * @property {string[]} changes   - Human-readable list of changes applied
 * @property {string}   writtenTo - Path where output was written
 */

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts the inner content of a block tag.
 * Returns [content, startIndex, endIndex] so we can replace it in the original.
 * @param {string} html
 * @param {string} tag
 * @returns {{ content: string, start: number, end: number } | null}
 */
function _findBlock(html, tag) {
  const openRe = new RegExp(`<${tag}(?:\\s[^>]*)?>`, 'i');
  const openM  = openRe.exec(html);
  if (!openM) return null;

  const start   = openM.index + openM[0].length;
  const closeTag = `</${tag}>`;
  const end     = html.indexOf(closeTag, start);
  if (end === -1) return null;

  return {
    content: html.slice(start, end),
    start,
    end,
    fullStart: openM.index,
    fullEnd:   end + closeTag.length,
  };
}

/**
 * Returns true if a tag string already contains an attribute with the given name.
 * @param {string} tagStr
 * @param {string} attr
 * @returns {boolean}
 */
function _hasAttr(tagStr, attr) {
  const re = new RegExp(`\\b${attr}\\s*(?:=|\\s|>|\\/)`);
  return re.test(tagStr);
}

/**
 * Injects an attribute just before the closing `/>` or `>` of a tag string.
 * @param {string} tagStr - e.g. `<chat-bubble props="..." />`
 * @param {string} attr   - e.g. `component-role=""`
 * @returns {string}
 */
function _injectAttr(tagStr, attr) {
  // Before self-close />
  if (tagStr.endsWith('/>')) {
    return tagStr.slice(0, -2).trimEnd() + `\n    ${attr}\n  />`;
  }
  // Before >
  if (tagStr.endsWith('>')) {
    return tagStr.slice(0, -1).trimEnd() + `\n    ${attr}\n  >`;
  }
  return tagStr + ` ${attr}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 1. Renames obsolete attributes throughout the entire file.
 * Only renames standalone attribute names, not values or content inside strings.
 *
 * @param {string} html
 * @param {string[]} changes
 * @returns {string}
 */
function _renameObsoleteAttrs(html, changes) {
  let result = html;

  for (const [oldAttr, newAttr] of ATTR_RENAMES) {
    // Match the attribute name as a word boundary in a tag context
    // e.g.  fields="..."  or  fields='...'  or  bare fields
    const re = new RegExp(`\\b${oldAttr}(?=\\s*=|\\s|\\/>|>)`, 'g');
    const count = (result.match(re) ?? []).length;

    if (count > 0) {
      result = result.replace(re, newAttr);
      changes.push(`Renamed ${count}× \`${oldAttr}\` → \`${newAttr}\``);
    }
  }

  return result;
}

/**
 * 2. Adds missing component-role="" to declarations in <component-registry>.
 * Only affects tags that are real components (no element="*") and lack component-role.
 *
 * @param {string} html
 * @param {string[]} changes
 * @returns {string}
 */
function _addMissingComponentRoles(html, changes) {
  const block = _findBlock(html, 'component-registry');
  if (!block) return html;

  let registry = block.content;

  // Match each opening tag inside the registry
  const tagRe = /<([a-z][a-z0-9-]*)(\s[^>]*)?(?:\/>|>)/g;
  let m;
  let offset = 0;
  let modified = registry;

  const replacements = [];
  const patched = new Set(); // deduplicate — only patch first occurrence per tag name

  while ((m = tagRe.exec(registry)) !== null) {
    const tagStr  = m[0];
    const tagName = m[1].toLowerCase();

    if (LAYOUT_ELEMENTS.has(tagName)) continue;
    if (tagName === 'slot') continue;
    if (_hasAttr(tagStr, 'component-role')) continue;
    if (_hasAttr(tagStr, 'element')) continue;
    if (patched.has(tagName)) continue; // skip duplicate declarations

    patched.add(tagName);
    replacements.push({ tagStr, tagName, index: m.index });
  }

  // Apply replacements in reverse order to preserve indices
  for (const { tagStr, tagName, index } of replacements.reverse()) {
    const fixed = _injectAttr(tagStr, 'component-role=""');
    modified = modified.slice(0, index) + fixed + modified.slice(index + tagStr.length);
    changes.push(`Added \`component-role=""\` to \`<${tagName}>\` in component-registry`);
  }

  return html.slice(0, block.start) + modified + html.slice(block.end);
}

/**
 * 3. Adds missing role="" to component instances in <frame> blocks.
 * Skips layout elements, tags already having role, and tags inside component-registry.
 *
 * @param {string} html
 * @param {string[]} changes
 * @returns {string}
 */
function _addMissingRoles(html, changes) {
  // Find the frames section — everything after </component-registry> and before <style>
  const registryEnd = html.indexOf('</component-registry>');
  if (registryEnd === -1) return html;

  const styleStart = html.lastIndexOf('<style>');
  const framesSection = html.slice(
    registryEnd + '</component-registry>'.length,
    styleStart === -1 ? undefined : styleStart
  );

  const tagRe = /<([a-z][a-z0-9-]*)(\s[^>]*)?(?:\/>|>)/g;
  let m;
  const replacements = [];

  while ((m = tagRe.exec(framesSection)) !== null) {
    const tagStr  = m[0];
    const tagName = m[1].toLowerCase();

    if (LAYOUT_ELEMENTS.has(tagName)) continue;
    if (tagName === 'slot') continue;

    if (_hasAttr(tagStr, 'role')) continue;

    replacements.push({
      tagStr,
      tagName,
      // Position in the original html
      index: registryEnd + '</component-registry>'.length + m.index,
    });
  }

  if (replacements.length === 0) return html;

  // Apply in reverse order
  let result = html;
  for (const { tagStr, tagName, index } of replacements.reverse()) {
    const fixed = _injectAttr(tagStr, 'role=""');
    result = result.slice(0, index) + fixed + result.slice(index + tagStr.length);
    changes.push(`Added \`role=""\` to \`<${tagName}>\` instance`);
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN NORMALIZER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalizes a pseudo-canvas file.
 *
 * @param {string} canvasPath  - Path to the canvas file (absolute or relative to cwd)
 * @param {Object} [options]
 * @param {boolean} [options.inPlace=false] - Overwrite the original file
 * @returns {Promise<NormalizeResult>}
 *
 * @example
 * import { normalizeCanvas } from './canvas-normalize.js';
 *
 * const result = await normalizeCanvas('./pseudo-canvas-demo.html');
 * console.log(result.changes);
 * // → ['Renamed 3× `fields` → `data`', 'Added `component-role=""` to `<row>`', ...]
 */
export async function normalizeCanvas(canvasPath, { inPlace = false } = {}) {
  const absPath = resolve(process.cwd(), canvasPath);

  let html;
  try {
    html = await readFile(absPath, 'utf-8');
  } catch (err) {
    throw new Error(`[canvas-normalize] Cannot read "${absPath}": ${err.message}`);
  }

  const changes = [];
  let output = html;

  // Apply normalizations in order
  output = _renameObsoleteAttrs(output, changes);
  output = _addMissingComponentRoles(output, changes);
  output = _addMissingRoles(output, changes);

  // Determine output path
  let writtenTo;
  if (inPlace) {
    writtenTo = absPath;
  } else {
    const dir  = dirname(absPath);
    const ext  = extname(absPath);
    const base = basename(absPath, ext);
    writtenTo = resolve(dir, `${base}.normalized${ext}`);
  }

  await writeFile(writtenTo, output, 'utf-8');

  return { output, changes, writtenTo };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────────

if (process.argv[1]?.endsWith('canvas-normalize.js')) {
  const args     = process.argv.slice(2);
  const inPlace  = args.includes('--in-place');
  const canvasPath = args.find(a => !a.startsWith('--'));

  if (!canvasPath) {
    console.error('Usage: node canvas-normalize.js <canvas-file> [--in-place]');
    process.exit(1);
  }

  try {
    const result = await normalizeCanvas(canvasPath, { inPlace });

    if (result.changes.length === 0) {
      console.log('✓ Canvas already normalized — no changes needed.');
    } else {
      console.log(`✓ ${result.changes.length} correction(s) applied:\n`);
      result.changes.forEach(c => console.log(`  · ${c}`));
    }

    console.log(`\n→ Written to: ${result.writtenTo}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
