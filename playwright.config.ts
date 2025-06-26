import { defineConfig } from '@playwright/test';

export default defineConfig({
  // โฟลเดอร์เทสต์
  testDir: './e2e/tests',

  // baseURL ให้เรียก UI ที่ build/preview ไว้
  use: {
    baseURL: 'http://localhost:4173', // vite preview port
    viewport: { width: 1280, height: 800 },
    trace: 'retain-on-failure', // เปิด trace ตอนล้ม
    screenshot: 'only-on-failure',
    video: 'on',
  },

  // สตาร์ต server (production-like) ก่อนเทสต์
  webServer: {
    command: 'yarn preview --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },

  // MSW global hooks
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',

  //  คอนฟิก CI
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
});
