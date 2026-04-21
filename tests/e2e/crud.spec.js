import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@blida-research.example.org';
const ADMIN_PASSWORD = 'admin123';

async function loginAsAdmin(page) {
  await page.goto('/admin/login');
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/admin/, { timeout: 10000 });
}

test.describe('Admin CRUD - Teams', () => {
  test.use({ baseURL: 'http://localhost:3000' });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('teams list page loads', async ({ page }) => {
    await page.goto('/admin/teams');
    await expect(page.locator('h1')).toContainText(/team/i);
  });

  test('create team form loads', async ({ page }) => {
    await page.goto('/admin/teams/new');
    await expect(page.getByLabel(/name|acronym/i).first()).toBeVisible();
  });

  test('team can be created', async ({ page }) => {
    await page.goto('/admin/teams/new');
    await page.getByLabel(/name/i).fill('Test Team');
    await page.getByLabel(/acronym/i).fill('TT' + Date.now());
    await page.getByRole('button', { name: /save|create/i }).click();
    await expect(page.getByText(/success|created/i)).toBeVisible();
  });
});

test.describe('Admin CRUD - Members', () => {
  test.use({ baseURL: 'http://localhost:3000' });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('members list page loads', async ({ page }) => {
    await page.goto('/admin/members');
    await expect(page.locator('h1')).toContainText(/member/i);
  });

  test('create member form loads', async ({ page }) => {
    await page.goto('/admin/members/new');
    await expect(page.getByLabel(/name/i).first()).toBeVisible();
  });
});

test.describe('Admin CRUD - Publications', () => {
  test.use({ baseURL: 'http://localhost:3000' });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('publications list page loads', async ({ page }) => {
    await page.goto('/admin/publications');
    await expect(page.locator('h1')).toContainText(/publication/i);
  });

  test('create publication form loads', async ({ page }) => {
    await page.goto('/admin/publications/new');
    await expect(page.getByLabel(/title/i).first()).toBeVisible();
  });
});

test.describe('Admin CRUD - PhD Progress', () => {
  test.use({ baseURL: 'http://localhost:3000' });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('phd progress list page loads', async ({ page }) => {
    await page.goto('/admin/phd-progress');
    await expect(page.locator('h1')).toContainText(/phd/i);
  });

  test('create phd progress form loads', async ({ page }) => {
    await page.goto('/admin/phd-progress/new');
    await expect(page.getByLabel(/title|name/i).first()).toBeVisible();
  });
});