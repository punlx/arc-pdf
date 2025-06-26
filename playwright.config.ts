import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // โฟลเดอร์เทสต์
  testDir: './e2e/tests',

  // รีเทรนเมื่อ fail เฉพาะใน CI
  retries: process.env.CI ? 2 : 0,

  // จำกัด worker ใน CI เหลือแค่ 1
  workers: process.env.CI ? 1 : undefined,

  // สตาร์ตเซิร์ฟเวอร์ก่อนเทสต์ (vite preview)
  webServer: {
    command: 'yarn preview --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },

  // MSW global setup/teardown
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',

  // โปรเจกต์สำหรับ browser แต่ละตัว (ใช้ร่วมกับ matrix.browser ใน CI ได้)
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4173',
        viewport: { width: 1280, height: 800 },
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'on',
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: 'http://localhost:4173',
        viewport: { width: 1280, height: 800 },
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'on',
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        baseURL: 'http://localhost:4173',
        viewport: { width: 1280, height: 800 },
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'on',
      },
    },
  ],
});
