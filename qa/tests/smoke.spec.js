const { test, expect } = require('../fixtures');

test('@smoke public page renders securely on the configured viewport', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  const response = await page.goto('/');
  expect(response.status()).toBe(200);
  await expect(page).toHaveTitle(/סל שיתופי/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /סל שיתופי/);
  await expect(page.locator('meta[name="viewport"]')).not.toHaveAttribute('content', /maximum-scale/);
  await expect(page.locator('#formLogin')).toBeVisible();
  await expect(page.locator('a[href="#main-content"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.getByRole('button', { name: 'מי אנחנו' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'מי אנחנו' })).toBeFocused();
  expect(consoleErrors.filter(error => error !== 'Failed to load resource: the server responded with a status of 401 ()')).toEqual([]);
});
