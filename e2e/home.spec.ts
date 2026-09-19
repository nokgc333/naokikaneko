import { test, expect } from '@playwright/test';

test('トップページのタイトルにnaokikaneko.comが含まれる', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/naokikaneko\.com/);
});
