import { expect, test } from '@playwright/test';
import { login } from './helpers';

test.describe('authentication', () => {
  test('redirects unauthenticated visitors to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole('heading', { name: /sign in to taskflow/i }),
    ).toBeVisible();
  });

  test('signs in and persists the session across reload', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/dashboard/);

    await page.reload();
    await expect(
      page.getByRole('heading', { name: /welcome back/i }),
    ).toBeVisible();
  });

  test('shows an error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('avery@taskflow.app');
    await page.getByLabel(/password/i).fill('wrong-password');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test('signs out back to the login screen', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: /account menu/i }).click();
    await page.getByRole('menuitem', { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
