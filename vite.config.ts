import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(({ mode }) => {
  /* ------------------------------------------------------------------ */
  /* 1) โหลด .env.[mode] แล้ว map ไปที่ process.env (จำเป็นสำหรับ CI) */
  /* ------------------------------------------------------------------ */
  const env = loadEnv(mode, process.cwd(), '');
  const {
    VITE_GIT_SHA = 'local-build',
    SENTRY_AUTH_TOKEN = '',
    SENTRY_ORG = 'arc-pdf',
    SENTRY_PROJECT = 'arc-pdf-frontend',
  } = env;

  const useSentry = !!SENTRY_AUTH_TOKEN; // เปิดเฉพาะตอน build บน CI

  /* ------------------------------------------------------------------ */
  return {
    build: {
      sourcemap: true, // ต้องเปิดเพื่อสร้าง *.map
    },

    plugins: [
      react(),
      tailwindcss(),

      /* =======================================
         Sentry Plugin – ทำงานเฉพาะถ้ามี token
         ======================================= */
      useSentry &&
        sentryVitePlugin({
          authToken: SENTRY_AUTH_TOKEN,
          org: SENTRY_ORG,
          project: SENTRY_PROJECT,

          release: {
            name: VITE_GIT_SHA, // เราใช้ commit hash เป็น release id
            setCommits: { auto: true },
            finalize: true,
          },

          sourcemaps: {
            assets: './dist/**',
            rewriteSources: (src) => (src.startsWith('~/') ? src : `~/${src}`), // ให้ path ใน stack trace ขึ้น “~/…”
          },

          telemetry: false, // ไม่ส่ง usage analytics
          // errorHandler: (e) => console.warn('[Sentry] upload failed', e),
        }),
    ].filter(Boolean), // กรอง falsy (กรณี useSentry = false)

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      host: true,
      port: 5173,
      strictPort: true,
    },
  };
});
