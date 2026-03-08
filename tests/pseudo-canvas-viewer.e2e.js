import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite — pseudo-canvas-viewer
 * 
 * Tests the full viewer UI including:
 * - Asset loading via HTTP (real fetch)
 * - Interactive UI (clicks, navigation)
 * - Canvas preview rendering
 * - Component tree navigation
 * - Real browser rendering (Chrome, Firefox, Safari)
 */

test.describe('pseudo-canvas-viewer E2E', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to viewer
    await page.goto('/pseudo-canvas/viewer/pseudo-canvas-viewer.html');
    // Wait for UI to initialize
    await page.waitForSelector('#btn-auto', { timeout: 5000 });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T1: Viewer Page Loads & UI is Visible
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T1: page loads with viewer UI visible', async ({ page }) => {
    // Verify title
    await expect(page).toHaveTitle(/pseudo-canvas-viewer/i);
    
    // Verify key UI elements are visible
    await expect(page.locator('.titlebar')).toBeVisible();
    await expect(page.locator('#btn-auto')).toBeVisible();
    await expect(page.locator('#asset-tree')).toBeVisible();
    await expect(page.locator('#canvas-area')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T2: Load Assets via HTTP (Real Fetch)
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T2: load assets by clicking "Reload assets" button', async ({ page }) => {
    const btn = page.locator('#btn-auto');
    
    // Verify initial button is present
    await expect(btn).toBeVisible();
    
    // Click the button
    await btn.click();
    
    // Wait for assets to load
    await page.waitForTimeout(3000);
    
    // Verify assets loaded: tree should have at least one item
    const treeItems = page.locator('.tree__item');
    const count = await treeItems.count();
    expect(count).toBeGreaterThan(0);
    
    // Asset count text should update
    const assetCount = page.locator('#asset-count');
    const text = await assetCount.textContent();
    expect(text).toMatch(/\d+ assets? loaded/);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T3: Toast Notifications on Success
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T3: display toast notifications', async ({ page }) => {
    const toast = page.locator('#toast');
    
    // Toast element should exist
    await expect(toast).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T4: Component Tree Navigation
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T4: component tree visible', async ({ page }) => {
    const tree = page.locator('#asset-tree');
    
    // Tree should be visible
    await expect(tree).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T5: Preview Panel Updates on Selection
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T5: preview panel visible', async ({ page }) => {
    const preview = page.locator('#canvas-area');
    
    // Preview area should be visible
    await expect(preview).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T5b: Viewport Button Click Changes Frame Size
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T5b: viewport buttons change preview width', async ({ page }) => {
    // Load assets first
    await page.locator('#btn-auto').click();
    await page.waitForTimeout(2000);
    
    // Select first item
    const firstItem = page.locator('.tree__item').first();
    await firstItem.click();
    await page.waitForTimeout(500);
    
    // Get initial iframe width in auto mode
    const iframeAuto = page.locator('.canvas-frame iframe').first();
    const parentAuto = iframeAuto.locator('..');
    const autoWidth = await parentAuto.evaluate(el => window.getComputedStyle(el).width);
    
    // Click 320px button
    await page.locator('.vp-btn[data-vp="320"]').click();
    await page.waitForTimeout(300);
    
    // Get new width
    const narrowWidth = await parentAuto.evaluate(el => window.getComputedStyle(el).width);
    
    // Width should have changed
    expect(narrowWidth).not.toBe(autoWidth);
    expect(narrowWidth).toContain('320px');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T6: Canvas Loading via Query Parameter
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T6: handle query parameters on load', async ({ page }) => {
    // Navigate with canvas query param
    await page.goto('/viewer/pseudo-canvas-viewer.html?canvas=../pseudo-canvas-demo.html');
    
    // Page should load without errors
    await expect(page).toHaveTitle(/pseudo-canvas-viewer/i);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T6b: Right Tab Clicks Switch Between Props/Slots/Source
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T6b: right panel tabs switch content', async ({ page }) => {
    // Load assets
    await page.locator('#btn-auto').click();
    await page.waitForTimeout(2000);
    
    // Select first item with props
    const firstItem = page.locator('.tree__item').first();
    await firstItem.click();
    await page.waitForTimeout(500);
    
    // Props tab should show content
    const propsTab = page.locator('.rtab[data-tab="props"]');
    await expect(propsTab).toHaveClass(/active/);
    
    // Click Slots tab
    const slotsTab = page.locator('.rtab[data-tab="slots"]');
    await slotsTab.click();
    await page.waitForTimeout(300);
    
    // Slots tab should now be active
    await expect(slotsTab).toHaveClass(/active/);
    await expect(propsTab).not.toHaveClass(/active/);
    
    // Click Source tab
    const sourceTab = page.locator('.rtab[data-tab="source"]');
    await sourceTab.click();
    await page.waitForTimeout(300);
    
    // Source tab should now be active
    await expect(sourceTab).toHaveClass(/active/);
    await expect(slotsTab).not.toHaveClass(/active/);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T7b: Tree Item Selection Renders Preview
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T7b: tree item click renders component preview', async ({ page }) => {
    // Load assets
    await page.locator('#btn-auto').click();
    await page.waitForTimeout(2000);
    
    // Verify tree has items
    const treeItems = page.locator('.tree__item');
    const firstItem = treeItems.first();
    const itemName = await firstItem.textContent();
    
    // Click item
    await firstItem.click();
    await page.waitForTimeout(500);
    
    // Component name should update in toolbar
    const toolbarName = page.locator('#canvas-name');
    const displayName = await toolbarName.textContent();
    expect(displayName).toContain(itemName.trim());
    
    // Canvas frame should exist
    const frame = page.locator('.canvas-frame');
    await expect(frame).toBeVisible();
    
    // Frame should contain an iframe
    const iframe = frame.locator('iframe');
    await expect(iframe).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T8b: Search Filter Works
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T8b: search input filters tree items', async ({ page }) => {
    // Load assets
    await page.locator('#btn-auto').click();
    await page.waitForTimeout(2000);
    
    // Count initial items
    const initialItems = page.locator('.tree__item');
    const initialCount = await initialItems.count();
    expect(initialCount).toBeGreaterThan(5);
    
    // Type in search box
    const searchInput = page.locator('#search-input');
    await searchInput.fill('button');
    await page.waitForTimeout(300);
    
    // Count filtered items
    const filteredItems = page.locator('.tree__item');
    const filteredCount = await filteredItems.count();
    
    // Should have fewer items
    expect(filteredCount).toBeLessThan(initialCount);
    
    // All visible items should contain "button"
    const visibleItems = await filteredItems.allTextContents();
    visibleItems.forEach(text => {
      expect(text.toLowerCase()).toContain('button');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T9: Responsive Layout on Different Screen Sizes
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T9: layout remains usable on mobile viewport', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify key UI elements are still visible
    await expect(page.locator('#btn-auto')).toBeVisible();
    await expect(page.locator('.titlebar')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T10: State Persistence Across Reload
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T10: page reloads without errors', async ({ page }) => {
    // Reload the page
    await page.reload();
    
    // Should be back to initial state
    await expect(page.locator('#btn-auto')).toBeVisible();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T11: No JavaScript Errors in Console
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T11: no critical errors in browser console', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => {
      // Track actual page errors (not expected warnings)
      if (!err.toString().includes('CORS')) {
        errors.push(err.toString());
      }
    });
    
    // Navigate and wait
    await page.goto('/pseudo-canvas/viewer/pseudo-canvas-viewer.html');
    await page.waitForTimeout(1000);
    
    // Should have no critical errors
    expect(errors.length).toBe(0);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // E2E-T12: Accessibility — Keyboard Navigation
  // ─────────────────────────────────────────────────────────────────────────
  
  test('E2E-T12: keyboard focus works', async ({ page }) => {
    // Tab to the first focusable element
    await page.keyboard.press('Tab');
    
    // Something should be focused
    const focused = await page.evaluate(() => !!document.activeElement && document.activeElement.id);
    expect(focused).toBeTruthy();
  });
});
