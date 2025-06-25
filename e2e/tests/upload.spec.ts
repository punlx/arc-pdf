import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PDF_SAMPLE = path.resolve(__dirname, '../__fixtures__/sample.pdf');

test.describe('Smoke Test: File Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('@smoke Upload basic PDF', async ({ page }) => {
    // 1. ทำการอัปโหลดไฟล์
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(PDF_SAMPLE);

    // 2. ⭐️ รอจนกว่า Tag ชื่อไฟล์ "sample.pdf" จะปรากฏขึ้นในหน้า
    // นี่จะเป็นจุดหลักที่ยืนยันว่ากระบวนการอัปโหลดฝั่ง Frontend สำเร็จ
    // เราหา Tag นี้ภายใน <form> ซึ่งเป็น element ที่ครอบ InputBar อยู่
    const fileTag = page.locator('form').getByText('sample.pdf');
    await expect(fileTag).toBeVisible();

    // 3. เมื่อเห็น Tag ชื่อไฟล์แล้ว จึงตรวจสอบผลกระทบข้างเคียงอื่นๆ
    //    - ตรวจสอบว่า URL เปลี่ยนไปเป็นหน้าแชทใหม่ (รูปแบบ UUID)
    await expect(page).toHaveURL(/\/[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}/i);

    //    - ตรวจสอบว่ามี Toast แจ้งเตือน "Uploaded" แสดงขึ้นมา
    await expect(page.getByText('Uploaded')).toBeVisible();
  });
});
