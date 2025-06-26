import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
const TIMEOUT = 5_000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PDF_SAMPLE = path.resolve(__dirname, '../__fixtures__/sample.pdf');
const PDF_SAMPLE2 = path.resolve(__dirname, '../__fixtures__/sample2.pdf');
const PDF_SAMPLE3 = path.resolve(__dirname, '../__fixtures__/sample3.pdf');
const PDF_SAMPLE4 = path.resolve(__dirname, '../__fixtures__/sample4.pdf');
const PDF_SAMPLE5 = path.resolve(__dirname, '../__fixtures__/sample5.pdf');
const PDF_SAMPLE6 = path.resolve(__dirname, '../__fixtures__/sample6.pdf');
const PDF_SAMPLE7 = path.resolve(__dirname, '../__fixtures__/sample7.pdf');
const PDF_SAMPLE8 = path.resolve(__dirname, '../__fixtures__/sample8.pdf');
const PDF_SAMPLE9 = path.resolve(__dirname, '../__fixtures__/sample9.pdf');

test.describe('E2E Smoke Test: File Upload Flow', () => {
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

    await page.waitForURL(`**/${chatId}`, { timeout: TIMEOUT });

    const fileTag = page.locator('form').getByText('sample.pdf');
    await expect(fileTag).toBeVisible();

    const toast = page.getByText('Uploaded via Playwright Route');
    await expect(toast).toBeVisible();

    await expect(page).toHaveURL(`/${chatId}`);
  });
});

test.describe('E2E: PDF Upload Flow', () => {
  test('@full Upload multiple PDFs', async ({ page }) => {
    const chatId = uuidv4();

    await page.route('**/api/chat/create', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ chat_id: chatId, message: 'Created' }),
      });
    });

    await page.route(`**/api/upload?chat_id=${chatId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Uploaded multiple via Playwright Route',
          files: [
            {
              id: '1',
              filename: 'sample.pdf',
              size: 1234,
              upload_time: new Date().toISOString(),
            },
            {
              id: '2',
              filename: 'sample2.pdf',
              size: 4321,
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
    await fileInput.setInputFiles([PDF_SAMPLE, PDF_SAMPLE2]);

    await page.waitForURL(`**/${chatId}`, { timeout: TIMEOUT });

    await expect(page.getByText('sample.pdf')).toBeVisible();
    await expect(page.getByText('sample2.pdf')).toBeVisible();

    await expect(page.getByText('Uploaded multiple via Playwright Route')).toBeVisible();

    await expect(page).toHaveURL(`/${chatId}`);
  });

  test('@full smoke Upload 9 PDFs and display count PDFs', async ({ page }) => {
    const chatId = uuidv4();

    const uploadedFiles = [
      { id: '1', filename: 'sample.pdf' },
      { id: '2', filename: 'sample2.pdf' },
      { id: '3', filename: 'sample3.pdf' },
      { id: '4', filename: 'sample4.pdf' },
      { id: '5', filename: 'sample5.pdf' },
      { id: '6', filename: 'sample6.pdf' },
      { id: '7', filename: 'sample7.pdf' },
      { id: '8', filename: 'sample8.pdf' },
      { id: '9', filename: 'sample9.pdf' },
    ];

    await page.route('**/api/chat/create', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ chat_id: chatId, message: 'Created' }),
      });
    });

    await page.route(`**/api/upload?chat_id=${chatId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Uploaded 9 files via Playwright Route',
          files: uploadedFiles.map((f) => ({
            ...f,
            size: 1234,
            upload_time: new Date().toISOString(),
          })),
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
          files: uploadedFiles,
        }),
      });
    });

    await page.goto('/');
    await expect(page.locator('img[alt="upload pdf image"]')).toBeVisible();

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      PDF_SAMPLE,
      PDF_SAMPLE2,
      PDF_SAMPLE3,
      PDF_SAMPLE4,
      PDF_SAMPLE5,
      PDF_SAMPLE6,
      PDF_SAMPLE7,
      PDF_SAMPLE8,
      PDF_SAMPLE9,
    ]);

    await page.waitForURL(`**/${chatId}`, { timeout: TIMEOUT });

    await expect(page.getByText('sample.pdf')).toBeVisible();

    const badge = page.locator('span, button').filter({ hasText: /^\+\d+$/ });
    await expect(badge).toBeVisible();
  });
});
