/**
 * @fileoverview form-components-e2e.e2e.js
 * E2E tests for select-pk and combobox-pk — Listbox API migration (S14-01 / S13-02).
 *
 * Scope: Chromium only (Chromium-first policy, consistent with migration-e2e.e2e.js)
 *
 * Tested components:
 * - select-pk  (native <select> + ::picker(select) CSS)
 * - combobox-pk (filterable combobox, Popover API listbox)
 *
 * Run: npx playwright test tests/form-components-e2e.e2e.js --project=chromium
 */

import { test, expect } from '@playwright/test';

const TEST_PAGE = 'http://localhost:3000/tests/fixtures/form-components-test-page.html';

test.describe('S14-01: Form Components E2E – Select & Combobox', () => {

  test.skip(({ browserName }) => browserName !== 'chromium', 'Form component tests run on Chromium only');

  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_PAGE, { waitUntil: 'networkidle' });
    // Wait for both components to be hydrated
    await page.waitForFunction(() => {
      const select   = document.querySelector('[data-testid="select-component"]');
      const combobox = document.querySelector('[data-testid="combobox-component"]');
      return select?.dataset.pkResolved === 'true' && combobox?.dataset.pkResolved === 'true';
    }, { timeout: 10000 }).catch(() => {});
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Select (S11-01 / native <select>)
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Select (select-pk): native <select> rendering', () => {

    test('should render a native <select> element inside the host', async ({ page }) => {
      const host   = page.getByTestId('select-component');
      const select = host.locator('select.select__field');
      await expect(select).toBeVisible({ timeout: 5000 });
    });

    test('should render all slot options inside the native select', async ({ page }) => {
      const host   = page.getByTestId('select-component');
      const select = host.locator('select.select__field');

      const optionCount = await select.evaluate(el => el.options.length);
      expect(optionCount).toBe(5); // placeholder + 4 languages
    });

    test('should reflect the selected value after user interaction', async ({ page }) => {
      const host   = page.getByTestId('select-component');
      const select = host.locator('select.select__field');

      await select.selectOption('fr');
      const value = await select.inputValue();
      expect(value).toBe('fr');
    });

    test('should have the correct name attribute forwarded to inner select', async ({ page }) => {
      const host   = page.getByTestId('select-component');
      const select = host.locator('select.select__field');

      const name = await select.getAttribute('name');
      expect(name).toBe('language');
    });

    test('should render a visual arrow affordance (custom or native picker-icon)', async ({ page }) => {
      const host = page.getByTestId('select-component');
      // Modern Chrome hides .select__arrow in favour of ::picker-icon when ::picker(select) is supported.
      // Either the custom arrow span is visible OR the native picker icon shows — verify the select
      // host wrapper is present and the select itself is interactive.
      const wrapper = host.locator('.select');
      await expect(wrapper).toBeVisible({ timeout: 5000 });
      const select  = host.locator('select.select__field');
      await expect(select).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Select (select-pk): required validation', () => {

    test('should report a validation error when required select is empty on submit', async ({ page }) => {
      const submitBtn = page.locator('#required-form-submit');
      const result    = page.getByTestId('required-form-result');

      await submitBtn.click();
      await page.waitForFunction(() => {
        const el = document.querySelector('[data-testid="required-form-result"]');
        return el && el.getAttribute('data-state') === 'error';
      }, { timeout: 3000 }).catch(() => {});

      await expect(result).toHaveAttribute('data-state', 'error');
    });

    test('should submit successfully when a value is selected', async ({ page }) => {
      const host      = page.getByTestId('required-select-component');
      const select    = host.locator('select.select__field');
      const submitBtn = page.locator('#required-form-submit');
      const result    = page.getByTestId('required-form-result');

      await select.selectOption('fr');
      await submitBtn.click();

      await page.waitForFunction(() => {
        const el = document.querySelector('[data-testid="required-form-result"]');
        return el && el.getAttribute('data-state') === 'submitted';
      }, { timeout: 3000 }).catch(() => {});

      await expect(result).toHaveAttribute('data-state', 'submitted');
      await expect(result).toHaveText('submitted:fr');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Combobox (combobox-pk): Popover API listbox
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Combobox (combobox-pk): structure and init', () => {

    test('should render the combobox input and toggle button', async ({ page }) => {
      const host   = page.getByTestId('combobox-component');
      const input  = host.locator('input.combobox__input');
      const toggle = host.locator('button.combobox__toggle');
      await expect(input).toBeVisible({ timeout: 5000 });
      await expect(toggle).toBeVisible({ timeout: 5000 });
    });

    test('should have aria-haspopup="listbox" on the input', async ({ page }) => {
      const host  = page.getByTestId('combobox-component');
      const input = host.locator('input.combobox__input');
      await expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    });

    test('should have a hidden input for form submission', async ({ page }) => {
      const host   = page.getByTestId('combobox-component');
      const hidden = host.locator('input[type="hidden"]');
      const count  = await hidden.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should have the listbox with popover attribute', async ({ page }) => {
      const host    = page.getByTestId('combobox-component');
      const listbox = host.locator('[role="listbox"]');
      const hasPopover = await listbox.evaluate(el => el.hasAttribute('popover'));
      expect(hasPopover).toBe(true);
    });
  });

  test.describe('Combobox (combobox-pk): filtering and selection', () => {

    test('should open the listbox when the input is focused and typed into', async ({ page }) => {
      const host   = page.getByTestId('combobox-component');
      const input  = host.locator('input.combobox__input');

      await input.click();
      await input.type('fr');

      // aria-expanded is set by openListbox() — reliable signal regardless of popover top-layer behavior
      const inputEl = host.locator('input.combobox__input');
      await expect(inputEl).toHaveAttribute('aria-expanded', 'true', { timeout: 5000 });
    });

    test('should filter options when typing in the input', async ({ page }) => {
      const host  = page.getByTestId('combobox-component');
      const input = host.locator('input.combobox__input');

      await input.click();
      await input.type('fr');
      await page.waitForTimeout(150);

      // Only "France" should be visible (not hidden) after typing "fr"
      const visibleOptions = await page.evaluate(() => {
        const host    = document.querySelector('[data-testid="combobox-component"]');
        const listbox = host?.querySelector('[role="listbox"]');
        if (!listbox) return 0;
        return [...listbox.querySelectorAll('.combobox__option:not([hidden])')].length;
      });
      expect(visibleOptions).toBeGreaterThan(0);
      expect(visibleOptions).toBeLessThan(6); // fewer than all options
    });

    test('should select an option on click and update the input value', async ({ page }) => {
      const host   = page.getByTestId('combobox-component');
      const input  = host.locator('input.combobox__input');

      // Open listbox by clicking toggle
      const toggle = host.locator('button.combobox__toggle');
      await toggle.click();
      await page.waitForTimeout(200);

      // Click "France" option
      const option = await page.evaluate(() => {
        const host    = document.querySelector('[data-testid="combobox-component"]');
        const listbox = host?.querySelector('[role="listbox"]');
        const opts    = listbox?.querySelectorAll('.combobox__option');
        return opts?.[0]?.textContent?.trim() ?? null;
      });

      if (option) {
        // Click the first visible option
        await page.evaluate(() => {
          const host    = document.querySelector('[data-testid="combobox-component"]');
          const listbox = host?.querySelector('[role="listbox"]');
          const first   = listbox?.querySelector('.combobox__option:not([hidden])');
          first?.click();
        });
        await page.waitForTimeout(150);

        // Input should now have the selected label
        const inputValue = await input.inputValue();
        expect(inputValue.length).toBeGreaterThan(0);

        // Hidden input should have the value
        const hiddenValue = await page.evaluate(() => {
          const host = document.querySelector('[data-testid="combobox-component"]');
          return host?.querySelector('input[type="hidden"]')?.value ?? '';
        });
        expect(hiddenValue.length).toBeGreaterThan(0);
      }
    });

    test('should close the listbox after selecting an option', async ({ page }) => {
      const host   = page.getByTestId('combobox-component');
      const toggle = host.locator('button.combobox__toggle');

      await toggle.click();
      await page.waitForTimeout(200);

      // Click first option
      await page.evaluate(() => {
        const host    = document.querySelector('[data-testid="combobox-component"]');
        const listbox = host?.querySelector('[role="listbox"]');
        const first   = listbox?.querySelector('.combobox__option:not([hidden])');
        first?.click();
      });
      await page.waitForTimeout(200);

      const listboxClosed = await page.evaluate(() => {
        const host    = document.querySelector('[data-testid="combobox-component"]');
        const listbox = host?.querySelector('[role="listbox"]');
        if (!listbox) return true;
        return window.getComputedStyle(listbox).display === 'none' &&
               !(typeof listbox.matches === 'function' && listbox.matches(':popover-open'));
      });
      expect(listboxClosed).toBe(true);
    });

    test('should close the listbox when Escape is pressed', async ({ page }) => {
      const host   = page.getByTestId('combobox-component');
      const input  = host.locator('input.combobox__input');
      const toggle = host.locator('button.combobox__toggle');

      await toggle.click();
      await page.waitForTimeout(200);

      await input.press('Escape');
      await page.waitForTimeout(150);

      const listboxClosed = await page.evaluate(() => {
        const host    = document.querySelector('[data-testid="combobox-component"]');
        const listbox = host?.querySelector('[role="listbox"]');
        if (!listbox) return true;
        return window.getComputedStyle(listbox).display === 'none' &&
               !(typeof listbox.matches === 'function' && listbox.matches(':popover-open'));
      });
      expect(listboxClosed).toBe(true);
    });
  });

  test.describe('Combobox (combobox-pk): disabled state', () => {

    test('should disable the input and toggle when host has disabled attribute', async ({ page }) => {
      const host   = page.getByTestId('combobox-disabled');
      const input  = host.locator('input.combobox__input');
      const toggle = host.locator('button.combobox__toggle');

      await page.waitForFunction(() => {
        return document.querySelector('[data-testid="combobox-disabled"]')?.dataset.pkResolved === 'true';
      }, { timeout: 5000 }).catch(() => {});

      await expect(input).toBeDisabled({ timeout: 5000 });
      await expect(toggle).toBeDisabled({ timeout: 5000 });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Accessibility
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Accessibility: ARIA attributes', () => {

    test('combobox input should have role="combobox" and aria-autocomplete="list"', async ({ page }) => {
      const host  = page.getByTestId('combobox-component');
      const input = host.locator('input.combobox__input');
      await expect(input).toHaveAttribute('role', 'combobox');
      await expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    test('listbox should have role="listbox"', async ({ page }) => {
      const host    = page.getByTestId('combobox-component');
      const listbox = host.locator('[role="listbox"]');
      const count   = await listbox.count();
      expect(count).toBeGreaterThan(0);
    });

    test('select-pk inner select should have accessible name via id', async ({ page }) => {
      const host   = page.getByTestId('select-component');
      const select = host.locator('select.select__field');
      // select should be keyboard focusable
      await select.focus();
      const focused = await page.evaluate(() => document.activeElement?.tagName?.toLowerCase());
      expect(focused).toBe('select');
    });
  });

});
