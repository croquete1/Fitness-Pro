import { test, expect } from '@playwright/test';

test.describe('Login flow smoke', () => {
  test('login page renders Fitness Pro branding and validation', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('img[alt="Fitness Pro"]')).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 1, name: /acede ao ecossistema hms/i })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /criar conta/i })).toBeVisible();

    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.locator('text=Verifica os campos destacados.')).toBeVisible();

    await page.getByLabel('Email').fill('invalid@email');
    await page.getByLabel('Palavra-passe').fill('123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.locator('text=Verifica os campos destacados.')).toBeVisible();

    await page.getByLabel('Email').fill('trainer@example.com');
    await page.getByLabel('Palavra-passe').fill('wrongpass');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();

    await expect(page.locator('text=Fitness Pro')).toHaveCount(0);
  });
});
