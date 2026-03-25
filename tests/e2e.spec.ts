import { test, expect } from '@playwright/test';

test.describe('Venice Talent Pipeline E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  });

  test('should switch between Recrutamento and Onboarding boards via Sidebar', async ({ page }) => {
    // Increase timeout for slow local server
    test.setTimeout(30000);

    // Initial check - Correct heading for the new design
    await expect(page.getByRole('heading', { name: 'Recrutamento & Seleção' })).toBeVisible({ timeout: 15000 });
    
    // Open Sidebar dropdown - Use the new "1 - R & S" text
    await page.click('button:has-text("R & S")');
    
    // Switch to Onboarding
    await page.click('div[role="menuitem"]:has-text("2 - Onboarding")');
    
    // Verify URL change
    await expect(page).toHaveURL(/.*tab=onboarding/);
    
    // Verify board title change
    await expect(page.getByRole('heading', { name: 'Processo de Onboarding' })).toBeVisible({ timeout: 10000 });
  });

  test('should show correct checklist items for different stages', async ({ page }) => {
    test.setTimeout(30000);
    
    // Open a card in Requisição
    await page.click('text=SM Sênior', { timeout: 15000 });
    
    // Verify checklist items
    await expect(page.locator('text=Solicitação de vaga via Bizneo')).toBeVisible();
    
    // Close drawer
    await page.locator('button:has-text("Close")').first().click({ force: true });
    
    // Switch to Onboarding and check a different stage
    await page.goto('http://localhost:3000/?tab=onboarding', { waitUntil: 'networkidle' });
    await page.click('text=Arquiteto de Soluções', { timeout: 15000 });
    
    // Verify Onboarding checklist items
    await expect(page.locator('text=Abertura de chamado e envio de notebook (Discord)')).toBeVisible();
  });
});
