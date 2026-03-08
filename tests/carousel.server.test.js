import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import PseudoKitServer from '../src/server/pseudo-kit-server.js';
import { reset_shared } from '../src/shared/registry-shared.js';

const TMP = join(tmpdir(), 'pseudo-kit-carousel');

before(() => reset_shared());

describe('carousel-pk server render', () => {
  it('renders host tag and preserves template content', async () => {
    const name = 'tcarousel-template';
    const file = join(TMP, `${name}.html`);
    const content = `\n<template>\n  <div class="carousel">\n    <slot></slot>\n  </div>\n</template>\n`;
    await writeFile(file, content, 'utf-8');

    PseudoKitServer.register({ name, src: file });
    const html = await PseudoKitServer.renderComponent(name, {}, '<div class="s">s1</div>', TMP);
    assert.ok(html.includes('<tcarousel-template'), 'should render host tag');
    assert.ok(html.includes('class="carousel"'), 'should include carousel markup');
  });
});
