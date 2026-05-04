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
    await openMyBookings(page);
    await expectEmptyBookingsState(page);
  });

  test('Participant can cancel a Pending booking', async ({ page }) => {
    const booking = await createBookingThroughUi(page, dateInputValue(21));

    await cancelBookingThroughUi(page, booking);

    await expect(page.getByText('No bookings found')).toBeVisible();
    await expect(page.getByText('Pending', { exact: true })).toBeHidden();
  });

  test('Cancel confirmation dialog appears before cancelling', async ({ page }) => {
    const booking = await createBookingThroughUi(page, dateInputValue(28));

    await openPendingBookings(page);
    const pendingRow = await findBookingRow(page, booking);
    await openCancelDialogForRow(pendingRow);

    await expect(
      page.getByRole('heading', { name: 'Are you sure you want to cancel this booking?' })
    ).toBeVisible();
    await expect(page.getByText('You will permanently cancel this scheduled booking.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dismiss' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Yes, Cancel Booking' })).toBeVisible();
    await expect(pendingRow).toBeVisible();

    await confirmCancelBooking(page);
  });
});

type CreatedBooking = {
  serviceName: string;
  preferredDate: string;
};

async function openBookingForm(page: Page) {
  await page.getByRole('link', { name: 'Book a Service' }).click();
  await expect(page.getByRole('heading', { name: 'Book a Service' })).toBeVisible();
  await expect(page.locator('select')).toBeVisible();
}

async function openMyBookings(page: Page) {
  await page.getByRole('link', { name: 'My Bookings' }).click();
  await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();
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
  expect((await createBookingResponse).ok()).toBeTruthy();

  await expect(page).toHaveURL(/\/bookings/);
  await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();

  return { serviceName, preferredDate };
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
  await page.getByRole('button', { name: /^status$/i }).click();
  await page.getByRole('button', { name: 'Pending' }).click();
  await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();
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

async function openCancelDialogForRow(row: Locator) {
  await row.locator('button').last().click();
  await row.getByRole('button', { name: 'Cancel' }).click();
}

async function cancelBookingThroughUi(page: Page, booking: CreatedBooking) {
  await openPendingBookings(page);
  const pendingRow = await findBookingRow(page, booking);
  await openCancelDialogForRow(pendingRow);
  await confirmCancelBooking(page);
  await expect(pendingRow).toBeHidden();
}

async function confirmCancelBooking(page: Page) {
  const deleteBookingResponse = page.waitForResponse((response) =>
    response.request().method() === 'DELETE' &&
    /\/api\/bookings\/\d+$/i.test(new URL(response.url()).pathname)
  );

  await page.getByRole('button', { name: 'Yes, Cancel Booking' }).click();
  expect((await deleteBookingResponse).ok()).toBeTruthy();
}

async function expectEmptyBookingsState(page: Page) {
  if (await isEmptyBookingsStateVisible(page)) {
    await expect(page.getByText('Try changing your filter or book a new service.')).toBeVisible();
    return;
  }

  for (const status of ['Pending', 'Approved', 'Cancelled']) {
    await page.getByRole('button', { name: /^status$/i }).click();
    await page.getByRole('button', { name: status }).click();

    if (await isEmptyBookingsStateVisible(page)) {
      await expect(page.getByText('Try changing your filter or book a new service.')).toBeVisible();
      return;
    }
  }

  throw new Error('No empty booking state is available for this participant in the current frontend data.');
}

async function isEmptyBookingsStateVisible(page: Page) {
  return expect(page.getByText('No bookings found')).toBeVisible({ timeout: 3000 })
    .then(() => true)
    .catch(() => false);
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
  const [year, month, day] = value.split('-').map(Number);

  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
