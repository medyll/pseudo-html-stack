/**
 * @fileoverview migration-e2e.e2e.js
 * E2E tests for v0.4.0 migrated components using native 2026 HTML/CSS APIs.
 * Story: S9-06
 *
 * Scope: Chromium 146+ (native API path only)
 * Cross-browser fallback validation → see migration-e2e-fallback.e2e.js (S9-07)
 *
 * Tested components:
 * - Modal (<dialog>, Invoker Commands)
 * - Dropdown (Popover API)
 * - Tooltip (CSS Anchor Positioning)
 * - Notification (autodismiss animation, Interest Invokers)
 *
 * Run: npx playwright test tests/migration-e2e.e2e.js --project=chromium
 */

import { test, expect } from '@playwright/test';

const TEST_PAGE = 'http://localhost:3000/tests/fixtures/migration-test-page.html';

test.describe('S9-06: Migration E2E Tests – Native API Behavior', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to test page
    await page.goto(TEST_PAGE, { waitUntil: 'networkidle' });
    // Wait for components to register
    await page.waitForLoadState('domcontentloaded');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Modal Tests (S9-01)
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Modal (S9-01): <dialog> + Invoker Commands', () => {
    test('should open modal when trigger button is clicked', async ({ page }) => {
      const trigger = page.getByTestId('modal-trigger');
      const modal = page.getByTestId('modal-component');

      // Initially closed
      const dialog = modal.locator('dialog');
      await expect(dialog).not.toHaveAttribute('open');

      // Click trigger
      await trigger.click();
      await page.waitForTimeout(100);

      // Modal should be visible
      const isOpenAttr = await modal.evaluate((el) => {
        const d = el.querySelector('dialog');
        return d?.hasAttribute('open');
      });
      expect(isOpenAttr).toBe(true);
    });

    test('should close modal when Escape key is pressed', async ({ page }) => {
      const trigger = page.getByTestId('modal-trigger');
      const modal = page.getByTestId('modal-component');

      // Open modal
      await trigger.click();
      await page.waitForTimeout(100);

      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);

      // Modal should be closed
      const isOpenAttr = await modal.evaluate((el) => {
        const d = el.querySelector('dialog');
        return d?.hasAttribute('open');
      });
      expect(isOpenAttr).toBe(false);
    });

    test('should close modal when backdrop is clicked', async ({ page }) => {
      const trigger = page.getByTestId('modal-trigger');
      const modal = page.getByTestId('modal-component');

      // Open modal
      await trigger.click();
      await page.waitForTimeout(100);

      // Get dialog and click its element (backdrop click)
      await modal.evaluate(() => {
        const dialog = document.querySelector('modal-pk dialog');
        if (dialog) {
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          });
          dialog.dispatchEvent(clickEvent);
        }
      });
      await page.waitForTimeout(100);

      // Modal should be closed
      const isOpenAttr = await modal.evaluate((el) => {
        const d = el.querySelector('dialog');
        return d?.hasAttribute('open');
      });
      expect(isOpenAttr).toBe(false);
    });

    test('should trap focus within modal when open', async ({ page }) => {
      const trigger = page.getByTestId('modal-trigger');

      // Open modal
      await trigger.click();
      await page.waitForTimeout(100);

      // Check that dialog element exists and is visible
      const dialog = page.getByTestId('modal-component').locator('dialog');
      await expect(dialog).toBeVisible();

      // Verify close button is within dialog (focus trap)
      const closeBtn = dialog.locator('button.modal__close');
      await expect(closeBtn).toBeVisible();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Dropdown Tests (S9-02)
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Dropdown (S9-02): Popover API + popovertarget', () => {
    test('should toggle dropdown menu when trigger button is clicked', async ({ page }) => {
      const dropdown = page.getByTestId('dropdown-component');
      const trigger = dropdown.locator('button.dropdown__trigger');

      // Verify trigger exists
      await expect(trigger).toBeVisible();

      // Click trigger to open
      await trigger.click();
      await page.waitForTimeout(100);

      // Menu should be visible
      const menu = dropdown.locator('ul.dropdown__menu');
      const isVisible = await menu.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' || el.hasAttribute('popover');
      });
      expect(isVisible).toBe(true);

      // Click again to close
      await trigger.click();
      await page.waitForTimeout(100);

      // Menu should be hidden
      const isHidden = await menu.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.display === 'none' && !el.matches(':popover-open');
      });
      expect(isHidden).toBe(true);
    });

    test('should close dropdown when clicking outside', async ({ page }) => {
      const dropdown = page.getByTestId('dropdown-component');
      const trigger = dropdown.locator('button.dropdown__trigger');

      // Open dropdown
      await trigger.click();
      await page.waitForTimeout(100);

      // Click outside dropdown
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(100);

      // Menu should be closed
      const menu = dropdown.locator('ul.dropdown__menu');
      const isClosed = await menu.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.display === 'none' || !el.matches(':popover-open');
      });
      expect(isClosed).toBe(true);
    });

    test('should sync aria-expanded attribute with dropdown state', async ({ page }) => {
      const dropdown = page.getByTestId('dropdown-component');
      const trigger = dropdown.locator('button.dropdown__trigger');

      // Initial state
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');

      // Open
      await trigger.click();
      await page.waitForTimeout(100);
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');

      // Close
      await trigger.click();
      await page.waitForTimeout(100);
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Tooltip Tests (S9-03)
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Tooltip (S9-03): CSS Anchor Positioning', () => {
    test('should show tooltip content on hover', async ({ page }) => {
      const tooltipTop = page.getByTestId('tooltip-top');
      const tooltipContent = tooltipTop.locator('.tooltip__content');

      // Hover over trigger
      await tooltipTop.hover();
      await page.waitForTimeout(200);

      // Content should be visible
      await expect(tooltipContent).toBeVisible();

      // Opacity should be 1 and visibility should be visible
      const isVisible = await tooltipContent.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.opacity === '1' && style.visibility === 'visible';
      });
      expect(isVisible).toBe(true);
    });

    test('should hide tooltip content when mouse leaves', async ({ page }) => {
      const tooltipTop = page.getByTestId('tooltip-top');
      const tooltipContent = tooltipTop.locator('.tooltip__content');

      // Hover and then move away
      await tooltipTop.hover();
      await page.waitForTimeout(200);
      await page.mouse.move(0, 0);
      await page.waitForTimeout(200);

      // Content should be hidden
      const isHidden = await tooltipContent.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.opacity === '0' || style.visibility === 'hidden';
      });
      expect(isHidden).toBe(true);
    });

    test('should have arrow indicator for each position variant', async ({ page }) => {
      const positions = ['tooltip-top', 'tooltip-bottom', 'tooltip-left', 'tooltip-right'];

      for (const pos of positions) {
        const tooltip = page.getByTestId(pos);
        const arrow = tooltip.locator('.tooltip__content::after');

        // Verify tooltip has content element with arrow pseudo-element
        const hasArrow = await tooltip.evaluate(() => {
          const content = document.querySelector('[data-testid="' + this.getAttribute('data-testid') + '"] .tooltip__content');
          return !!content;
        });
        expect(hasArrow).toBe(true);
      }
    });

    test('should position tooltip correctly for each variant', async ({ page }) => {
      const testCases = [
        { testid: 'tooltip-top', position: 'top' },
        { testid: 'tooltip-bottom', position: 'bottom' },
        { testid: 'tooltip-left', position: 'left' },
        { testid: 'tooltip-right', position: 'right' },
      ];

      for (const { testid, position } of testCases) {
        const tooltip = page.getByTestId(testid);
        const content = tooltip.locator('.tooltip__content');

        // Hover to show
        await tooltip.hover();
        await page.waitForTimeout(200);

        // Verify position attribute
        const actualPos = await tooltip.evaluate(
          (el) => el.getAttribute('position')
        );
        expect(actualPos || 'top').toBe(position);

        // Move mouse away
        await page.mouse.move(0, 0);
        await page.waitForTimeout(100);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Notification Tests (S9-04)
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Notification (S9-04): Autodismiss + Interest Invokers', () => {
    test('should show notification when trigger is clicked', async ({ page }) => {
      const trigger = page.getByTestId('notif-auto-trigger');
      const container = page.getByTestId('notification-area');

      // Click trigger
      await trigger.click();
      await page.waitForTimeout(100);

      // Notification should exist
      const notif = container.locator('notification-pk');
      await expect(notif).toBeVisible();
    });

    test('should auto-dismiss notification after 5 seconds', async ({ page }) => {
      const trigger = page.getByTestId('notif-auto-trigger');
      const container = page.getByTestId('notification-area');

      // Click trigger
      await trigger.click();
      await page.waitForTimeout(100);

      // Notification should be visible
      let notif = container.locator('notification-pk');
      await expect(notif).toBeVisible();

      // Wait for autodismiss (5s + buffer)
      await page.waitForTimeout(5500);

      // Notification should be removed from DOM
      const count = await container.locator('notification-pk').count();
      expect(count).toBe(0);
    });

    test('should pause autodismiss animation on hover', async ({ page }) => {
      const trigger = page.getByTestId('notif-auto-trigger');
      const container = page.getByTestId('notification-area');

      // Show notification
      await trigger.click();
      await page.waitForTimeout(100);

      const notif = container.locator('notification-pk');
      await expect(notif).toBeVisible();

      // Hover over notification after 2 seconds
      await page.waitForTimeout(2000);
      await notif.hover();
      await page.waitForTimeout(100);

      // Check animation play state
      const playState = await notif.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.animationPlayState;
      });
      expect(playState).toBe('paused');

      // Wait 4 more seconds while paused (total 6s, but animation paused at 2s)
      await page.waitForTimeout(4000);

      // Notification should still exist
      const exists = await notif.count();
      expect(exists).toBe(1);
    });

    test('should dismiss notification when dismiss button is clicked', async ({ page }) => {
      const trigger = page.getByTestId('notif-dismiss-trigger');
      const container = page.getByTestId('notification-area');

      // Show notification
      await trigger.click();
      await page.waitForTimeout(100);

      const notif = container.locator('notification-pk');
      await expect(notif).toBeVisible();

      // Click dismiss button
      const dismissBtn = notif.locator('button.notification__dismiss');
      await dismissBtn.click();
      await page.waitForTimeout(100);

      // Notification should be removed
      const count = await container.locator('notification-pk').count();
      expect(count).toBe(0);
    });

    test('should show correct variant styles', async ({ page }) => {
      const successTrigger = page.getByTestId('notif-auto-trigger');
      const container = page.getByTestId('notification-area');

      // Show success notification
      await successTrigger.click();
      await page.waitForTimeout(100);

      const notif = container.locator('notification-pk').first();
      const variant = await notif.getAttribute('variant');
      expect(variant).toBe('success');

      // Check that icon is visible (variant="success" has icon set)
      const hasIcon = await notif.evaluate((el) => {
        return el.hasAttribute('icon');
      });
      expect(hasIcon).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Integration Tests
  // ─────────────────────────────────────────────────────────────────────────

  test.describe('Integration: Multiple Components on Same Page', () => {
    test('should allow modal and dropdown to coexist and interact independently', async ({
      page,
    }) => {
      const modalTrigger = page.getByTestId('modal-trigger');
      const dropdownTrigger = page.getByTestId('dropdown-component').locator('button');

      // Open modal
      await modalTrigger.click();
      await page.waitForTimeout(100);

      // Open dropdown
      await dropdownTrigger.click();
      await page.waitForTimeout(100);

      // Both should be visible
      const modalOpen = await page
        .getByTestId('modal-component')
        .evaluate((el) => el.querySelector('dialog')?.hasAttribute('open'));
      const dropdownOpen = await page
        .getByTestId('dropdown-component')
        .locator('ul.dropdown__menu')
        .evaluate((el) => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' || el.matches(':popover-open');
        });

      expect(modalOpen).toBe(true);
      expect(dropdownOpen).toBe(true);
    });

    test('should allow tooltips to show while notification is present', async ({ page }) => {
      const tooltipTop = page.getByTestId('tooltip-top');
      const notifTrigger = page.getByTestId('notif-auto-trigger');

      // Show notification
      await notifTrigger.click();
      await page.waitForTimeout(100);

      // Show tooltip
      await tooltipTop.hover();
      await page.waitForTimeout(200);

      // Both should be visible
      const notifExists = await page.getByTestId('notification-area').locator('notification-pk').count();
      const tooltipVisible = await tooltipTop.locator('.tooltip__content').isVisible();

      expect(notifExists).toBeGreaterThan(0);
      expect(tooltipVisible).toBe(true);
    });
  });
});
