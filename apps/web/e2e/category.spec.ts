import { test, expect } from '@playwright/test';

test.describe('Category Page', () => {
  test('should load categories list', async ({ page }) => {
    await page.goto('/kategorie');
    
    // Check page loads
    await expect(page.locator('h1')).toContainText(/kategorie/i);
  });

  test('should navigate to category detail', async ({ page }) => {
    await page.goto('/kategorie');
    
    // Click on first category
    const categoryLink = page.locator('a[href^="/kategorie/"]').first();
    await categoryLink.click();
    
    // Should navigate to category detail
    await expect(page).toHaveURL(/\/kategorie\/[\w-]+/);
  });
});
