import { test, expect } from '@playwright/test';

test.describe('Login flow smoke', () => {
  test('login page renders HMS branding and validation', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('img[alt="HMS Personal Trainer"]')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: /bem-vindo de volta/i })).toBeVisible();
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
