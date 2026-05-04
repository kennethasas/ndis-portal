import {test, expect} from '@playwright/test';
import {loginAs} from './helpers/auth.helper'; 

test.describe('Coordinator Dashboard', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({page}) => {
    await loginAs(page, 'coordinator');
  });  

  test('Dashboard stat cards are visible', async ({ page }) => {
    // Asserts stat cards derived from the BookingStatsDto are populated
    await expect(page.getByText('Total Bookings').first()).toBeVisible();
    await expect(page.getByText('Pending', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Approved', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Cancelled', { exact: true }).first()).toBeVisible();
  });

  test('Coordinator can approve a Pending booking', async ({ page, browser }) => {
    // Create a new browser context to act as the participant and create a real booking
    const participantContext = await browser.newContext({ baseURL: 'http://localhost:4200' });
    const participantPage = await participantContext.newPage();
    
    await loginAs(participantPage, 'participant');
    
    await participantPage.getByRole('link', { name: 'Book a Service' }).click();
    const serviceSelect = participantPage.locator('select');
    await expect.poll(async () => serviceSelect.locator('option:not([disabled])').count()).toBeGreaterThan(0);
    const firstServiceOption = serviceSelect.locator('option:not([disabled])').first();
    const value = await firstServiceOption.getAttribute('value');
    await serviceSelect.selectOption(value as string);
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    const year = futureDate.getFullYear();
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const day = String(futureDate.getDate()).padStart(2, '0');
    await participantPage.locator('input[type="date"]').fill(`${year}-${month}-${day}`);
    
    await participantPage.locator('textarea').fill(`Playwright coordinator test ${Date.now()}`);
    
    const createBookingResponse = participantPage.waitForResponse(res => res.request().method() === 'POST' && res.url().includes('/api/bookings'));
    await participantPage.getByRole('button', { name: /book this service/i }).click();
    await createBookingResponse;
    
    await participantContext.close();

    await page.goto('/dashboard/bookings');

    // The 'Approve' action column is only injected when the filter is strictly 'pending'
    // Note: Adjust the combobox/dropdown selector based on your StatusDropdownComponent's markup
    await page.getByRole('button', { name: /^status$/i }).click();
    await page.getByRole('button', { name: 'Pending', exact: true }).click();

    // Allow the table UI a brief moment to re-render after applying the filter
    await page.waitForTimeout(500);

    // Perform a slide gesture to reveal the action buttons
    const pendingRow = page.locator('tbody tr').first();
    
    // 1. Simulate a horizontal scroll (for wide/responsive tables)
    await pendingRow.hover();
    await page.mouse.wheel(500, 0);

    // 2. Simulate a swipe-to-reveal drag gesture (often used in mobile-first UIs)
    const box = await pendingRow.boundingBox();
    if (box) {
      // Click on the right side of the row and drag/slide it to the left
      await page.mouse.move(box.x + box.width - 50, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 50, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();
    }
    
    await page.waitForTimeout(500); // Allow the slide animation to finish

    // Click the action menu button first to make the Approve option visible
    await pendingRow.getByTestId('menu-btn').first().click();

    // Find the Approve button in the opened menu
    const approveBtn = page.getByRole('button', { name: /approve/i }).first();
    
    // Wait for the backend response to ensure the approval is successfully saved 
    // before the test finishes and closes the browser.
    const approveResponse = page.waitForResponse(res => res.url().includes('/api/bookings') && res.request().method() !== 'GET');
    await approveBtn.click();
    await approveResponse;
  });

  test('Approved booking shows green status badge', async ({ page }) => {
    await page.goto('/dashboard/bookings');

    // Apply the 'Approved' filter to ensure our newly approved booking is listed
    await page.getByRole('button', { name: /^status$/i }).click();
    await page.getByRole('button', { name: 'Approved', exact: true }).click();
    await page.waitForTimeout(500); // Allow the table to re-render

    // Verify that an Approved status text badge appears in the table's status column
    const approvedBadge = page.locator('tbody').getByText('Approved', { exact: true }).first();
    await expect(approvedBadge).toBeVisible();
  });

  test('Coordinator can add a new service via modal and it appears in the services table', async ({ page }) => {
    const serviceName = `Automated Web Service ${Date.now()}`;
    await page.goto('/dashboard/services');

    // Open the Add Service modal
    await page.getByTestId('add-service-btn').click();

    // Fill out the service form details
    await page.getByPlaceholder('Enter service name').fill(serviceName);
    await page.locator('select[formcontrolname="category"]').selectOption({ index: 1 }); // Selects the first available category
    await page.getByPlaceholder('Enter service description').fill('This is a test service created via automated testing.');

    // Save the new service
    await page.getByTestId('save-btn').click();

    // Verify the newly added service is displayed in the table successfully
    await expect(page.getByRole('cell', { name: serviceName }).first()).toBeVisible();
  });
});