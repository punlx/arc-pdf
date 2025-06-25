import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PDF_SAMPLE = path.resolve(__dirname, '../__fixtures__/sample.pdf');

test.describe('Smoke Test: File Upload Flow', () => {
  // ไม่ต้องใช้ test.beforeEach แล้ว เพราะเราจะ mock route ก่อน goto
  test('@smoke Upload basic PDF', async ({ page }) => {
    // ---- ⭐️ Mocking API using page.route() ⭐️ ----

    // Mock API สำหรับสร้าง Chat ID
    await page.route('**/api/chat/create', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ chat_id: 'ci-mock-chat-id-from-route' }),
      });
    });

    // Mock API สำหรับอัปโหลดไฟล์ (ใช้ * เป็น wildcard)
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

    // ---- เริ่มขั้นตอนการทดสอบ ----

    // ไปที่หน้าแรก (หลังจาก mock route แล้ว)
    await page.goto('/');

    await expect(page.locator('img[alt="upload pdf image"]')).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(PDF_SAMPLE);

    const fileTag = page.locator('form').getByText('sample.pdf');
    await expect(fileTag).toBeVisible();

    // ตรวจสอบ URL ที่มาจาก mock ของเรา
    await expect(page).toHaveURL('/ci-mock-chat-id-from-route');

    // ตรวจสอบ Toast (อาจจะใช้ข้อความใหม่จาก mock เพื่อความชัดเจน)
    await expect(page.getByText('Uploaded via Playwright Route')).toBeVisible();
  });
});
