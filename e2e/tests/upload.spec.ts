// e2e/tests/upload.spec.ts
import { test, expect } from '@playwright/test';
import path from 'node:path';

test('@smoke Upload basic PDF', async ({ page }) => {
  /* 1. Mock API ไว้ก่อนเข้าเว็บ */
  await page.route(/\/api\/upload$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Uploaded',
        files: [{ id: '1', filename: 'sample.pdf', size: 1234 }],
      }),
    })
  );

  await page.goto('/');

  /* 2. ใส่ไฟล์ (input ถูกซ่อน ใช้ force) */
  const filePath = path.join(process.cwd(), 'e2e', '__fixtures__', 'sample.pdf');
  await page
    .locator('input[type="file"][accept="application/pdf"]')
    .setInputFiles(filePath, { force: true });

  /* 3. กดปุ่ม Upload ให้ Dropzone เริ่ม fetch */
  await page.getByRole('button', { name: /upload/i }).click();

  /* 4. ยืนยันว่าคำขอถูก mock สำเร็จ */
  await page.waitForResponse((r) => r.url().endsWith('/api/upload') && r.status() === 200, {
    timeout: 30_000,
  });

  /* 5. (เสริม) เช็กข้อความบนหน้าด้วยก็ได้ */
  await expect(page.getByText(/uploaded/i)).toBeVisible({ timeout: 30_000 });
});
