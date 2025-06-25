// e2e/tests/upload.spec.ts
import { test, expect } from '@playwright/test';
import path from 'node:path';

test('@smoke Upload basic PDF', async ({ page }) => {
  /* 1. mock API ด้วย playwright.route (ก่อนเปิดหน้า) */
  await page.route('**/api/upload', (route) =>
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

  /* 2. เลือกไฟล์ (element ถูกซ่อน => ใช้ force) */
  const filePath = path.join(process.cwd(), 'e2e', '__fixtures__', 'sample.pdf');
  const fileInput = page.locator('input[type="file"][accept="application/pdf"]');
  await fileInput.setInputFiles(filePath, { force: true });

  /* 3. รอ response / หรือรอข้อความก็ได้ */
  await page.waitForResponse((r) => r.url().includes('/api/upload') && r.status() === 200);

  // ถ้ายังอยากเช็ก UI ด้วย ให้เพิ่ม timeout เผื่อ repaint
  await expect(page.getByText(/uploaded/i)).toBeVisible({ timeout: 5_000 });
});
