/**
 * @fileoverview canvas-validator.js
 *
 * Parses a pseudo-canvas file and produces:
 *  1. A validated component manifest (JSON + text summary)
 *  2. Errors — spec violations that block generation
 *  3. Warnings — inconsistencies that should be reviewed
 *
 * This module sits between the canvas and the LLM generation pass:
 *
 *   pseudo-canvas-demo.html
 *     → canvas-validator          (programmatic, deterministic)
 *     → { manifest, errors, warnings }
 *     → LLM generation pass       (receives clean, structured context)
 *     → component files
 *
 * Pure Node.js. No DOM. No external dependencies.
 *
 * @module canvas-validator
 * @version 0.1.0
 */

'use strict';

import { readFile } from 'node:fs/promises';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Tags that are layout elements — not components to generate. */
const LAYOUT_ELEMENTS = new Set([
  'row', 'column', 'grid', 'cell', 'stack', 'spacer',
  'frame', 'input', 'style', 'script', 'template',
  'component-registry', 'pk-slot',
  // HTML native
  'div', 'span', 'p', 'a', 'ul', 'li', 'ol', 'button', 'input',
  'form', 'label', 'select', 'option', 'textarea', 'nav', 'main',
  'header', 'footer', 'section', 'article', 'aside', 'h1', 'h2',
  'h3', 'h4', 'h5', 'h6', 'img', 'table', 'tr', 'td', 'th',
]);

/** Valid top-level attribute names in a component declaration. */
const VALID_DECLARATION_ATTRS = new Set([
  'props', 'data', 'on', 'layer', 'element', 'component-role',
  'note', 'behavior', 'types-reference', 'when-visible', 'when-hidden',
]);

/** Valid layers. */
const VALID_LAYERS = new Set(['base', 'layout', 'components', 'utils']);

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ComponentDeclaration
 * @property {string}   name           - Tag name (e.g. 'chat-bubble')
 * @property {boolean}  isLayoutElement - True if declared with element="*"
 * @property {string|null} props        - Raw props string
 * @property {string|null} data         - Raw data string
 * @property {string|null} on           - Raw on string
 * @property {string|null} layer        - CSS layer
 * @property {string|null} componentRole
 * @property {string|null} note
 * @property {string|null} typesReference
 */

/**
 * @typedef {Object} ComponentInstance
 * @property {string}   name   - Tag name
 * @property {string}   frameId - Frame where the instance appears
 * @property {string}   role   - Instance role attribute
 * @property {Object}   attrs  - All attributes as key/value pairs
 * @property {boolean}  loop   - Has loop="" attribute
 */

/**
 * @typedef {Object} ManifestEntry
 * @property {string}             name
 * @property {boolean}            isLayoutElement
 * @property {string|null}        props
 * @property {string|null}        data
 * @property {string|null}        on
 * @property {string|null}        layer
 * @property {string|null}        componentRole
 * @property {string|null}        note
 * @property {string|null}        typesReference
 * @property {ComponentInstance[]} instances
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean}        valid
 * @property {string[]}       errors
 * @property {string[]}       warnings
 * @property {ManifestEntry[]} manifest   - One entry per declared component
 * @property {string}         manifestText - Human/LLM-readable summary
 */

// ─────────────────────────────────────────────────────────────────────────────
// PARSING HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts the inner content of a block tag from raw HTML.
 * @param {string} html
 * @param {string} tag
 * @returns {string|null}
 */
function _extractBlock(html, tag) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m  = html.match(re);
  return m ? m[1].trim() : null;
}

/**
 * Parses all attributes from an opening tag string.
 * @param {string} tagStr - e.g. `<chat-bubble props="..." data="..." />`
 * @returns {Object} key/value map. Boolean attributes have value `true`.
 */
function _parseAttrs(tagStr) {
  const attrs = {};
  // Match name="value", name='value', name=value, or bare name
  const re = /([a-z][a-z0-9-]*)(?:="([^"]*?)"|='([^']*?)'|=([^\s/>]+))?(?=[\s/>])/gi;
  let m;
  while ((m = re.exec(tagStr)) !== null) {
    const key = m[1].toLowerCase();
    // Skip the tag name itself (first match)
    if (key === tagStr.trim().replace(/^</, '').split(/[\s/>]/)[0].toLowerCase()) continue;
    attrs[key] = m[2] ?? m[3] ?? m[4] ?? true;
  }
  return attrs;
}

/**
 * Extracts all opening tags for a given tag name from HTML.
 * Returns an array of raw tag strings (e.g. `<chat-bubble role="..." />`).
 * @param {string} html
 * @param {string} tagName
 * @returns {string[]}
 */
function _findTags(html, tagName) {
  const re = new RegExp(`<${tagName}(\\s[^>]*)?(?:\\/>|>)`, 'gi');
  return (html.match(re) ?? []);
}

/**
 * Extracts all unique custom tag names from an HTML string.
 * Custom = contains a hyphen, or is in a known list.
 * Excludes comments.
 * @param {string} html
 * @returns {Set<string>}
 */
function _extractTagNames(html) {
  // Strip comments
  const stripped = html.replace(/<!--[\s\S]*?-->/g, '');
  const re = /<([a-z][a-z0-9-]*)/gi;
  const tags = new Set();
  let m;
  while ((m = re.exec(stripped)) !== null) {
    tags.add(m[1].toLowerCase());
  }
  return tags;
}

/**
 * Extracts the frame id from a context string like `<frame id="review-screen" ...>`.
 * Returns 'unknown' if no frame can be determined.
 * @param {string} html  - Full canvas HTML
 * @param {number} pos   - Character position of the instance tag
 * @returns {string}
 */
function _getFrameId(html, pos) {
  // Walk backwards to find the nearest opening <frame ...>
  const before = html.slice(0, pos);
  const frameRe = /<frame\s[^>]*id="([^"]+)"/gi;
  let m, last = null;
  while ((m = frameRe.exec(before)) !== null) {
    last = m[1];
  }
  return last ?? 'outside-frame';
}

// ─────────────────────────────────────────────────────────────────────────────
// SPEC VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a props/data/on string against the type grammar.
 * Returns an array of error strings (empty = valid).
 *
 * Grammar:
 *   field:type; field:type?; ...
 *   type = string | number | boolean | void | enum(a|b|c) | type[] | [field:type,...]
 *
 * @param {string} str   - Raw attribute value
 * @param {string} attr  - Attribute name ('props', 'data', 'on') for error messages
 * @param {string} name  - Component name for error messages
 * @returns {string[]}
 */
function _validateTypeString(str, attr, name) {
  if (!str) return [];
  const errors = [];
  const fields = str.split(';').map(f => f.trim()).filter(Boolean);

  for (const field of fields) {
    if (!field.includes(':')) {
      errors.push(`<${name}> ${attr}="${str}": field "${field}" missing type annotation (expected name:type)`);
      continue;
    }
    const [, type] = field.split(':').map(s => s.trim());
    if (!type) {
      errors.push(`<${name}> ${attr}: field "${field}" has empty type`);
    }
  }
  return errors;
}

/**
 * Validates that `on` values follow `eventName:payloadType` format.
 * @param {string} str
 * @param {string} name
 * @returns {string[]}
 */
function _validateOnString(str, name) {
  if (!str) return [];
  const errors = [];
  const fields = str.split(';').map(f => f.trim()).filter(Boolean);

  for (const field of fields) {
    if (!field.includes(':')) {
      errors.push(`<${name}> on="${str}": event "${field}" missing payload type (expected eventName:type)`);
    }
  }
  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS PARSER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses the <component-registry> block and extracts all component declarations.
 * @param {string} registryHtml - Inner HTML of <component-registry>
 * @returns {ComponentDeclaration[]}
 */
function _parseRegistry(registryHtml) {
  const declarations = [];
  // Match all self-closing or block tags at the top level of the registry
  const tagRe = /<([a-z][a-z0-9-]*)(\s[^>]*)?\/?>/gi;
  let m;

  while ((m = tagRe.exec(registryHtml)) !== null) {
    const tagName = m[1].toLowerCase();
    const attrStr = m[0];

    if (tagName === 'spacer' && !attrStr.includes('element=')) continue; // skip bare spacers
    if (tagName === 'slot') continue;

    const attrs = _parseAttrs(attrStr);

    declarations.push({
      name:           tagName,
      isLayoutElement: 'element' in attrs,
      props:          attrs['props']           ?? null,
      data:           attrs['data']            ?? null,
      on:             attrs['on']              ?? null,
      layer:          attrs['layer']           ?? null,
      componentRole:  attrs['component-role']  ?? null,
      note:           attrs['note']            ?? null,
      typesReference: attrs['types-reference'] ?? null,
    });
  }

  // Deduplicate — keep the last declaration for each name (most complete in case of repetition)
  const seen = new Map();
  for (const d of declarations) seen.set(d.name, d);
  return [...seen.values()];
}

/**
 * Finds all instances of a component in the frames section of the canvas.
 * @param {string} framesHtml - HTML of all <frame> blocks combined
 * @param {string} name       - Component tag name
 * @param {string} fullHtml   - Full canvas HTML (for frame detection)
 * @returns {ComponentInstance[]}
 */
function _findInstances(framesHtml, name, fullHtml) {
  const instances = [];
  const re = new RegExp(`<${name}(\\s[^>]*)?\\/?>`, 'gi');
  let m;

  while ((m = re.exec(framesHtml)) !== null) {
    const attrStr = m[0];
    const attrs   = _parseAttrs(attrStr);
    // Find position in full HTML to determine frame
    const posInFull = fullHtml.indexOf(m[0]);
    const frameId   = _getFrameId(fullHtml, posInFull);

    instances.push({
      name,
      frameId,
      role: attrs['role'] ?? null,
      attrs,
      loop: 'loop' in attrs,
    });
  }

  return instances;
}

// ─────────────────────────────────────────────────────────────────────────────
// MANIFEST TEXT GENERATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a human/LLM-readable text summary of the manifest.
 * @param {ManifestEntry[]} manifest
 * @param {string[]} errors
 * @param {string[]} warnings
 * @returns {string}
 */
function _generateManifestText(manifest, errors, warnings) {
  const lines = [];

  lines.push('# pseudo-html-kit — Component Manifest');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  if (errors.length > 0) {
    lines.push(`## ❌ Errors (${errors.length})`);
    errors.forEach(e => lines.push(`  - ${e}`));
    lines.push('');
  }

  if (warnings.length > 0) {
    lines.push(`## ⚠️ Warnings (${warnings.length})`);
    warnings.forEach(w => lines.push(`  - ${w}`));
    lines.push('');
  }

  const components = manifest.filter(m => !m.isLayoutElement);
  const layouts    = manifest.filter(m => m.isLayoutElement);

  lines.push(`## Components to generate (${components.length})`);
  lines.push('');

  for (const entry of components) {
    lines.push(`### \`<${entry.name}>\``);
    if (entry.componentRole) lines.push(`> ${entry.componentRole}`);
    if (entry.props)         lines.push(`- **props**: \`${entry.props}\``);
    if (entry.data)          lines.push(`- **data**: \`${entry.data}\``);
    if (entry.on)            lines.push(`- **on**: \`${entry.on}\``);
    if (entry.layer)         lines.push(`- **layer**: \`${entry.layer}\``);
    if (entry.typesReference) lines.push(`- **types-reference**: \`${entry.typesReference}\``);
    if (entry.note)          lines.push(`- **note**: ${entry.note}`);

    if (entry.instances.length > 0) {
      lines.push(`- **instances**: ${entry.instances.length}`);
      // Group by frame
      const byFrame = {};
      for (const inst of entry.instances) {
        (byFrame[inst.frameId] = byFrame[inst.frameId] ?? []).push(inst);
      }
      for (const [frame, insts] of Object.entries(byFrame)) {
        const roles = insts.map(i => i.role ? `"${i.role}"` : '(no role)').join(', ');
        lines.push(`  - \`${frame}\`: ${roles}`);
      }
    } else {
      lines.push(`- **instances**: 0 ⚠️ declared but never used`);
    }
    lines.push('');
  }

  if (layouts.length > 0) {
    lines.push(`## Layout elements (${layouts.length}) — CSS only, no component file needed`);
    layouts.forEach(l => lines.push(`  - \`<${l.name}>\``));
    lines.push('');
  }

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN VALIDATOR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a pseudo-canvas file and produces a component manifest.
 *
 * Checks:
 *  1. Conformité spec — props/data/on fields follow the type grammar
 *  2. Registry completeness — every tag used in frames is declared in <component-registry>
 *  3. Inter-frame consistency — same component used with contradictory props across frames
 *
 * @param {string} canvasPath - Absolute path to the canvas file
 * @returns {Promise<ValidationResult>}
 *
 * @example
 * import { validateCanvas } from './canvas-validator.js';
 *
 * const result = await validateCanvas('/project/pseudo-canvas-demo.html');
 * if (!result.valid) {
 *   result.errors.forEach(e => console.error('ERROR:', e));
 * }
 * console.log(result.manifestText);
 * // → pass to LLM as context for component generation
 */
export async function validateCanvas(canvasPath) {
  const errors   = [];
  const warnings = [];

  // ── 1. Read canvas ────────────────────────────────────────────────────────

  let html;
  try {
    html = await readFile(canvasPath, 'utf-8');
  } catch (err) {
    return {
      valid: false,
      errors: [`Cannot read canvas file at "${canvasPath}": ${err.message}`],
      warnings: [],
      manifest: [],
      manifestText: '',
    };
  }

  // Strip HTML comments for analysis
  const stripped = html.replace(/<!--[\s\S]*?-->/g, '');

  // ── 2. Extract <component-registry> ──────────────────────────────────────

  const registryHtml = _extractBlock(stripped, 'component-registry');
  if (!registryHtml) {
    errors.push('No <component-registry> block found in canvas.');
    return { valid: false, errors, warnings, manifest: [], manifestText: '' };
  }

  // ── 3. Parse declarations ─────────────────────────────────────────────────

  const declarations = _parseRegistry(registryHtml);
  const declaredNames = new Set(declarations.map(d => d.name));

  // ── 4. Validate spec conformity ───────────────────────────────────────────

  for (const decl of declarations) {
    // 4a. Type grammar validation
    errors.push(..._validateTypeString(decl.props, 'props', decl.name));
    errors.push(..._validateTypeString(decl.data,  'data',  decl.name));
    errors.push(..._validateOnString(decl.on, decl.name));

    // 4b. Layer validation
    if (decl.layer && !VALID_LAYERS.has(decl.layer)) {
      errors.push(`<${decl.name}> layer="${decl.layer}" is not valid. Must be one of: ${[...VALID_LAYERS].join(', ')}`);
    }

    // 4c. Layout elements should not have props/data/on
    if (decl.isLayoutElement) {
      if (decl.props) warnings.push(`<${decl.name}> is a layout element (element="*") but declares props — layout elements have no props`);
      if (decl.data)  warnings.push(`<${decl.name}> is a layout element but declares data — layout elements have no data`);
      if (decl.on)    warnings.push(`<${decl.name}> is a layout element but declares on — layout elements have no events`);
    }

    // 4d. component-role recommended
    if (!decl.isLayoutElement && !decl.componentRole) {
      warnings.push(`<${decl.name}> has no component-role — recommended for LLM context`);
    }
  }

  // ── 5. Extract frames HTML ────────────────────────────────────────────────

  const framesHtml = stripped.replace(/<component-registry[\s\S]*?<\/component-registry>/i, '');

  // ── 6. Check registry completeness ───────────────────────────────────────

  const usedTags = _extractTagNames(framesHtml);

  for (const tag of usedTags) {
    if (LAYOUT_ELEMENTS.has(tag)) continue;
    if (!declaredNames.has(tag)) {
      errors.push(`<${tag}> is used in a frame but not declared in <component-registry>`);
    }
  }

  // Declared but never used
  for (const decl of declarations) {
    if (decl.isLayoutElement) continue;
    if (!usedTags.has(decl.name)) {
      warnings.push(`<${decl.name}> is declared in <component-registry> but never used in any frame`);
    }
  }

  // ── 7. Inter-frame consistency ────────────────────────────────────────────

  // For each non-layout component, collect all instances and compare role usage
  const manifest = [];

  for (const decl of declarations) {
    const instances = _findInstances(framesHtml, decl.name, html);

    // Check: missing role on instances
    for (const inst of instances) {
      if (!inst.role) {
        warnings.push(`<${decl.name}> instance in frame "${inst.frameId}" has no role attribute`);
      }
    }

    // Check: loop="" without data in declaration
    const loopInstances = instances.filter(i => i.loop);
    if (loopInstances.length > 0 && !decl.data) {
      warnings.push(`<${decl.name}> has loop="" instances but no data declared in <component-registry>`);
    }

    // Check: props used on instances that weren't declared
    const declaredProps = new Set(
      (decl.props ?? '').split(';')
        .map(f => f.trim().split(':')[0].trim().replace(/\?$/, ''))
        .filter(Boolean)
    );

    for (const inst of instances) {
      for (const [attrKey] of Object.entries(inst.attrs)) {
        // Skip system attributes
        if (['role', 'id', 'loop', 'slot', 'when-visible', 'when-hidden', 'behavior', 'note'].includes(attrKey)) continue;
        if (attrKey.startsWith('data-')) continue;
        if (declaredProps.size > 0 && !declaredProps.has(attrKey)) {
          warnings.push(`<${decl.name}> instance in "${inst.frameId}" uses undeclared prop "${attrKey}"`);
        }
      }
    }

    manifest.push({ ...decl, instances });
  }

  // ── 8. Generate manifest text ─────────────────────────────────────────────

  const manifestText = _generateManifestText(manifest, errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    manifest,
    manifestText,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI USAGE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CLI entry point.
 * Usage: node canvas-validator.js path/to/pseudo-canvas-demo.html [--json]
 */
if (process.argv[1] && process.argv[1].endsWith('canvas-validator.js')) {
  const [,, canvasPath, flag] = process.argv;

  if (!canvasPath) {
    console.error('Usage: node canvas-validator.js <canvas-file> [--json]');
    process.exit(1);
  }

  const { resolve } = await import('node:path');
  const abs = resolve(process.cwd(), canvasPath);
  const result = await validateCanvas(abs);

  if (flag === '--json') {
    console.log(JSON.stringify({ valid: result.valid, errors: result.errors, warnings: result.warnings, manifest: result.manifest }, null, 2));
  } else {
    console.log(result.manifestText);
    if (!result.valid) process.exit(1);
  }
}
