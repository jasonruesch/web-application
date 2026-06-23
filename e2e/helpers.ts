import { type Page, expect } from '@playwright/test';

/** Sign in through the UI using the seeded demo account. */
export async function login(page: Page) {
  await page.goto('/login');
  await page.getByRole('button', { name: /use demo account/i }).click();
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
}

/** Open the first project from the projects list and wait for its board. */
export async function openFirstProject(page: Page) {
  await page.getByRole('link', { name: 'Projects' }).click();
  await page.getByRole('link', { name: /Atlas Web App/i }).click();
  await expect(page.getByText('To do')).toBeVisible();
}
