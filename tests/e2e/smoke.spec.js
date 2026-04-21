import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('health endpoint responds', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Blida/i);
  });

  test('publications page loads', async ({ page }) => {
    await page.goto('/publications');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('admin login page loads', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});