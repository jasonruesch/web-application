import { expect, test } from '@playwright/test';
import { login, openFirstProject } from './helpers';

test.beforeEach(async ({ page }) => {
  await login(page);
});

test('creates a project and lands on its board', async ({ page }) => {
  await page.getByRole('link', { name: 'Projects' }).click();
  await page.getByRole('button', { name: /new project/i }).click();

  const dialog = page.getByRole('dialog', { name: /create project/i });
  await dialog.getByLabel('Name').fill('Launch Plan');
  await dialog.getByLabel('Key').fill('LP');
  await dialog.getByRole('button', { name: /create project/i }).click();

  // Navigated to the new project's board.
  await expect(page.getByRole('heading', { name: 'Launch Plan' })).toBeVisible();
  await expect(page.getByText('To do')).toBeVisible();
});

test('opens a task as an intercepting modal, then deep-links it full-page', async ({
  page,
}) => {
  await openFirstProject(page);

  // Click the first task card → intercepted modal over the board.
  const firstCard = page.locator('[data-task-id]').first();
  await firstCard.click();

  const modal = page.getByRole('dialog', { name: /task details/i });
  await expect(modal).toBeVisible();
  await expect(page).toHaveURL(/\/projects\/[^/]+\/task-/);

  // Reloading the same URL renders the full-page detail (no modal).
  await page.reload();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /back to board/i })).toBeVisible();
});

test('adds a comment to a task', async ({ page }) => {
  await openFirstProject(page);
  await page.locator('[data-task-id]').first().click();

  const modal = page.getByRole('dialog', { name: /task details/i });
  await expect(modal).toBeVisible();

  await modal.getByLabel(/add a comment/i).fill('Reviewed and approved.');
  await modal.getByRole('button', { name: /^comment$/i }).click();
  await expect(modal.getByText('Reviewed and approved.')).toBeVisible();
});

test('filters board tasks by search', async ({ page }) => {
  await openFirstProject(page);
  const firstTitle = await page
    .locator('[data-task-id]')
    .first()
    .innerText();
  const term = firstTitle.split(' ')[0];

  await page.getByLabel('Filter tasks').fill(term);
  await expect(page.locator('[data-task-id]').first()).toBeVisible();
});
