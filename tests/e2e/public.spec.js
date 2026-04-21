import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Blida/i);
    await expect(page.locator('header')).toBeVisible();
  });

  test('navigation to about page works', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /about/i }).first().click();
    await expect(page).toHaveURL(/about/);
  });

  test('research teams page loads', async ({ page }) => {
    await page.goto('/teams');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('publications page loads with data', async ({ page }) => {
    await page.goto('/publications');
    await expect(page.locator('h1')).toContainText(/publication/i);
  });

  test('gallery page loads', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.locator('h1')).toContainText(/gallery/i);
  });

  test('phd progress page loads', async ({ page }) => {
    await page.goto('/phd-progress');
    await expect(page.locator('h1')).toContainText(/phd/i);
  });
});
