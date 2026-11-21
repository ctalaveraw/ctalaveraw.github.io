import { expect, test } from '@playwright/test';

test('IDE tabs close and restore while content remains visible', async ({ page }) => {
  await page.goto('/');
  const tab = page.locator('[data-tab][data-section="projects"]');
  const projects = page.locator('#projects');

  await tab.locator('a').click();
  await expect(page).toHaveURL(/#projects$/);

  await tab.hover();
  await tab.locator('[data-close-tab]').click();

  await expect(tab).toBeHidden();
  await expect(projects).toBeVisible();

  await page.locator('#restore-tabs-btn').click();
  await expect(tab).toBeVisible();

  await tab.hover();
  await tab.locator('[data-close-tab]').click();
  await page.keyboard.press('Control+z');
  await expect(tab).toBeVisible();
});

test('architecture paths expand using the keyboard', async ({ page }) => {
  await page.goto('/');
  const paths = page.locator('#architecture details');
  await expect(paths).toHaveCount(4);

  const first = paths.first();
  await first.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('open', '');
  await expect(first.getByText('Recorded checks')).toBeVisible();

  await page.keyboard.press('Enter');
  await expect(first).not.toHaveAttribute('open');
});

test.describe('narrow viewport', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('has no document overflow and keyboard focus remains visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#architecture')).toBeVisible();

    const widths = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(widths.document).toBeLessThanOrEqual(widths.viewport + 1);

    await page.keyboard.press('Tab');
    await expect(page.locator(':focus-visible').first()).toBeVisible();
  });
});
