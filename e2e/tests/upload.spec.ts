import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PDF_SAMPLE = path.resolve(__dirname, '../__fixtures__/sample.pdf');

test.describe('Smoke Test: File Upload Flow', () => {
  test('@smoke Upload basic PDF', async ({ page }) => {
    const chatId = uuidv4();

    await page.route('**/api/chat/create', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ chat_id: chatId, message: 'Created' }), // ✅ add message
      });
    });

    await page.route(`**/api/upload?chat_id=${chatId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Uploaded via Playwright Route',
          files: [
            {
              id: '1',
              filename: 'sample.pdf',
              size: 1234,
              upload_time: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await page.route(`**/api/chat/${chatId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          chat_id: chatId,
          messages: [],
          message_count: 0,
        }),
      });
    });

    await page.goto('/');
    await expect(page.locator('img[alt="upload pdf image"]')).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(PDF_SAMPLE);

    await page.waitForURL(`**/${chatId}`, { timeout: 15_000 });

    const fileTag = page.locator('form').getByText('sample.pdf');
    await expect(fileTag).toBeVisible();

    const toast = page.getByText('Uploaded via Playwright Route');
    await expect(toast).toBeVisible();

    await expect(page).toHaveURL(`/${chatId}`);
  });
});
