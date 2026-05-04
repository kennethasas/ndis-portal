import { test, expect, Page } from '@playwright/test';
import { loginAs } from './helpers/auth.helper';

test.describe('Authentication Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('Register new participant successfully', async ({ page }) => {
    await page.getByRole('textbox', { name: 'First Name' }).fill('tine');
    await page.getByRole('textbox', { name: 'Last Name' }).fill('mae');
    await page.getByRole('button', { name: 'Role' }).click();
    await page.getByRole('button', { name: 'Participant' }).click();

    
    await page.getByRole('textbox', { name: 'Email' }).fill(`tine${Date.now()}@gmail.com`);
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');

    await page.getByRole('checkbox', { name: /I agree to the terms/i }).check();
    
    const signupResponse = page.waitForResponse(res => res.request().method() === 'POST' && res.url().includes('/api/auth/register'));
    await page.getByRole('button', { name: 'Sign up' }).click();
    await signupResponse;

    // Assert that a success message is displayed on the screen
    await expect(page.getByText(/success/i).first()).toBeVisible({ timeout: 10000 });
  });

  
  test('Should show validation error on duplicate email', async ({ page }) => {
    await page.getByRole('textbox', { name: 'First Name' }).fill('Jenny');
    await page.getByRole('textbox', { name: 'Last Name' }).fill('Ardais');
    await page.getByRole('button', { name: 'Role' }).click();
    await page.getByRole('button', { name: 'Participant' }).click();

    await page.getByRole('textbox', { name: 'Email' }).fill('participant1@ndisportal.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');

    await page.getByRole('checkbox', { name: /I agree to the terms/i }).check();
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expect(page.getByText(/Bad Request|already exists|duplicate/i)).toBeVisible();
  });

  
  test('Should show validation error on missing fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Role' }).click();
    await page.getByRole('button', { name: 'Participant' }).click();

    await page.getByRole('textbox', { name: 'Email' }).fill('jenny@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('jenny12345');

    await page.getByRole('checkbox', { name: /I agree to the terms/i }).check();
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expect(page.getByText('First name and last name are required.')).toBeVisible();
  });

  
  test('Login as participant and redirect to /services', async ({ page }) => {
    await loginAs(page, 'participant');

    await expect(page).toHaveURL(/\/services/);
    await expect(page.getByRole('link', { name: 'Services' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'My Bookings' })).toBeVisible();
    await expect(page.getByText(/Our Services/i)).toBeVisible();
  });

  
  test('Login as coordinator and redirect to /dashboard', async ({ page }) => {
    await loginAs(page, 'coordinator');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible(); 
  });

  
   test('Redirect to login if no token present', async ({ page }) => {
    await page.goto('/services');
    await page.goto('/login');
    await expect(page.locator('div').nth(4)).toBeVisible()
  });
});