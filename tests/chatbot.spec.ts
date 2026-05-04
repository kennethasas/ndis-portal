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
    await expect(page.getByText(/Our Services/i)).toBeVisible();
  }
}

test.describe('NDIS Chatbot Automation Tests', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    // Login only once
    await loginAs(page, 'participant');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Chat button is visible after login', async () => {
    const chatButton = page.getByRole('button').last();

    await expect(chatButton).toBeVisible();
  });

  test('Chat panel opens when button is clicked', async () => {
    const chatButton = page.getByRole('button').last();

    await chatButton.click();

    await expect(page.getByPlaceholder('Type message')).toBeVisible();
  });

  test('Sending a message shows a response within 8 seconds', async () => {
    const chatInput = page.getByPlaceholder('Type message');

    await expect(chatInput).toBeVisible();

    const assistantMessages = page.locator('div.bg-gray-100.text-gray-800');
    const initialAssistantCount = await assistantMessages.count();

    await chatInput.pressSequentially('What service do you recommend?', {
      delay: 100,
    });

    await expect(chatInput).toHaveValue('What service do you recommend?');

    await page
      .locator('.bg-\\[\\#6B3293\\].text-white.flex.justify-center.items-center.px-4')
      .click();

    await expect(
      page.getByText('What service do you recommend?', { exact: true })
    ).toBeVisible();

    await expect(assistantMessages).toHaveCount(initialAssistantCount + 1, {
      timeout: 8000,
    });

    const latestAssistantReply = assistantMessages.nth(initialAssistantCount);

    await expect(latestAssistantReply).toBeVisible();

    await latestAssistantReply.evaluate((element) => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    });

    await page.waitForTimeout(3000);
  });

  test('Input clears after message is sent', async () => {
    const chatInput = page.getByPlaceholder('Type message');

    await expect(chatInput).toBeVisible();

    await chatInput.fill('Can you recommend a support service?');

    await expect(chatInput).toHaveValue('Can you recommend a support service?');

    const chatResponse = page.waitForResponse(res => res.url().includes('/api/chat') && res.request().method() === 'POST');
    await page
      .locator('.bg-\\[\\#6B3293\\].text-white.flex.justify-center.items-center.px-4')
      .click();

    await chatResponse;
    await expect(chatInput).toHaveValue('');
  });

  test('Sending with empty input does not trigger an API call', async () => {
    let apiCalled = false;

    page.on('request', (request) => {
      if (request.url().includes('/api/chat') && request.method() === 'POST') {
        apiCalled = true;
      }
    });

    const chatInput = page.getByPlaceholder('Type message');

    await expect(chatInput).toBeVisible();

    await chatInput.fill('');

    await expect(chatInput).toHaveValue('');

    const sendButton = page.locator(
      '.bg-\\[\\#6B3293\\].text-white.flex.justify-center.items-center.px-4'
    );

    if (await sendButton.isEnabled()) {
      await sendButton.click();
    }

    await page.waitForTimeout(1000);

    expect(apiCalled).toBe(false);
  });
});