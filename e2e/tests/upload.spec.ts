// e2e/tests/upload.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';

test('@smoke Upload basic PDF', async ({ page }) => {
  // 1) เปิดหน้า Home (baseURL กำหนดใน playwright.config.ts แล้ว)
  await page.goto('/');

  // 2) เตรียม path ของไฟล์ fixture (cross-platform)
  const filePath = path.join(process.cwd(), 'e2e', '__fixtures__', 'sample.pdf');

  /* 3) เลือก <input type="file"> ของ Dropzone
        - use: force = true  แม้ element จะซ่อนอยู่
        - ถ้าโปรเจ็กต์มีหลาย input type file ให้เพิ่ม [accept="application/pdf"]
  */
  const fileInput = page.locator('input[type="file"][accept="application/pdf"]');
  await fileInput.setInputFiles(filePath, { timeout: 10_000 });

  /* 4) รอให้ข้อความ “Uploaded” โผล่มายืนยันว่า mock API สำเร็จ
        (hook เปลี่ยน state หลังอัปโหลดเสร็จ)
  */
  await expect(page.getByText(/uploaded/i)).toBeVisible({ timeout: 10_000 });
});
