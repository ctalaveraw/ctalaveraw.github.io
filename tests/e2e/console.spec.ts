import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('console commands work and closing restores focus', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Open terminal' });
  await trigger.click();

  const dialog = page.getByRole('dialog');
  const input = page.getByRole('textbox', { name: 'Console command' });
  const output = page.locator('#terminal-output');

  await expect(dialog).toBeVisible();
  await expect(input).toBeFocused();

  const checks = [
    ['help', 'ENGINEERING EVIDENCE'],
    ['experience', 'Infrastructure Support Engineer'],
    ['credentials', 'AWS Certified Machine Learning Engineer'],
    ['pipeline', 'Flux'],
  ] as const;

  for (const [command, expected] of checks) {
    await input.fill(command);
    await input.press('Enter');
    await expect(output).toContainText(expected);
  }

  await input.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Ctrl+K and the footer button open the same console', async ({ page }) => {
  const dialog = page.getByRole('dialog');

  await page.keyboard.press('Control+k');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  const footerButton = page.getByRole('button', { name: 'Open portfolio console' });
  await footerButton.click();
  await expect(dialog).toBeVisible();
  await page.locator('#terminal-close').click();
  await expect(dialog).toBeHidden();
  await expect(footerButton).toBeFocused();
});
