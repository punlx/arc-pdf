import { test, expect } from '@playwright/test';
import path from 'path';

test('user can upload pdf and ask question', async ({ page }) => {
  // 1. เปิดหน้า Home
  await page.goto('/');

  // 2. อัปโหลด PDF
  const dropzone = page.getByTestId('dropzone');
  await dropzone.setInputFiles(path.resolve(__dirname, '__fixtures__/sample.pdf'));

  // 3. ยืนยันไฟล์แสดงใน Badge + List
  await expect(page.getByText('sample.pdf')).toBeVisible();

  // 4. ถามคำถาม
  const input = page.getByPlaceholder('Ask anything…');
  await input.fill('What is this pdf about?');
  await page.getByTestId('send-icon').click();

  // 5. รอให้ bot ตอบ
  const botBubble = page.getByTestId('message-bubble').last();
  await expect(botBubble).toContainText(/source:/i, { timeout: 15_000 });
});
