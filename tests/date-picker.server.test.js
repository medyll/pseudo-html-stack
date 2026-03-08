import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import PseudoKitServer from '../src/server/pseudo-kit-server.js';
import { reset_shared } from '../src/shared/registry-shared.js';

before(() => reset_shared());

describe('date-picker-pk server render', () => {
  it('renders an input[type=date] and popover container', async () => {
    PseudoKitServer.register({ name: 'date-picker-pk', src: new URL('../src/pseudo-assets/components/molecules/date-picker-pk.html', import.meta.url).pathname });
    const html = await PseudoKitServer.renderComponent('date-picker-pk', {}, '');
    assert.ok(html.includes('type="date"'), 'should include date input');
    assert.ok(html.includes('date-picker__popover'), 'should include popover container');
  });
});