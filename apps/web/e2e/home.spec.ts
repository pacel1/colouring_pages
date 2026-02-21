import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    
    // Check page loads
    await expect(page).toHaveTitle(/colouring/i);
    
    // Check main heading
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to categories', async ({ page }) => {
    await page.goto('/');
    
    // Find and click category link
    const categoryLink = page.locator('a[href="/kategorie"]').first();
    await categoryLink.click();
    
    // Should be on categories page
    await expect(page).toHaveURL(/\/kategorie/);
  });
});
