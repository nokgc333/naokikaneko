import { test, expect } from '@playwright/test';

test('トップページに見出しが表示される', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /naokikaneko/ })).toBeVisible();
});
