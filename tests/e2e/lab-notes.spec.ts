import { expect, test } from '@playwright/test';

test('lab notes on the homepage open dated reports with evidence links', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#lab-notes');
  await expect(section.locator('article')).toHaveCount(2);

  await section.getByRole('link', { name: /Read note: Failed Kubernetes rollout/ }).click();
  await expect(page).toHaveURL(/\/lab-notes\/#2026-10-09-kubernetes-rollout$/);

  const note = page.locator('article[id="2026-10-09-kubernetes-rollout"]');
  await expect(note).toBeVisible();
  await expect(note.getByText('10 of 10').first()).toBeVisible();
  await expect(note.getByRole('heading', { name: 'Public evidence' })).toBeVisible();
  await expect(
    note.getByRole('link', { name: /Incident record and captured observations/ }),
  ).toHaveAttribute(
    'href',
    /arm-homelab-platform\/blob\/main\/docs\/incidents\/2026-10-09-platform-hello-failed-rollout.md$/,
  );

  await page.getByRole('link', { name: 'R5C USB archive I/O failure' }).first().click();
  await expect(page).toHaveURL(/#2026-10-03-r5c-storage$/);
  await expect(page.locator('article[id="2026-10-03-r5c-storage"]')).toContainText('root cause');
});

test.describe('lab notes on mobile', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('keeps the index keyboard accessible without horizontal overflow', async ({ page }) => {
    await page.goto('/lab-notes/');
    await expect(page.getByRole('heading', { name: 'Lab notes', exact: true })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Lab note index' })).toBeVisible();

    const width = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(width.document).toBeLessThanOrEqual(width.viewport + 1);

    await page.keyboard.press('Tab');
    await expect(page.locator(':focus-visible').first()).toBeVisible();
  });
});
