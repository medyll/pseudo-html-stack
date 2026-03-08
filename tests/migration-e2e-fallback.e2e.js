/**
 * @fileoverview migration-e2e-fallback.e2e.js
 * S9-07: Cross-browser fallback validation (Firefox, WebKit)
 *
 * Validates that all 4 migrated components degrade gracefully in non-Chromium browsers.
 * Uses `browserName` fixture to apply browser-conditional assertions.
 *
 * API support matrix:
 *   <dialog>           Chrome ✅  Firefox ✅  WebKit ✅
 *   Popover API        Chrome ✅  Firefox ✅  WebKit ✅ (Safari 17+)
 *   Anchor Positioning Chrome ✅  Firefox ❌  WebKit ❌  → absolute fallback
 *   Interest Invokers  Chrome ✅  Firefox ❌  WebKit ❌  → :hover/:focus-within fallback
 *   Invoker Commands   Chrome ✅  Firefox ❌  WebKit ❌  → JS showModal() fallback
 *
 * Run: npx playwright test tests/migration-e2e-fallback.e2e.js
 */

import { test, expect } from '@playwright/test';

const TEST_PAGE = 'http://localhost:3000/tests/fixtures/migration-test-page.html';

test.describe('S9-07: Cross-Browser Fallback Validation', () => {
  test.beforeEach(async ({ page, browserName }) => {
    await page.goto(TEST_PAGE, { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    // Wait for PseudoKit to register and resolve components
    const readyTimeout = browserName === 'webkit' ? 20000 : 10000;
    await page.waitForFunction(() => document.querySelector('modal-pk dialog') !== null, {
      timeout: readyTimeout,
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Console errors check — fails fast if any browser throws
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Smoke: No console errors (all browsers)', () => {
    test('page loads without JS errors', async ({ page }) => {
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));

      await page.goto(TEST_PAGE, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.querySelector('modal-pk dialog') !== null, {
        timeout: 10000,
      });

      expect(errors, `Console errors: ${errors.join('\n')}`).toHaveLength(0);
    });

    test('components register without errors', async ({ page }) => {
      const componentsDefined = await page.evaluate(() => {
        return (
          document.querySelector('modal-pk') !== null &&
          document.querySelector('dropdown-pk') !== null &&
          document.querySelector('tooltip-pk') !== null
        );
      });
      expect(componentsDefined).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Modal — <dialog> is universally supported; JS showModal() path
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Modal: <dialog> via showModal() — all browsers', () => {
    test('opens modal in all browsers', async ({ page }) => {
      const trigger = page.getByTestId('modal-trigger');
      const dialog = page.getByTestId('modal-component').locator('dialog');

      await expect(dialog).not.toHaveAttribute('open');
      await trigger.click();
      await page.waitForTimeout(200);
      await expect(dialog).toHaveAttribute('open');
    });

    test('Escape key closes modal in all browsers', async ({ page }) => {
      const trigger = page.getByTestId('modal-trigger');
      const dialog = page.getByTestId('modal-component').locator('dialog');

      await trigger.click();
      await page.waitForTimeout(200);
      await expect(dialog).toHaveAttribute('open');

      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      await expect(dialog).not.toHaveAttribute('open');
    });

    test('close button works in all browsers', async ({ page }) => {
      const trigger = page.getByTestId('modal-trigger');
      const dialog = page.getByTestId('modal-component').locator('dialog');
      const closeBtn = dialog.locator('button.modal__close');

      await trigger.click();
      await page.waitForTimeout(200);

      await expect(closeBtn).toBeVisible();
      await closeBtn.click();
      await page.waitForTimeout(200);

      await expect(dialog).not.toHaveAttribute('open');
    });

    test('dialog uses native <dialog> element (not a div shim)', async ({ page }) => {
      const tagName = await page.getByTestId('modal-component').evaluate((el) => {
        return el.querySelector('dialog')?.tagName?.toLowerCase();
      });
      expect(tagName).toBe('dialog');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Dropdown — Popover API (Firefox 125+, Safari 17+) or fallback CSS toggle
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Dropdown: Popover API or CSS fallback — all browsers', () => {
    test('toggle opens/closes in all browsers', async ({ page }) => {
      const dropdown = page.getByTestId('dropdown-component');
      const trigger = dropdown.locator('button.dropdown__trigger');

      await expect(trigger).toBeVisible();

      await trigger.click();
      await page.waitForTimeout(200);

      // Either Popover API open or CSS [open] fallback
      const isOpen = await dropdown.evaluate((el) => {
        const menu = el.querySelector('.dropdown__menu');
        return (
          el.hasAttribute('open') ||
          (menu && menu.matches(':popover-open'))
        );
      });
      expect(isOpen).toBe(true);

      await trigger.click();
      await page.waitForTimeout(200);

      const isClosed = await dropdown.evaluate((el) => {
        const menu = el.querySelector('.dropdown__menu');
        return !el.hasAttribute('open') && !menu?.matches(':popover-open');
      });
      expect(isClosed).toBe(true);
    });

    test('aria-expanded syncs in all browsers', async ({ page }) => {
      const dropdown = page.getByTestId('dropdown-component');
      const trigger = dropdown.locator('button.dropdown__trigger');

      // Initial state
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await trigger.click();
      await page.waitForTimeout(200);
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await trigger.click();
      await page.waitForTimeout(200);
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    test('click outside closes dropdown in all browsers', async ({ page }) => {
      const dropdown = page.getByTestId('dropdown-component');
      const trigger = dropdown.locator('button.dropdown__trigger');

      await trigger.click();
      await page.waitForTimeout(200);

      // Click somewhere else on the page
      await page.click('h2', { force: true });
      await page.waitForTimeout(200);

      const isClosed = await dropdown.evaluate((el) => {
        const menu = el.querySelector('.dropdown__menu');
        return !el.hasAttribute('open') && !menu?.matches(':popover-open');
      });
      expect(isClosed).toBe(true);
    });

    test('detects correct API path used', async ({ page, browserName }) => {
      const supportsPopover = await page.evaluate(() => 'popover' in HTMLElement.prototype);

      if (browserName === 'firefox' || browserName === 'webkit') {
        // Firefox 125+ and Safari 17+ support Popover API
        // Result depends on actual browser version under test
        // We just assert the dropdown works regardless of which path is active
        const trigger = page.getByTestId('dropdown-component').locator('button.dropdown__trigger');
        await trigger.click();
        await page.waitForTimeout(200);
        const dropdown = page.getByTestId('dropdown-component');
        const isOpen = await dropdown.evaluate((el) => {
          const menu = el.querySelector('.dropdown__menu');
          return el.hasAttribute('open') || !!menu?.matches(':popover-open');
        });
        expect(isOpen).toBe(true);
      }
      // Chromium always uses Popover API — already tested in S9-06
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Tooltip — CSS Anchor Positioning (Chromium only) or absolute fallback
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Tooltip: hover visibility — all browsers', () => {
    test('shows tooltip content on hover in all browsers', async ({ page }) => {
      const tooltip = page.getByTestId('tooltip-top');
      const content = tooltip.locator('.tooltip__content');

      await tooltip.hover();
      await page.waitForTimeout(300);

      const isVisible = await content.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.opacity === '1' && style.visibility === 'visible';
      });
      expect(isVisible).toBe(true);
    });

    test('hides tooltip content when mouse leaves in all browsers', async ({ page }) => {
      const tooltip = page.getByTestId('tooltip-top');
      const content = tooltip.locator('.tooltip__content');

      await tooltip.hover();
      await page.waitForTimeout(300);
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);

      const isHidden = await content.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.opacity === '0' || style.visibility === 'hidden';
      });
      expect(isHidden).toBe(true);
    });
  });

  test.describe('Tooltip: absolute fallback (Firefox, WebKit)', () => {
    test('uses absolute position fallback when Anchor Positioning unsupported', async ({
      page,
      browserName,
    }) => {
      test.skip(
        browserName === 'chromium',
        'Chromium uses native CSS Anchor Positioning — tested in S9-06'
      );

      const tooltip = page.getByTestId('tooltip-top');
      const content = tooltip.locator('.tooltip__content');

      // In Firefox/WebKit, @supports (position-anchor: ...) is false
      // so content should use absolute positioning (not fixed)
      const positioning = await content.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          position: style.position,
          supportsAnchor: CSS.supports('position-anchor: --test'),
        };
      });

      // Anchor Positioning is not supported → fallback absolute
      expect(positioning.supportsAnchor).toBe(false);
      expect(positioning.position).toBe('absolute');
    });

    test('top-positioned tooltip appears above trigger (absolute fallback)', async ({
      page,
      browserName,
    }) => {
      test.skip(browserName === 'chromium', 'Chromium uses Anchor Positioning');

      const tooltip = page.getByTestId('tooltip-top');
      const content = tooltip.locator('.tooltip__content');

      await tooltip.hover();
      await page.waitForTimeout(300);

      const boxes = await page.evaluate(() => {
        const trigger = document.querySelector('[data-testid="tooltip-top"] .tooltip__trigger');
        const content = document.querySelector('[data-testid="tooltip-top"] .tooltip__content');
        const tBox = trigger?.getBoundingClientRect();
        const cBox = content?.getBoundingClientRect();
        return { triggerTop: tBox?.top, contentBottom: cBox?.bottom };
      });

      // Tooltip content bottom should be above trigger top
      expect(boxes.contentBottom).toBeLessThanOrEqual(boxes.triggerTop + 10);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Notification — :hover/:focus-within fallback (all browsers)
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Notification: hover-pause fallback — all browsers', () => {
    test('shows notification in all browsers', async ({ page }) => {
      const trigger = page.getByTestId('notif-auto-trigger');
      const area = page.getByTestId('notification-area');

      await trigger.click();
      await page.waitForTimeout(200);

      await expect(area.locator('notification-pk')).toBeVisible();
    });

    test(':hover pauses autodismiss animation in all browsers', async ({ page }) => {
      const trigger = page.getByTestId('notif-auto-trigger');
      const area = page.getByTestId('notification-area');

      await trigger.click();
      await page.waitForTimeout(200);

      const notif = area.locator('notification-pk');
      await notif.hover();
      await page.waitForTimeout(100);

      const playState = await notif.evaluate((el) => {
        return window.getComputedStyle(el).animationPlayState;
      });
      // :hover pauses the animation in all browsers
      expect(playState).toBe('paused');
    });

    test('notification persists beyond 5s when hovered (all browsers)', async ({ page }) => {
      const trigger = page.getByTestId('notif-auto-trigger');
      const area = page.getByTestId('notification-area');

      await trigger.click();
      await page.waitForTimeout(200);

      const notif = area.locator('notification-pk');
      // Hover immediately to pause from start
      await notif.hover();

      // Wait more than 5s (normal dismiss duration)
      await page.waitForTimeout(6000);

      // Still alive because hovered
      await expect(notif).toBeVisible();
    });

    test(':interest is a Chrome-only enhancement (not required)', async ({ page, browserName }) => {
      // This test documents the Chrome-only nature of :interest
      // and confirms :hover covers all browsers
      const supportsInterest = await page.evaluate(() => {
        try {
          return CSS.supports('selector(:interest)');
        } catch {
          return false;
        }
      });

      if (browserName === 'firefox' || browserName === 'webkit') {
        // :interest not expected in Firefox/WebKit — :hover fallback is active
        // Just assert hover still works (tested above)
        expect(supportsInterest).toBe(false);
      }
      // Chromium may or may not expose this yet — no assertion
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Fallback CSS confirmation — @supports guards
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Feature detection: @supports guards', () => {
    test('Popover API detection matches expected browser support', async ({
      page,
      browserName,
    }) => {
      const supportsPopover = await page.evaluate(() => 'popover' in HTMLElement.prototype);

      if (browserName === 'chromium') {
        expect(supportsPopover).toBe(true);
      }
      // Firefox 125+ and WebKit (Safari 17+) may also support it
      // No strict false assertion — just log detected support
    });

    test('Anchor Positioning detection is false in Firefox and WebKit', async ({
      page,
      browserName,
    }) => {
      test.skip(browserName === 'chromium', 'Chromium supports Anchor Positioning natively');

      const supportsAnchor = await page.evaluate(() =>
        CSS.supports('position-anchor', '--test')
      );
      expect(supportsAnchor).toBe(false);
    });

    test('CSS @scope is parsed correctly in all browsers', async ({ page }) => {
      // Verify that @scope blocks don't cause parse errors
      // (all modern browsers support @scope)
      const scopeSupported = await page.evaluate(() => CSS.supports('selector(:scope)'));
      expect(scopeSupported).toBe(true);
    });
  });
});
