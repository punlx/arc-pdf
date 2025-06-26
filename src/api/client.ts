import axios from 'axios';
import * as Sentry from '@sentry/react'; // ── Sentry

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  timeout: 10_000,
});

/* ────────────────────────────────────────────────────────────
   Response / Error interceptor
   ──────────────────────────────────────────────────────────── */
client.interceptors.response.use(
  (r) => r,
  (err) => {
    /* ▸ ส่งเข้า Sentry ก่อนแปลงเป็น Error ปกติ */
    Sentry.captureException(err); // ── Sentry

    let errorMsg = 'An unknown error occurred';

    if (axios.isAxiosError(err) && err.response) {
      const detail = err.response.data?.detail;
      const message = err.response.data?.message;

      if (typeof detail === 'string' && detail) {
        errorMsg = detail;
      } else if (typeof message === 'string' && message) {
        errorMsg = message;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMsg = detail[0]?.msg || JSON.stringify(detail[0]);
      } else {
        errorMsg = err.message;
      }
    } else if (err instanceof Error) {
      errorMsg = err.message;
    }

    return Promise.reject(new Error(errorMsg));
  }
);
