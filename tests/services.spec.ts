import { expect, type Locator, type Page, test } from '@playwright/test';
import { loginAs } from './helpers/auth.helper';

test.describe('Services', () => {
  test.describe.configure({ mode: 'serial' });

  test('Services list loads with cards after login', async ({ page }) => {
    await loginAs(page, 'participant');
    await expect(page.getByRole('heading', { name: 'Our Services' })).toBeVisible();

    await expectServiceCardsToLoad(page);
  });

  test('Category filter shows only matching services', async ({ page }) => {
    await loginAs(page, 'participant');
    await expectServiceCardsToLoad(page);

    const category = await firstVisibleServiceCategory(page);
    await selectCategory(page, category);

    await expectVisibleCardsToMatchCategory(page, category);
  });

  test('Clicking "All" resets the filter', async ({ page }) => {
    await loginAs(page, 'participant');
    const originalCount = await expectServiceCardsToLoad(page);

    const category = await firstVisibleServiceCategory(page);
    await selectCategory(page, category);
    await expectVisibleCardsToMatchCategory(page, category);

    await selectCategory(page, 'All Categories');

    await expect.poll(() => serviceCards(page).count()).toBe(originalCount);
  });

  test('Coordinator sees Add Service button', async ({ page }) => {
    const serviceName = `Playwright Service ${Date.now()}`;

    await loginAs(page, 'coordinator');

    await page.goto('/dashboard/services');

    await expect(page.getByRole('heading', { name: 'Manage Services' })).toBeVisible();
    await expect(page.getByTestId('add-service-btn')).toBeVisible();
    await page.getByRole('button', { name: /new service/i }).click();

    await expect(page.getByRole('heading', { name: 'Add New Service' })).toBeVisible();
    await page.getByPlaceholder('Enter service name').fill(serviceName);

    const categorySelect = page.locator('select[formcontrolname="category"]');
    await expect.poll(() => categorySelect.locator('option:not([disabled])').count()).toBeGreaterThan(0);
    await categorySelect.selectOption({ index: 1 });

    await page
      .getByPlaceholder('Enter service description')
      .fill('This service was created by a Playwright end-to-end test.');

    const createServiceResponse = page.waitForResponse((response) =>
      response.request().method() === 'POST' &&
      /\/api\/services$/i.test(new URL(response.url()).pathname)
    );

    await page.getByTestId('save-btn').click();
    expect((await createServiceResponse).ok()).toBeTruthy();

    await expect(page.getByRole('cell', { name: serviceName })).toBeVisible();
  });

  test('Participant does not see Add Service button', async ({ page }) => {
    await loginAs(page, 'participant');

    await expect(page.getByRole('heading', { name: 'Our Services' })).toBeVisible();
    await expect(page.getByTestId('add-service-btn')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /new service/i })).toHaveCount(0);
  });
});

function serviceCards(page: Page) {
  return page.locator('app-service-card-ui');
}

async function expectServiceCardsToLoad(page: Page) {
  await expect.poll(() => serviceCards(page).count()).toBeGreaterThan(0);
  return serviceCards(page).count();
}

async function firstVisibleServiceCategory(page: Page) {
  const category = normalizeCategory(await cardCategory(serviceCards(page).first()).textContent());

  expect(category).not.toBe('');
  return category;
}

async function selectCategory(page: Page, category: string) {
  await page.getByRole('button', { name: /^category$/i }).click();
  await page.getByRole('button', { name: category, exact: true }).click();
}

async function expectVisibleCardsToMatchCategory(page: Page, category: string) {
  await expectServiceCardsToLoad(page);

  const count = await serviceCards(page).count();

  for (let index = 0; index < count; index += 1) {
    await expect(cardCategory(serviceCards(page).nth(index))).toHaveText(
      new RegExp(`^\\s*${escapeRegExp(category)}\\s*$`, 'i')
    );
  }
}

function cardCategory(card: Locator) {
  return card.locator('span').last();
}

function normalizeCategory(value: string | null) {
  return (value ?? '').trim().replace(/\s+/g, ' ');
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
