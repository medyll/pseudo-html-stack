/**
 * @fileoverview pseudo-kit-client.js — Browser runtime for pseudo-kit.
 *
 * Responsibilities:
 *  - Observe the DOM for pseudo-kit components (MutationObserver)
 *  - Fetch and parse component .html files on demand
 *  - Stamp <template> content into resolved elements
 *    - Named slots: matches slot[name] to children with slot="name"
 *    - Default slot: catches all unassigned children
 *    - Slot wrappers: <pk-slot display:contents> carry slot metadata
 *  - Manage component <style> blocks via CSSStyleSheet API (no DOM injection)
 *  - Evaluate component <script> blocks in a sandboxed scope
 *  - Handle loop="" rendering
 *  - Detect SSR-hydrated elements and skip re-stamping
 *  - Provide a reactive state proxy that writes data-* on :root for CSS :has()
 *  - Hydrate initial state from <script id="pk-state" type="application/json">
 *
 * No framework. No build step. Browser only (no Node APIs).
 * Requires: shared/registry-shared.js, shared/state-shared.js
 * Targets: Chrome 118+, Firefox 128+, Safari 17.4+
 *
 * @module pseudo-kit-client
 * @version 0.1.0
 */

'use strict';

import {
  register_shared,
  lookup_shared,
  all_shared,
  isRegistered_shared,
} from '../shared/registry-shared.js';

import {
  deserializeFromTag_shared,
  merge_shared,
  defaultState_shared,
} from '../shared/state-shared.js';

// ─────────────────────────────────────────────────────────────────────────────
// CSS — STYLESHEET MANAGEMENT (no DOM injection)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The single adoptable CSSStyleSheet used for all component styles.
 * Adopted once on document. Component rules are inserted/replaced here —
 * no extra <style> tags are ever added to the DOM.
 *
 * @type {CSSStyleSheet}
 */
const _componentSheet = new CSSStyleSheet();
document.adoptedStyleSheets = [...document.adoptedStyleSheets, _componentSheet];

/**
 * Index of known @scope rule positions in _componentSheet, keyed by component name.
 * Used to locate and replace rules without scanning the entire sheet each time.
 *
 * @type {Map<string, number>} name → rule index in _componentSheet
 */
const _scopeRuleIndex = new Map();

/**
 * Registers a component's CSS into the shared adoptable stylesheet.
 *
 * If a rule for this component's @scope already exists, it is replaced in-place.
 * If not, it is appended. The DOM is never touched.
 *
 * @param {string} name - Component tag name (e.g. "chat-bubble").
 * @param {string} css  - Raw CSS string from the component's <style> block.
 *                        Expected to contain an @layer components { @scope (...) { ... } } block.
 * @returns {void}
 *
 * @example
 * _upsertComponentStyle('chat-bubble', `
 *   @layer components {
 *     @scope (chat-bubble) {
 *       :scope { border-radius: 8px; }
 *     }
 *   }
 * `);
 */
function _upsertComponentStyle(name, css) {
  try {
    if (_scopeRuleIndex.has(name)) {
      // Replace existing rule in-place — no new DOM node
      const idx = _scopeRuleIndex.get(name);
      _componentSheet.deleteRule(idx);
      _componentSheet.insertRule(css, idx);
    } else {
      // Append new rule and record its index
      const idx = _componentSheet.cssRules.length;
      _componentSheet.insertRule(css, idx);
      _scopeRuleIndex.set(name, idx);
    }
  } catch (err) {
    // insertRule may fail in non-browser environments (e.g. happy-dom in tests)
    // for complex CSS like @layer/@scope — log and continue
    console.warn(`[pseudo-kit] Could not insert CSS for "${name}": ${err.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATION OBSERVER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Starts observing the DOM for pseudo-kit elements.
 * Triggers component resolution when registered elements appear in the tree.
 *
 * @param {Element} [root=document.body] - Root element to observe.
 * @returns {MutationObserver} The active observer instance.
 *
 * @example
 * _observe();
 * _observe(document.getElementById('app-root'));
 */
function _observe(root = document.body) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        _resolveTree(/** @type {Element} */ (node)).catch(err =>
          console.error('[pseudo-kit]', err.message ?? err)
        );
      }
    }
  });

  observer.observe(root, { childList: true, subtree: true });
  _resolveTree(root).catch(err =>
    console.error('[pseudo-kit]', err.message ?? err)
  ); // process existing DOM at init time

  return observer;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT RESOLUTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Walks an element tree and resolves all pseudo-kit components found.
 *
 * @param {Element} root
 * @returns {Promise<void>}
 */
async function _resolveTree(root) {
  for (const el of _collectComponents(root)) {
    await _resolveComponent(el);
  }
}

/**
 * Collects all elements in the tree matching a registered component name.
 *
 * @param {Element} root
 * @returns {Element[]}
 */
function _collectComponents(root) {
  const names = all_shared().map(d => d.name);
  if (!names.length) return [];

  const selector = names.join(', ');
  const results  = [];

  if (root.matches?.(selector)) results.push(root);
  results.push(...root.querySelectorAll(selector));

  return results;
}

/**
 * Detects whether a component element has already been hydrated by SSR.
 * A server-rendered element contains a <pk-slot> wrapper as a direct child,
 * injected by pseudo-kit-server.js during renderComponent_server().
 *
 * When already hydrated, the client skips stamping to avoid double-rendering,
 * but still evaluates the script and processes loops.
 *
 * @param {Element} el - The component element to check.
 * @returns {boolean} True if the element was server-rendered.
 */
function _isSSRHydrated(el) {
  for (let c = el.firstElementChild; c; c = c.nextElementSibling) {
    if (c.tagName.toLowerCase() === 'pk-slot') return true;
  }
  return false;
}

/**
 * Resolves a single pseudo-kit element:
 *  1. Loads the component definition if not yet loaded
 *  2. Detects SSR hydration — skips stamp if already rendered by server
 *  3. Stamps the <template> into the element (named + default slots)
 *  4. Upserts the component CSS via CSSStyleSheet (no DOM injection)
 *  5. Evaluates the <script> in the element's context
 *  6. Marks loop="" children as pending
 *
 * @param {Element} el
 * @returns {Promise<void>}
 */
async function _resolveComponent(el) {
  const name = el.tagName.toLowerCase();
  const def  = lookup_shared(name);

  if (!def) return;
  if (el.dataset.pkResolved) return;

  if (!def.loaded) {
    await _loadComponent(def);
  }

  if (_isSSRHydrated(el)) {
    // SSR path: server already stamped the template.
    // Mark as hydrated, skip stamp, still run script + loops.
    el.dataset.pkHydrated = 'true';
  } else {
    // CSR path: stamp template into the element.
    _stampTemplate(el, def);
  }

  if (def.style) {
    _upsertComponentStyle(name, def.style);
  }

  _evalScript(el, def);
  _markLoops(el);

  el.dataset.pkResolved = 'true';
}

/**
 * Fetches and parses a component .html file.
 * Populates def.template, def.style, def.script, def.loaded.
 *
 * Handles two script modes:
 *
 * **Inline script** (`<script>` without type="module"):
 * Raw JS is stored in def.script and evaluated later by {@link _evalScript}
 * via `new Function()` in the component's context.
 *
 * **Module script** (`<script type="module" src="./component.js">`):
 * The module is dynamically imported via `import()`. The module is expected
 * to call `PseudoKit.register(import.meta)` on load — self-registration.
 * def.script is set to null (no inline evaluation needed).
 *
 * @param {import('./shared/registry-shared.js').ComponentDefinition} def
 * @returns {Promise<void>}
 * @throws {Error} If the fetch fails or the module import fails.
 *
 * @example
 * // components/chat-bubble.html
 * // <script type="module" src="./chat-bubble.js"></script>
 *
 * // components/chat-bubble.js
 * // import PseudoKit from '../pseudo-kit-client.js';
 * // PseudoKit.register(import.meta); // ← self-registration
 */
async function _loadComponent(def) {
  const res = await fetch(def.src);

  if (!res.ok) {
    throw new Error(`[pseudo-kit] Failed to load "${def.name}" from "${def.src}" (${res.status})`);
  }

  const html = await res.text();

  // Extract script block from raw HTML before DOMParser parsing.
  // Some environments (e.g. happy-dom in tests) remove or execute inline scripts
  // during DOMParser.parseFromString, clearing their textContent.
  const rawScriptMatch = html.match(/<script([^>]*)>([\s\S]*?)<\/script>/i);
  const rawScriptAttrs = rawScriptMatch?.[1] ?? '';
  const rawScriptText  = rawScriptMatch?.[2]?.trim() ?? null;

  const doc     = new DOMParser().parseFromString(html, 'text/html');
  const tpl     = doc.querySelector('template');
  const styleEl = doc.querySelector('style');

  def.template = tpl
    ? document.importNode(tpl.content, true)
    : document.createDocumentFragment();

  // HAPPY-DOM-01: some environments (happy-dom) nest <script>/<style> inside
  // tpl.content after importNode. Strip them so they don't end up in the DOM
  // when the template is stamped — scripts are handled via rawScriptText,
  // styles are handled via def.style below.
  def.template.querySelectorAll('script, style').forEach(el => el.remove());

  def.style = styleEl?.textContent ?? null;

  if (rawScriptMatch) {
    const isModule = /type\s*=\s*["']module["']/i.test(rawScriptAttrs);
    const srcMatch = rawScriptAttrs.match(/src\s*=\s*["']([^"']+)["']/i);
    const moduleSrc = srcMatch?.[1] ?? null;

    if (isModule && moduleSrc) {
      // Module script: fire-and-forget dynamic import.
      // The module self-registers via PseudoKit.register(import.meta) on load.
      // We do NOT await so component loading is not blocked by the import.
      try {
        const base = new URL(def.src, globalThis.location?.href ?? 'http://localhost/').href;
        const moduleUrl = new URL(moduleSrc, base).href;
        import(moduleUrl).catch(err =>
          console.error(`[pseudo-kit] Failed to import module for "${def.name}":`, err)
        );
      } catch (err) {
        console.error(`[pseudo-kit] Failed to import module for "${def.name}":`, err);
      }
      def.script = null; // no inline evaluation needed
    } else {
      // Inline script: stored for later evaluation via _evalScript / new Function()
      def.script = rawScriptText;
    }
  } else {
    def.script = null;
  }

  def.loaded = true;
}

/**
 * Creates a slot wrapper element with display:contents.
 * The wrapper is invisible to layout but carries slot metadata in the DOM
 * for debugging, tooling, and CSS targeting.
 *
 * Attributes on the wrapper:
 *  - data-slot-component : tag name of the parent component (e.g. "chat-bubble")
 *  - data-slot-name      : slot name if the <slot> has a name attribute, else "default"
 *  - data-slot-props     : JSON-serialized data-* declared on the slot (if any)
 *
 * @param {string} componentName  - Tag name of the parent component.
 * @param {string} slotName       - Name of the slot ("default" if unnamed).
 * @param {Object} slotData       - data-* attributes declared on the slot.
 * @returns {HTMLElement} A <pk-slot> element with display:contents.
 */
function _createSlotWrapper(componentName, slotName, slotData) {
  const wrapper = document.createElement('pk-slot');
  wrapper.setAttribute('data-slot-component', componentName);
  wrapper.setAttribute('data-slot-name', slotName);

  if (Object.keys(slotData).length > 0) {
    wrapper.setAttribute('data-slot-props', JSON.stringify(slotData));
  }

  wrapper.style.display = 'contents';
  return wrapper;
}

/**
 * Extracts data-* attributes declared on a slot element.
 *
 * @param {Element} slot
 * @returns {Object.<string, string>}
 */
function _slotData(slot) {
  const data = {};
  for (const attr of slot.attributes) {
    if (attr.name.startsWith('data-')) {
      data[attr.name] = attr.value;
    }
  }
  return data;
}

/**
 * Forwards slot data-* attributes to an injected element child.
 * Only applies to Element nodes. Existing attributes on the child are preserved.
 *
 * @param {Node}               node     - The child node to enrich.
 * @param {Object.<string,string>} slotData - data-* to forward.
 */
function _forwardSlotData(node, slotData) {
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  for (const [key, val] of Object.entries(slotData)) {
    if (!/** @type {Element} */ (node).hasAttribute(key)) {
      /** @type {Element} */ (node).setAttribute(key, val);
    }
  }
}

/**
 * Stamps a component's <template> into the target element.
 *
 * Supports named and default slots:
 *  - Named slots: `<slot name="header" />` receives children with `slot="header"`.
 *  - Default slot: `<slot />` (no name) receives all remaining unassigned children.
 *  - Each slot is replaced by a `<pk-slot display:contents>` wrapper with metadata.
 *  - Slot data-* attributes are forwarded to injected element children.
 *
 * @param {Element}                                                    el
 * @param {import('./shared/registry-shared.js').ComponentDefinition}  def
 *
 * @example
 * // template with named slots:
 * // <toolbar>
 * //   <slot name="start" />
 * //   <spacer />
 * //   <slot name="end" />
 * // </toolbar>
 *
 * // instance:
 * // <toolbar>
 * //   <text slot="start" label="Project" />
 * //   <button slot="end" action="settings" />
 * // </toolbar>
 */
function _stampTemplate(el, def) {
  const fragment         = def.template.cloneNode(true);
  const originalChildren = [...el.childNodes];

  // Separate named children (slot="x") from default children (no slot attr)
  const namedChildren  = {};
  const defaultChildren = [];

  for (const node of originalChildren) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const slotAttr = /** @type {Element} */ (node).getAttribute('slot');
      if (slotAttr) {
        if (!namedChildren[slotAttr]) namedChildren[slotAttr] = [];
        namedChildren[slotAttr].push(node);
      } else {
        defaultChildren.push(node);
      }
    } else {
      defaultChildren.push(node); // text nodes go to default slot
    }
  }

  // Process all slots in the template
  const slots = [...fragment.querySelectorAll('slot')];

  for (const slot of slots) {
    const slotName = slot.getAttribute('name') ?? 'default';
    const data     = _slotData(slot);
    const wrapper  = _createSlotWrapper(def.name, slotName, data);

    const children = slotName === 'default'
      ? defaultChildren
      : (namedChildren[slotName] ?? []);

    for (const node of children) {
      const clone = node.cloneNode(true);
      _forwardSlotData(clone, data);
      wrapper.appendChild(clone);
    }

    slot.replaceWith(wrapper);
  }

  el.innerHTML = '';
  el.appendChild(fragment);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCRIPT EVALUATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evaluates a component's <script> block in a sandboxed function scope.
 * The component element is available as both `this` and `el`.
 *
 * Injected globals available in the script:
 *  - `el`         : the component element
 *  - `state`      : the global PseudoKit state proxy
 *  - `emit`       : CustomEvent helper
 *  - `renderLoop` : loop rendering helper
 *  - `register`   : register_shared (for auto-registration)
 *
 * @param {Element}                                                    el
 * @param {import('./shared/registry-shared.js').ComponentDefinition}  def
 */
function _evalScript(el, def) {
  if (!def.script) return;

  try {
    const fn = new Function('el', 'state', 'emit', 'renderLoop', 'register', def.script);
    fn.call(el, el, PseudoKit.state, emit, renderLoop, register_shared);
  } catch (err) {
    console.error(`[pseudo-kit] Script error in "${def.name}":`, err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOOP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Marks loop="" children as pending templates.
 * Actual rendering is deferred to {@link renderLoop} once data is available.
 *
 * @param {Element} el
 */
function _markLoops(el) {
  el.querySelectorAll('[loop]').forEach(loopEl => {
    loopEl.dataset.pkLoopTemplate = 'true';
  });
}

/**
 * Renders a loop="" template with a data array.
 * Replaces the template element with cloned instances, one per item.
 * Each clone receives item fields as data-* attributes.
 * Newly created elements are resolved as pseudo-kit components if registered.
 *
 * @param {string}   containerId - id of the container holding the loop="" child.
 * @param {Object[]} data        - Array of data objects. Keys become data-* attributes.
 * @returns {void}
 *
 * @example
 * PseudoKit.renderLoop('coherence-alerts', [
 *   { entity: 'Aria', discrepancy_type: 'location', confidence: 0.9 },
 *   { entity: 'Bram', discrepancy_type: 'timeline',  confidence: 0.5 },
 * ]);
 */
function renderLoop(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`[pseudo-kit] renderLoop: #${containerId} not found`);
    return;
  }

  const template = container.querySelector('[loop], [data-pk-loop-template]');
  if (!template) {
    console.warn(`[pseudo-kit] renderLoop: no loop="" element in #${containerId}`);
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const item of data) {
    const clone = template.cloneNode(true);
    clone.removeAttribute('loop');
    delete clone.dataset.pkLoopTemplate;
    delete clone.dataset.pkResolved;

    for (const [key, value] of Object.entries(item)) {
      clone.dataset[key] = value;
    }

    fragment.appendChild(clone);
  }

  template.replaceWith(fragment);
  _resolveTree(container);
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dispatches a CustomEvent from a component element.
 * Matches `on="eventName:payloadType"` declarations in pseudo-HTML.
 * Events bubble and are composed (cross shadow DOM boundaries if needed).
 *
 * @param {Element} el      - The element to dispatch from.
 * @param {string}  name    - Event name (e.g. "accept", "reject").
 * @param {*}       [detail] - Optional payload, passed as event.detail.
 *
 * @example
 * emit(el, 'accept', { id: '42' });
 * // parent: el.addEventListener('accept', e => console.log(e.detail.id))
 */
function emit(el, name, detail = null) {
  el.dispatchEvent(new CustomEvent(name, {
    bubbles:  true,
    composed: true,
    detail,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a reactive state proxy backed by data-* attributes on :root.
 * CSS reads state via :root[data-focus-mode] or :root:has([data-ai-running]).
 * Writing a key updates the corresponding attribute. Falsy values remove it.
 *
 * camelCase keys are converted to kebab-case attributes:
 *   focusMode → data-focus-mode
 *   aiRunning → data-ai-running
 *
 * Initial state is hydrated from <script id="pk-state" type="application/json">
 * if present in the document (SSR path), otherwise DEFAULT_STATE is used.
 *
 * @returns {Object} Reactive state proxy.
 *
 * @example
 * PseudoKit.state.focusMode = true;
 * // :root gets attribute data-focus-mode=""
 * // CSS: :root[data-focus-mode] panel#ai-panel { display: none; }
 *
 * PseudoKit.state.focusMode = false;
 * // attribute removed from :root
 */
function _createState() {
  // Hydrate from SSR tag if present, otherwise use defaults
  const initial = deserializeFromTag_shared();

  /**
   * Converts a camelCase key to a kebab-case data attribute name.
   * @param {string} key
   * @returns {string}
   */
  function _toAttr(key) {
    return 'data-' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  // Apply initial state to :root immediately
  for (const [key, value] of Object.entries(initial)) {
    const attr = _toAttr(key);
    if (value && value !== false) {
      document.documentElement.setAttribute(attr, value === true ? '' : String(value));
    }
  }

  return new Proxy({ ...initial }, {
    set(target, key, value) {
      target[key] = value;
      const attr = _toAttr(String(key));

      if (!value) {
        document.documentElement.removeAttribute(attr);
      } else {
        document.documentElement.setAttribute(attr, value === true ? '' : String(value));
      }
      return true;
    },
    get(target, key) {
      return target[key];
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @namespace PseudoKit
 * @description Public client API for the pseudo-kit runtime.
 */
const PseudoKit = {

  /**
   * Global reactive state proxy.
   * Keys match [spec:state-refs] from the layout file.
   * Writing a value updates a data-* attribute on :root for CSS :has() to consume.
   *
   * @type {Object}
   *
   * @example
   * PseudoKit.state.focusMode = true;
   * PseudoKit.state.activeTab = 'tab-coherence';
   */
  state: _createState(),

  /**
   * Registers a component — manual or auto (import.meta).
   * Delegates to {@link register_shared}.
   *
   * @param {import('./shared/registry-shared.js').ImportMeta|import('./shared/registry-shared.js').ManualRegistration} input
   * @returns {typeof PseudoKit} For chaining.
   *
   * @example
   * // Manual chaining
   * PseudoKit
   *   .register({ name: 'panel',       src: 'components/panel.html' })
   *   .register({ name: 'chat-bubble', src: 'components/chat-bubble.html' })
   *   .init();
   *
   * // Auto (from inside the component file)
   * PseudoKit.register(import.meta);
   */
  register(input) {
    register_shared(input);
    return this;
  },

  /**
   * Starts the pseudo-kit runtime.
   * Begins DOM observation and resolves all components already in the DOM.
   *
   * @param {Element} [root=document.body] - Root element to observe.
   * @returns {MutationObserver} The active observer.
   *
   * @example
   * PseudoKit.init();
   * PseudoKit.init(document.getElementById('app-root'));
   */
  init(root = document.body) {
    return _observe(root);
  },

  /**
   * Renders a loop="" template with a data array.
   * @type {typeof renderLoop}
   */
  renderLoop,

  /**
   * Dispatches a CustomEvent from a component element.
   * @type {typeof emit}
   */
  emit,

};

export default PseudoKit;
