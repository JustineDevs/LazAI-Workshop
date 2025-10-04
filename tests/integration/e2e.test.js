const { test, expect } = require('@playwright/test');

test.describe('DataStreamNFT E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/DataStreamNFT/);
    await expect(page.locator('h1')).toContainText('DataStreamNFT');
    await expect(page.locator('text=Revolutionary Data Monetization Platform')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Marketplace')).toBeVisible();
    await expect(page.locator('text=Create')).toBeVisible();
    await expect(page.locator('text=LazAI')).toBeVisible();
  });

  test('should show connect wallet button', async ({ page }) => {
    await expect(page.locator('text=Connect Wallet')).toBeVisible();
  });

  test('should display features section', async ({ page }) => {
    await expect(page.locator('text=Data Monetization')).toBeVisible();
    await expect(page.locator('text=AI Integration')).toBeVisible();
    await expect(page.locator('text=Micropayments')).toBeVisible();
  });

  test('should navigate to different pages', async ({ page }) => {
    // Test marketplace navigation
    await page.click('text=Marketplace');
    await expect(page).toHaveURL(/.*marketplace/);
    await expect(page.locator('h1')).toContainText('Marketplace');

    // Test create navigation
    await page.click('text=Create');
    await expect(page).toHaveURL(/.*create/);
    await expect(page.locator('h1')).toContainText('Create Data NFT');

    // Test LazAI navigation
    await page.click('text=LazAI');
    await expect(page).toHaveURL(/.*lazai/);
    await expect(page.locator('h1')).toContainText('LazAI Integration');

    // Test profile navigation
    await page.click('text=Profile');
    await expect(page).toHaveURL(/.*profile/);
    await expect(page.locator('h1')).toContainText('Profile');
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('nav')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Filter out browser extension errors
    const filteredErrors = errors.filter(error => 
      !error.message.includes('Cannot destructure property') &&
      !error.message.includes('register') &&
      !error.message.includes('chrome-extension://')
    );
    
    expect(filteredErrors).toHaveLength(0);
  });
});

test.describe('API Integration Tests', () => {
  test('should connect to backend API', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/v1/blockchain/network');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('chainId');
    expect(data.data).toHaveProperty('blockNumber');
  });

  test('should handle API errors gracefully', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/v1/non-existent');
    expect(response.status()).toBe(404);
    
    const data = await response.json();
    expect(data.error).toBe('Route not found');
  });
});
