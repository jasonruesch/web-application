import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('theme preference toggles and persists across reload', async ({ page }) => {
  await login(page);
  const html = page.locator('html');

  // Cycle system → light → dark.
  const toggle = page.getByRole('button', { name: /^theme:/i });
  await toggle.click();
  await toggle.click();
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
});

test('switching brand updates the data-brand attribute', async ({ page }) => {
  await login(page);
  await page.getByRole('link', { name: 'Settings' }).click();

  await page.getByRole('radio', { name: /acme/i }).click();
  await expect(page.locator('html')).toHaveAttribute('data-brand', 'acme');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-brand', 'acme');
});

test('unknown routes render the 404 boundary', async ({ page }) => {
  await login(page);
  await page.goto('/this/does/not/exist');
  await expect(page.getByText('404')).toBeVisible();
  await expect(page.getByText(/page not found/i)).toBeVisible();
});
