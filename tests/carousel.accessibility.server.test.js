import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import PseudoKitServer from '../src/server/pseudo-kit-server.js';
import { reset_shared } from '../src/shared/registry-shared.js';

before(() => reset_shared());

describe('carousel-pk accessibility markup', () => {
  it('server-render includes aria-live announcer and pagination container', async () => {
    // Register the real carousel-pk from src/pseudo-assets
    PseudoKitServer.register({ name: 'carousel-pk', src: new URL('../src/pseudo-assets/components/molecules/carousel-pk.html', import.meta.url).pathname });
    const html = await PseudoKitServer.renderComponent('carousel-pk', {}, '<div class="s">s1</div><div class="s">s2</div>');
    assert.ok(html.includes('aria-live="polite"'), 'should include aria-live announcer');
    assert.ok(html.includes('carousel__pagination'), 'should include pagination container');
  });
});
