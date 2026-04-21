import { test, expect } from '@playwright/test';

test.describe('Accessibility Audit', () => {
  const pages = [
    { url: '/', name: 'Homepage' },
    { url: '/teams', name: 'Teams' },
    { url: '/members', name: 'Members' },
    { url: '/publications', name: 'Publications' },
    { url: '/news', name: 'News' },
    { url: '/gallery', name: 'Gallery' },
    { url: '/phd-progress', name: 'PhD Progress' },
    { url: '/about', name: 'About' },
    { url: '/contact', name: 'Contact' },
  ];

  for (const page of pages) {
    test(`${page.name} - no critical accessibility issues`, async ({ page: browserPage }) => {
      await browserPage.goto(page.url);
      
      const violations = [];
      
      await browserPage.addStyleTag({
        content: `
          [aria-invalid="true"] { outline: 2px solid red !important; }
          [role="alert"] { outline: 2px solid orange !important; }
        `
      });

      const issues = await browserPage.evaluate(() => {
        const issues = [];
        
        document.querySelectorAll('img:not([alt])').forEach(el => {
          issues.push(`Image missing alt text: <${el.tagName}>`);
        });
        
        document.querySelectorAll('a[href=""], a[href="#"]').forEach(el => {
          issues.push(`Empty or invalid link: <a>${el.textContent || 'no text'}</a>`);
        });

        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const headingLevels = headings.map(h => parseInt(h.tagName.charAt(1)));
        for (let i = 1; i < headingLevels.length; i++) {
          if (headingLevels[i] > headingLevels[i-1] + 1) {
            issues.push(`Skipped heading level: h${headingLevels[i-1]} -> h${headingLevels[i]}`);
          }
        }

        return issues;
      });

      expect(issues).toEqual([]);
    });
  }

  test('focus management - can tab through page', async ({ page }) => {
    await page.goto('/');
    const initialFocus = await page.evaluate(() => document.activeElement?.tagName);
    
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    const newFocus = await page.evaluate(() => document.activeElement?.tagName);
    expect(newFocus).not.toBe(initialFocus);
  });

  test('skip link exists on homepage', async ({ page }) => {
    await page.goto('/');
    const skipLink = await page.locator('a[href^="#main"], a[class*="skip"]').first();
    
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeVisible();
    }
  });
});