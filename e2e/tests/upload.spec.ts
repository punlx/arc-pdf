import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PDF_SAMPLE = path.resolve(__dirname, '../__fixtures__/sample.pdf');

test.describe('Smoke Test: File Upload Flow', () => {
  test('@smoke Upload basic PDF', async ({ page }) => {
    // ---- Mocking ALL necessary APIs ----

    await page.route('**/api/chat/create', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ chat_id: 'ci-mock-chat-id-from-route' }),
      });
    });

    await page.route('**/api/upload?chat_id=*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Uploaded via Playwright Route',
          files: [
            { id: '1', filename: 'sample.pdf', size: 1234, upload_time: new Date().toISOString() },
          ],
        }),
      });
    });

    // 👇 ⭐️ เพิ่ม Mock ที่ขาดไปสำหรับ useChatHistory ⭐️
    await page.route('**/api/chat/ci-mock-chat-id-from-route', async (route) => {
      // สำหรับแชทใหม่ ประวัติการแชทควรจะว่างเปล่า
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ messages: [] }),
      });
    });

    // --- เริ่มขั้นตอนการทดสอบ ---

    await page.goto('/');
    await expect(page.locator('img[alt="upload pdf image"]')).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(PDF_SAMPLE);

    // รอให้ URL เปลี่ยนไปก่อน
    await page.waitForURL('**/ci-mock-chat-id-from-route');

    // ตรวจสอบ UI บนหน้าใหม่
    const fileTag = page.locator('form').getByText('sample.pdf');
    await expect(fileTag).toBeVisible();

    const toast = page.getByText('Uploaded via Playwright Route');
    await expect(toast).toBeVisible();

    // ตรวจสอบ URL อีกครั้งตอนท้ายสุด
    await expect(page).toHaveURL('/ci-mock-chat-id-from-route');
  });
});
