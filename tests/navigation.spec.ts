import { test, expect } from '@playwright/test';

test.describe('Venice Navigation and Views', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the home page
    await page.goto('http://localhost:3000');
  });

  test('should navigate between Recruitment and Onboarding and update header', async ({ page }) => {
    // 1. Initial state should be Recruitment
    await expect(page.locator('h1')).toContainText('VENICE | RECRUTAMENTO');
    await expect(page.locator('h3')).toContainText('RH / Talent Recruiting');

    // 2. Click Onboarding in sidebar
    await page.click('button:has-text("Onboarding")');
    
    // 3. Verify URL updates
    await expect(page).toHaveURL(/tab=onboarding/);

    // 4. Verify Header updates
    await expect(page.locator('h1')).toContainText('VENICE | ONBOARDING');
    await expect(page.locator('p')).toContainText('Pipeline de Integração');

    // 5. Verify Only Onboarding board is visible
    await expect(page.locator('h3')).toContainText('Onboarding Experience');
    await expect(page.locator('h3:has-text("RH / Talent Recruiting")')).not.toBeVisible();
  });

  test('should navigate to Colaboradores', async ({ page }) => {
    // Click Colaboradores in sidebar
    await page.click('button:has-text("Colaboradores")');

    // Verify Title
    await expect(page.locator('h1')).toContainText('VENICE | COLABORADORES');
    await expect(page.locator('h2')).toContainText('Equipe Torre LM');
  });

  test('should navigate to Repositório', async ({ page }) => {
    // Click Repositório in sidebar
    await page.click('button:has-text("Repositório")');

    // Verify Title
    await expect(page.locator('h1')).toContainText('VENICE | REPORTS E MATERIAIS');
    await expect(page.locator('h2')).toContainText('Repositório de Materiais');
  });
});
