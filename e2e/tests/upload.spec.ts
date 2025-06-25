// e2e/tests/upload.spec.ts
import { test, expect } from '@playwright/test';
import path from 'node:path';

test('@smoke Upload basic PDF', async ({ page }) => {
  /* 1) Mock API อัปโหลด (จับทุกโปรโตคอล/โฮสต์) ---------------------- */
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

  /* 2) เปิดหน้า Home --------------------------------------------------- */
  await page.goto('/');

  /* 3) ใส่ไฟล์ PDF ลง <input type="file"> ------------------------------ */
  const filePath = path.join(process.cwd(), 'e2e', '__fixtures__', 'sample.pdf');

  await page.locator('input[type="file"][accept="application/pdf"]').setInputFiles(filePath); // ไม่มี options ก็พอ

  /* 4) รอให้ UI แสดง “Uploaded” --------------------------------------- */
  await expect(page.getByText(/uploaded/i)).toBeVisible({ timeout: 10_000 });
});
