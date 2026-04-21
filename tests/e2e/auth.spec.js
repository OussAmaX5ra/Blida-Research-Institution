import { test, expect } from '@playwright/test';

const TEST_ADMIN_EMAIL = 'admin@blida-research.example.org';
const TEST_ADMIN_PASSWORD = 'admin123';

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('h1')).toContainText(/login/i);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill(TEST_ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page).toHaveURL(/\/admin/, { timeout: 10000 });
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('failed login shows error', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill(TEST_ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.getByText(/invalid|error/i)).toBeVisible();
  });

  test('logout works', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill(TEST_ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/admin/);
    
    await page.getByRole('button', { name: /logout|sign out/i }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('unauthenticated access to admin redirects to login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
