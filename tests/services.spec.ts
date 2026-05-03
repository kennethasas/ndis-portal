import { test, expect, Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:4200');
});

const participant = {
  email: 'participant1@gmail.com',
  password: 'Test@1234'
};

const coordinator = {
  email: 'coordinator@ndisportal.com',
  password: 'Password123!'
};

async function login(login_page: Page, email: string, password: string) {
  await login_page.getByRole('textbox', { name: 'Email' }).click();
  await login_page.getByRole('textbox', { name: 'Email' }).fill(email);
  await login_page.getByRole('textbox', { name: 'Password' }).click();
  await login_page.getByRole('textbox', { name: 'Password' }).fill(password);
  await login_page.getByRole('button', { name: 'Log in' }).click();
}

test.describe('Services Page', () => {
  test('TC1 - Services list loads with cards after login', async ({ page }) => {
    await login(page, participant.email, participant.password);

    await expect(page).toHaveURL(/services/);

    const cards = page.getByTestId('service-card-1');
    await expect(cards.first()).toBeVisible();

    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC2 - Category filter shows only matching services', async ({ page }) => {
    await login(page, participant.email, participant.password);

    await expect(page).toHaveURL(/\/services/);

    await page.getByRole('button', { name: /Category/i }).click();
    await page.getByText('Daily Personal Activities').first().click();

    await expect(page.getByText('Daily Personal Activities').first()).toBeVisible();

    const categoryLabels = page.getByText('Daily Personal Activities');
    const count = await categoryLabels.count();

    expect(count).toBeGreaterThan(0);
});

test('TC3 - Clicking "All" resets the filter', async ({ page }) => {
  await login(page, participant.email, participant.password);

  await expect(page).toHaveURL(/\/services/);

  const initialCount = await page.getByTestId('service-card').count();

  await page.getByRole('button', { name: /Category/i }).click();
  await page.getByText('Daily Personal Activities').first().click();

  const filteredCount = await page.getByTestId('service-card').count();

  await page.getByRole('button', { name: /Category/i }).click();
  await page.getByText('All').first().click();

  const resetCount = await page.getByTestId('service-card').count();

  expect(filteredCount).toBeLessThanOrEqual(initialCount);
  expect(resetCount).toBe(initialCount);
});

test('TC4 - Coordinator sees Add Service button', async ({ page }) => {
  await login(page, coordinator.email, coordinator.password);

  await page.goto('http://localhost:4200/dashboard/services');

  await expect(page.getByTestId('add-service-btn')).toBeVisible();
});

  test('TC5 - Participant does not see Add Service button', async ({ page }) => {
    await login(page, participant.email, participant.password);

    await expect(page).toHaveURL(/\/services/);

    await expect(page.getByTestId('add-service-btn')).toBeHidden();
  });
});
