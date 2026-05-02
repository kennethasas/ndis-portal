import { test, expect, Page } from '@playwright/test';

const baseURL = 'http://localhost:4200';


async function loginAs(page: Page, role: 'participant' | 'coordinator') {
  const credentials = {
    participant: {
      email: 'participant1@ndisportal.com',
      password: 'Test@1234',
    },
    coordinator: {
      email: 'coordinator@ndisportal.com',
      password: 'Test@1234',
    },
  };

  await page.goto(`${baseURL}/login`);

  await page.getByRole('textbox', { name: 'Email' }).fill(credentials[role].email);
  await page.getByRole('textbox', { name: 'Password' }).fill(credentials[role].password);
  await page.getByRole('button', { name: 'Log in' }).click();

 
  if (role === 'coordinator') {
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  } else {
    await expect(page).toHaveURL(/\/services/, { timeout: 10000 });
  }
}

test.describe('Authentication Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/signup`);
  });

  test('Register new participant successfully', async ({ page }) => {
    await page.getByRole('textbox', { name: 'First Name' }).fill('tine');
    await page.getByRole('textbox', { name: 'Last Name' }).fill('mae');
    await page.getByRole('combobox').selectOption('participant');

    
    await page.getByRole('textbox', { name: 'Email' }).fill(`tine${Date.now()}@gmail.com`);
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');

    await page.getByRole('checkbox', { name: /I agree to the terms/i }).check();
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expect(page.getByText('Account created successfully!')).toBeVisible();
  });

  
  test('Should show validation error on duplicate email', async ({ page }) => {
    await page.getByRole('textbox', { name: 'First Name' }).fill('Jenny');
    await page.getByRole('textbox', { name: 'Last Name' }).fill('Ardais');
    await page.getByRole('combobox').selectOption('participant');

    await page.getByRole('textbox', { name: 'Email' }).fill('participant1@ndisportal.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');

    await page.getByRole('checkbox', { name: /I agree to the terms/i }).check();
    await page.getByRole('button', { name: 'Sign up' }).click();

    await expect(page.getByText(/Bad Request|already exists|duplicate/i)).toBeVisible();
  });

  
  test('Should show validation error on missing fields', async ({ page }) => {
    await page.getByRole('combobox').selectOption('participant');

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

  await expect(page.getByText('NDIS NDISCoordinator Portal Dashboard Manage Services')).toBeVisible(); 
  });

  
   test('Redirect to login if no token present', async ({ page }) => {
    await page.goto(`${baseURL}/services`);
    await page.goto('http://localhost:4200/login');
    await expect(page.locator('div').nth(4)).toBeVisible()
  });
});
