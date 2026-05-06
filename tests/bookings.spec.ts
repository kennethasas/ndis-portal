import { expect, type Locator, type Page, test } from '@playwright/test';
import { loginAs } from './helpers/auth.helper';

test.describe('Bookings - Participant', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'participant');
  });

  test('Participant submits a booking and sees Pending status', async ({ page }) => {
    const booking = await createBookingThroughUi(page, dateInputValue(14));

    const createdRow = await findBookingRow(page, booking);
    await expect(createdRow).toContainText('Pending');

    await cancelBookingThroughUi(page, booking);
  });

  test('Booking form shows error when date is in the past', async ({ page }) => {
    await openBookingForm(page);
    await selectFirstService(page);
    await fillPreferredDate(page, dateInputValue(-1));
    await submitBooking(page);

    await expect(page.getByText('Preferred date cannot be in the past')).toBeVisible();
  });

  test('Booking form shows error when service is not selected', async ({ page }) => {
    await openBookingForm(page);
    await fillPreferredDate(page, dateInputValue(7));
    await submitBooking(page);

    await expect(page.getByText('Service is required')).toBeVisible();
  });

  test('Participant sees empty state when no bookings exist', async ({ page }) => {
    // Intercept the API to guarantee there are no bookings, avoiding flaky tests
    // that rely on checking all filter states sequentially.
    await page.route('**/api/bookings*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: { Data: [], Success: true } });
      } else {
        await route.fallback();
      }
    });

    await openMyBookings(page);
    await expect(page.getByText('No bookings found')).toBeVisible();
    await expect(page.getByText('Try changing your filter or book a new service.')).toBeVisible();
  });

  test('Participant can cancel a Pending booking', async ({ page }) => {
    const booking = await createBookingThroughUi(page, dateInputValue(21));

    await cancelBookingThroughUi(page, booking);

    // Verify that the booking now appears under the "Cancelled" filter tab
    await page.locator('app-status-dropdown button').first().click();
    await page.getByRole('button', { name: 'Cancelled', exact: true }).click();

    await page.waitForTimeout(500); // Allow the table to re-render with the new filter
    const cancelledRow = await findBookingRow(page, booking);
    await expect(cancelledRow).toContainText('Cancelled');
  });

  test('Cancel confirmation dialog appears before cancelling', async ({ page }) => {
    const booking = await createBookingThroughUi(page, dateInputValue(28));

    await openPendingBookings(page);
    const pendingRow = await findBookingRow(page, booking);
    await openCancelDialogForRow(page, pendingRow);

    const dialog = page.locator('app-cancel-dialog');

    await expect(
      dialog.getByRole('heading', { name: 'Are you sure you want to cancel this booking?' })
    ).toBeVisible();
    await expect(dialog.getByText('You will permanently cancel this scheduled booking.')).toBeVisible();
    await expect(pendingRow).toBeVisible();

    await confirmCancelBooking(page, booking);
  });
});

type CreatedBooking = {
  id: number;
  serviceName: string;
  preferredDate: string;
};

async function openBookingForm(page: Page) {
  await page.getByRole('link', { name: 'Book a Service' }).click();
  await expect(page.getByRole('heading', { name: 'Book a Service' })).toBeVisible();
  await expect(page.locator('select')).toBeVisible();
}

async function openMyBookings(page: Page) {
  const heading = page.getByRole('heading', { name: 'My Bookings' });
  if (!(await heading.isVisible())) {
    await page.getByRole('link', { name: 'My Bookings' }).click();
  }
  await expect(heading).toBeVisible();
}

async function createBookingThroughUi(page: Page, preferredDate: string): Promise<CreatedBooking> {
  await openBookingForm(page);

  const serviceName = await selectFirstService(page);
  await fillPreferredDate(page, preferredDate);
  await page.locator('textarea').fill(`Playwright booking ${Date.now()}`);

  const createBookingResponse = page.waitForResponse((response) =>
    response.request().method() === 'POST' &&
    /\/api\/bookings$/i.test(new URL(response.url()).pathname)
  );

  await submitBooking(page);

  const response = await createBookingResponse;
  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  const created = body.Data ?? body;
  const id = Number(created.id ?? created.Id);

  expect(id).toBeTruthy();

  // Let the application automatically navigate to /bookings via its internal timeout
  await page.waitForURL('**/bookings', { timeout: 10000 });
  await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();

  return { id, serviceName, preferredDate };
}

async function selectFirstService(page: Page) {
  const serviceSelect = page.locator('select');

  await expect
    .poll(async () => serviceSelect.locator('option:not([disabled])').count())
    .toBeGreaterThan(0);

  const firstServiceOption = serviceSelect.locator('option:not([disabled])').first();
  const value = await firstServiceOption.getAttribute('value');
  const serviceName = (await firstServiceOption.innerText()).trim();

  expect(value).toBeTruthy();
  await serviceSelect.selectOption(value as string);

  return serviceName;
}

async function fillPreferredDate(page: Page, date: string) {
  await page.locator('input[type="date"]').fill(date);
}

async function submitBooking(page: Page) {
  await page.getByRole('button', { name: /book this service/i }).click();
}

async function openPendingBookings(page: Page) {
  await openMyBookings(page);

  const statusDropdown = page.locator('app-status-dropdown');
  const statusButton = statusDropdown.getByRole('button', { name: 'Status' });

  await expect(statusButton).toBeVisible();
  await statusButton.click();

  const pendingBookingsResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());

    return (
      response.request().method() === 'GET' &&
      /\/bookings$/i.test(url.pathname) &&
      url.searchParams.get('status')?.toLowerCase() === 'pending'
    );
  });

  await statusDropdown.getByRole('button', { name: 'Pending', exact: true }).click();

  expect((await pendingBookingsResponse).ok()).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Pending Bookings', exact: true })).toBeVisible();
}

async function findBookingRow(page: Page, booking: CreatedBooking) {
  const row = page
    .locator('tbody tr')
    .filter({ hasText: booking.serviceName })
    .filter({ hasText: formatDisplayedDate(booking.preferredDate) })
    .first();

  await expect(row).toBeVisible();
  return row;
}

async function openCancelDialogForRow(page: Page, row: Locator) {
  await row.locator('button').last().click();
  // Dropdowns (like action menus) are often rendered dynamically in global overlays outside the <tr>
  // Searching from 'page' avoids issues where the 'Cancel' option is not a child of 'row'
  await page.getByRole('button', { name: 'Cancel' }).click();
}

async function cancelBookingThroughUi(page: Page, booking: CreatedBooking) {
  await openPendingBookings(page);
  const pendingRow = await findBookingRow(page, booking);
  await openCancelDialogForRow(page, pendingRow);
  await confirmCancelBooking(page, booking);
}

async function confirmCancelBooking(page: Page, booking: CreatedBooking) {
  const confirmButton = page
    .locator('app-cancel-dialog')
    .getByRole('button', { name: 'Yes, Cancel Booking', exact: true });

  await expect(confirmButton).toBeVisible();

  const [deleteResponse, refreshedResponse] = await Promise.all([
    page.waitForResponse((response) =>
      response.request().method() === 'DELETE' &&
      new URL(response.url()).pathname.toLowerCase().endsWith(`/api/bookings/${booking.id}`)
    ),
    page.waitForResponse((response) => {
      const url = new URL(response.url());

      return (
        response.request().method() === 'GET' &&
        /\/bookings$/i.test(url.pathname) &&
        url.searchParams.get('status')?.toLowerCase() === 'pending'
      );
    }),
    confirmButton.click(),
  ]);

  expect(deleteResponse.ok()).toBeTruthy();
  expect(refreshedResponse.ok()).toBeTruthy();

  const body = await refreshedResponse.json();
  const bookings = Array.isArray(body) ? body : body.Data ?? [];

  expect(
    bookings.some((item: { id?: number; Id?: number }) => Number(item.id ?? item.Id) === booking.id)
  ).toBe(false);
}


function dateInputValue(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDisplayedDate(value: string) {
  // The app parses "YYYY-MM-DD" as UTC midnight, then Angular's date pipe formats it 
  // to the local timezone. We use new Date(value) to replicate this exact behavior.
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
