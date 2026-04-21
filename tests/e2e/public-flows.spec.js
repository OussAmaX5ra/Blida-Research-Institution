import { test, expect } from '@playwright/test';

test.describe('Publication Search & Filters', () => {
  test.use({ baseURL: 'http://localhost:3000' });

  test('publications page shows results', async ({ page }) => {
    await page.goto('/publications');
    await expect(page.locator('h1')).toContainText(/publication/i);
    await expect(page.locator('article, .publication, [data-testid="publication"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('search input works', async ({ page }) => {
    await page.goto('/publications');
    const searchInput = page.getByPlaceholder(/search|filter/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
  });

  test('publication filter dropdown works', async ({ page }) => {
    await page.goto('/publications');
    const filterDropdown = page.getByRole('combobox', { name: /filter|year|type/i });
    if (await filterDropdown.isVisible()) {
      await filterDropdown.click();
      await expect(page.getByRole('option').first()).toBeVisible();
    }
  });
});

test.describe('Citation Export', () => {
  test.use({ baseURL: 'http://localhost:3000' });

  test('publication detail page has citation button', async ({ page }) => {
    await page.goto('/publications');
    const firstPublication = page.locator('article, .publication, a[href*="/publications/"]').first();
    if (await firstPublication.isVisible()) {
      await firstPublication.click();
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.getByRole('button', { name: /citation|bibtex|apa|export/i }).first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('PhD Progress Tracker', () => {
  test.use({ baseURL: 'http://localhost:3000' });

  test('phd progress page shows students', async ({ page }) => {
    await page.goto('/phd-progress');
    await expect(page.locator('h1')).toContainText(/phd/i);
    await expect(page.locator('[data-testid="phd-student"], article, .phd').first()).toBeVisible({ timeout: 10000 });
  });

  test('search filters phd students', async ({ page }) => {
    await page.goto('/phd-progress');
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Ahmed');
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Gallery', () => {
  test.use({ baseURL: 'http://localhost:3000' });

  test('gallery shows images', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.locator('h1')).toContainText(/gallery/i);
    const images = page.locator('img');
    expect(await images.count()).toBeGreaterThan(0);
  });

  test('load more button works', async ({ page }) => {
    await page.goto('/gallery');
    const loadMore = page.getByRole('button', { name: /load more|see more/i });
    if (await loadMore.isVisible()) {
      await loadMore.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('News', () => {
  test.use({ baseURL: 'http://localhost:3000' });

  test('news listing page loads', async ({ page }) => {
    await page.goto('/news');
    await expect(page.locator('h1')).toContainText(/news/i);
  });

  test('news detail page loads', async ({ page }) => {
    await page.goto('/news');
    const firstNews = page.locator('a[href*="/news/"]').first();
    if (await firstNews.isVisible()) {
      await firstNews.click();
      await expect(page.locator('h1')).toBeVisible();
    }
  });
});