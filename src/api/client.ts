// src\api\client.ts

import axios from 'axios';

/**
 * Axios instance กลางของแอป
 * - baseURL ดึงจาก .env หรือ fallback เป็น localhost:8000
 * - ใส่ timeout + default header
 * - จัด intercept response ให้โยนข้อความ error อ่านง่าย
 */
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ----- response / error interceptor -----
client.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg =
      err?.response?.data?.detail || err?.response?.data?.message || err.message || 'Unknown error';
    return Promise.reject(new Error(msg));
  }
);
