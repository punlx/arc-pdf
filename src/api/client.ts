// src/api/client.ts

import axios from 'axios';

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  timeout: 10_000,
  // เราจะลบ default header ออกไปจากตรงนี้
  // เพื่อให้ axios สามารถกำหนด Content-Type ที่เหมาะสมให้โดยอัตโนมัติ
  // สำหรับ JSON request และ File upload request
});

// ----- response / error interceptor (ใช้เวอร์ชันล่าสุดที่แก้ไขไปแล้ว) -----
client.interceptors.response.use(
  (r) => r,
  (err) => {
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
