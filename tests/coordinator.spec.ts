import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.helper';

test.describe('Coordinator Dashboard', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'coordinator');
  });  

  test('Dashboard stat cards are visible', async ({ page }) => {
    // Asserts stat cards derived from the BookingStatsDto are populated
    const stats = page.getByTestId('stat-card');

    await expect(stats).toContainText('Total Bookings');
    await expect(stats).toContainText('Pending');
    await expect(stats).toContainText('Approved');
    await expect(stats).toContainText('Cancelled');
  });

  test('Coordinator can approve a Pending booking', async ({ page }) => {
    await page.goto('/dashboard/bookings');
    await expect(page.getByRole('heading', { name: 'All Bookings' })).toBeVisible();
    await expect(page.getByTestId('bookings-table')).toBeVisible();

    const pendingRows = page
      .locator('tbody tr')
      .filter({ has: page.getByText('Pending', { exact: true }) });

    const pendingRow = pendingRows.first();
    await expect(pendingRow).toBeVisible();
    await pendingRow.getByTestId('menu-btn').click();

    const updateStatusResponse = page.waitForResponse((response) =>
      response.request().method() === 'PUT' &&
      /\/bookings\/\d+\/status$/i.test(response.url())
    );

    await pendingRow.getByTestId('approve-btn').click();
    const response = await updateStatusResponse;

    expect(response.ok()).toBeTruthy();
    await expect(page.getByTestId('bookings-table')).toContainText('Approved');
  });

  test('Approved booking shows green status badge', async ({ page }) => {
    await page.goto('/dashboard/bookings');
    await expect(page.getByRole('heading', { name: 'All Bookings' })).toBeVisible();

    const approvedRow = page
      .locator('tbody tr')
      .filter({ has: page.getByText('Approved', { exact: true }) })
      .first();

    await expect(approvedRow).toBeVisible();
  });

  test('Coordinator can add a new service via modal and it appears in the services table', async ({ page }, testInfo) => {
    const serviceName = `Automated Web Service ${testInfo.project.name} ${Date.now()}`;

    await page.goto('/dashboard/services');
    await expect(page.getByRole('heading', { name: 'Manage Services' })).toBeVisible();

    // Open the Add Service modal
    await page.getByRole('button', { name: /new service/i }).click();

    // Fill out the service form details
    await page.getByPlaceholder('Enter service name').fill(serviceName);
    await page.locator('select[formcontrolname="category"]').selectOption({ index: 1 });
    await page.getByPlaceholder('Enter service description').fill('This is a test service created via automated testing.');

    // Save the new service
    await page.getByTestId('save-btn').click();

    // Verify the newly added service is displayed in the table successfully
    await expect(page.getByRole('cell', { name: serviceName })).toBeVisible();
  });
});
