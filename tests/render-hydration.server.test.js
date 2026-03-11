import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import PseudoKitServer from '../src/server/pseudo-kit-server.js';
import { reset_shared } from '../src/shared/registry-shared.js';

const TMP = join(tmpdir(), 'pseudo-kit-render-hydration');

before(async () => {
  await mkdir(TMP, { recursive: true });
});

after(async () => {
  await rm(TMP, { recursive: true, force: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// Hydration marker
// ─────────────────────────────────────────────────────────────────────────────
describe('renderComponent hydration marker', () => {
  before(() => reset_shared());

  it('adds data-pk-hydrated="true" when component has a template', async () => {
    const name = 'thyd-template';
    const file = join(TMP, `${name}.html`);
    await writeFile(file, `<template>\n  <div class="x"><slot/></div>\n</template>\n`);

    PseudoKitServer.register({ name, src: file });
    const html = await PseudoKitServer.renderComponent(name, {}, '<span>hi</span>', TMP);
    assert.ok(html.includes('data-pk-hydrated="true"'), 'rendered HTML should include hydrated marker');
  });

  it('does not add data-pk-hydrated when component has no template', async () => {
    const name = 'thyd-no-template';
    const file = join(TMP, `${name}.html`);
    await writeFile(file, `<style>@scope (bare) { :scope {} }</style>`);

    PseudoKitServer.register({ name, src: file });
    const html = await PseudoKitServer.renderComponent(name, {}, '', TMP);
    assert.ok(!html.includes('data-pk-hydrated="true"'), 'rendered HTML should NOT include hydrated marker');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Slot injection and pk-slot wrapper
// ─────────────────────────────────────────────────────────────────────────────
describe('renderComponent slot injection', () => {
  before(() => reset_shared());

  it('wraps slot content in <pk-slot> with correct metadata', async () => {
    const name = 'thyd-slot';
    const file = join(TMP, `${name}.html`);
    await writeFile(file, `<template><div><slot/></div></template>`);

    PseudoKitServer.register({ name, src: file });
    const html = await PseudoKitServer.renderComponent(name, {}, '<p>content</p>', TMP);
    assert.ok(html.includes('<pk-slot'), 'output should contain pk-slot wrapper');
    assert.ok(html.includes(`data-slot-component="${name}"`), 'pk-slot should carry component name');
    assert.ok(html.includes('data-slot-name="default"'), 'pk-slot should carry slot name "default"');
    assert.ok(html.includes('<p>content</p>'), 'slot content should be preserved');
  });

  it('uses named slot name when slot has name attribute', async () => {
    const name = 'thyd-named-slot';
    const file = join(TMP, `${name}.html`);
    await writeFile(file, `<template><nav><slot name="items"></slot></nav></template>`);

    PseudoKitServer.register({ name, src: file });
    const html = await PseudoKitServer.renderComponent(name, {}, '<li>item</li>', TMP);
    assert.ok(html.includes('data-slot-name="items"'), 'pk-slot should reflect the named slot');
  });

  it('forwards slot data-* attributes to top-level children', async () => {
    const name = 'thyd-slot-data';
    const file = join(TMP, `${name}.html`);
    await writeFile(file, `<template><ul><slot data-role="option"/></ul></template>`);

    PseudoKitServer.register({ name, src: file });
    const html = await PseudoKitServer.renderComponent(name, {}, '<li>A</li><li>B</li>', TMP);
    // Both <li> elements should receive data-role="option"
    const matches = html.match(/data-role="option"/g);
    assert.ok(matches && matches.length >= 2, 'slot data-* should be forwarded to each top-level child');
  });

  it('does not duplicate slot data-* if child already has the attribute', async () => {
    const name = 'thyd-slot-no-dup';
    const file = join(TMP, `${name}.html`);
    await writeFile(file, `<template><ul><slot data-role="option"/></ul></template>`);

    PseudoKitServer.register({ name, src: file });
    const html = await PseudoKitServer.renderComponent(name, {}, '<li data-role="custom">A</li>', TMP);
    assert.ok(!html.includes('data-role="option"'), 'should not overwrite existing attribute on child');
    assert.ok(html.includes('data-role="custom"'), 'child-provided attribute should be preserved');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Props serialization
// ─────────────────────────────────────────────────────────────────────────────
describe('renderComponent props', () => {
  before(() => reset_shared());

  it('applies string props as HTML attributes on host tag', async () => {
    const name = 'thyd-props-str';
    const file = join(TMP, `${name}.html`);
    await writeFile(file, `<template><span><slot/></span></template>`);

    PseudoKitServer.register({ name, src: file });
    const html = await PseudoKitServer.renderComponent(name, { variant: 'info', label: 'hello' }, '', TMP);
    assert.ok(html.startsWith(`<${name} variant="info" label="hello"`), 'string props should appear on host tag');
  });

  it('applies boolean props as bare attributes', async () => {
    const name = 'thyd-props-bool';
    const file = join(TMP, `${name}.html`);
    await writeFile(file, `<template><button><slot/></button></template>`);

    PseudoKitServer.register({ name, src: file });
    const html = await PseudoKitServer.renderComponent(name, { disabled: true }, '', TMP);
    assert.ok(html.includes(' disabled'), 'boolean true prop should render as bare attribute');
    assert.ok(!html.includes('disabled="true"'), 'boolean true should not render as string "true"');
  });

  it('escapes quotes in prop values', async () => {
    const name = 'thyd-props-escape';
    const file = join(TMP, `${name}.html`);
    await writeFile(file, `<template><div><slot/></div></template>`);

    PseudoKitServer.register({ name, src: file });
    const html = await PseudoKitServer.renderComponent(name, { label: 'say "hi"' }, '', TMP);
    assert.ok(html.includes('label="say &quot;hi&quot;"'), 'double quotes in prop values should be escaped');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Script-in-template: server strips <script> from output (no server execution)
// ─────────────────────────────────────────────────────────────────────────────
describe('renderComponent script handling', () => {
  before(() => reset_shared());

  it('does not include <script> block in server-rendered HTML', async () => {
    const name = 'thyd-script';
    const file = join(TMP, `${name}.html`);
    await writeFile(file, `<template><div class="x"><slot/></div></template>\n<script>\nel.setAttribute('data-js', 'true');\n</script>`);

    PseudoKitServer.register({ name, src: file });
    const html = await PseudoKitServer.renderComponent(name, {}, '<span>text</span>', TMP);
    assert.ok(!html.includes('<script>'), 'server output should not contain <script> block');
    assert.ok(!html.includes('data-js'), 'script should not execute server-side');
    assert.ok(html.includes('data-pk-hydrated="true"'), 'hydration marker still present');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Nested SSR: server can render component inside component children
// This simulates nested pk-slot wrapping — client _isSSRHydrated must detect
// the outer component as hydrated even when inner content has pk-slot.
// ─────────────────────────────────────────────────────────────────────────────
describe('renderComponent nested slot (SSR composition)', () => {
  before(() => reset_shared());

  it('preserves nested pk-slot when inner component is pre-rendered', async () => {
    const outer = 'thyd-outer';
    const inner = 'thyd-inner';

    await writeFile(join(TMP, `${outer}.html`), `<template><section><slot/></section></template>`);
    await writeFile(join(TMP, `${inner}.html`), `<template><span><slot/></span></template>`);

    PseudoKitServer.register({ name: outer, src: join(TMP, `${outer}.html`) });
    PseudoKitServer.register({ name: inner, src: join(TMP, `${inner}.html`) });

    // Render inner component first, then nest it inside outer
    const innerHtml = await PseudoKitServer.renderComponent(inner, {}, 'nested text', TMP);
    const outerHtml = await PseudoKitServer.renderComponent(outer, {}, innerHtml, TMP);

    assert.ok(outerHtml.includes(`data-pk-hydrated="true"`), 'outer should be marked hydrated');
    assert.ok(outerHtml.includes(inner), 'inner component tag should be preserved');
    assert.ok(outerHtml.includes('nested text'), 'nested text content should survive');

    // Both pk-slot wrappers should be present (one per component)
    const pkSlotCount = (outerHtml.match(/<pk-slot/g) || []).length;
    assert.strictEqual(pkSlotCount, 2, 'should have two pk-slot wrappers for nested components');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Loop elements: server preserves loop="" attribute; client processes them
// ─────────────────────────────────────────────────────────────────────────────
describe('renderComponent loop attribute preservation', () => {
  before(() => reset_shared());

  it('preserves loop="" attribute in children passed to slot', async () => {
    const name = 'thyd-loop';
    const file = join(TMP, `${name}.html`);
    await writeFile(file, `<template><ul><slot/></ul></template>`);

    PseudoKitServer.register({ name, src: file });
    const html = await PseudoKitServer.renderComponent(
      name, {}, '<li loop="">template item</li>', TMP
    );
    assert.ok(html.includes('loop=""'), 'loop attribute should survive server render for client processing');
  });
});
