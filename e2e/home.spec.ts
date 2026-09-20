import { test, expect } from '@playwright/test';

test('Aboutページに見出しが表示される', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { name: /naoki kaneko/i })).toBeVisible();
});
