import { Page, expect } from '@playwright/test';

export async function loginAs( 

page: Page, 

role: 'participant' | 'coordinator' 

) { 

const credentials = { 

participant: { 

email: 'participant1@ndisportal.com', 

password: 'Test@1234' 

}, 

coordinator: { 

email: 'coordinator@ndisportal.com', 

password: 'Test@1234' 

} 

}; 

await page.goto('/login');

await page.locator('input[type="email"]').fill(credentials[role].email);

await page.locator('input[type="password"]').fill(credentials[role].password);

await page.getByRole('button', { name: 'Log in' }).click();

await expect(page).toHaveURL(role === 'coordinator' ? /.*\/dashboard/ : /.*\/services/, { timeout: 15000 });
}