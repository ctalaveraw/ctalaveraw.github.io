import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('preset theme persists and updates the status bar', async ({ page }) => {
  await page.getByRole('button', { name: 'Choose color theme' }).click();
  await page.getByRole('button', { name: 'Use Nord theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'nord');
  await expect(page.locator('#status-theme')).toHaveText('Nord');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'nord');
  await expect(page.locator('#status-theme')).toHaveText('Nord');
});

test('custom color selection persists after reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Edit colors' }).click();
  const input = page.locator('input[data-color-token="--color-primary"]');
  await input.fill('#3478ab');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'custom');
  await expect(page.locator('#status-theme')).toHaveText('Custom');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'custom');
  await expect(page.locator('#status-theme')).toHaveText('Custom');
  await expect(page.locator('input[data-color-token="--color-primary"]')).toHaveValue('#3478ab');
});

test('reduced motion keeps navigation and console usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  );

  await page.getByRole('button', { name: 'Open terminal' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();

  await page.locator('[data-tab][data-section="architecture"] a').click();
  await expect(page).toHaveURL(/#architecture$/);
});
