import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom';
import * as Sentry from '@sentry/react';
import App from './App';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import './index.css';

const isDev = import.meta.env.DEV;

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN, // ← DSN จริงใน .env
  release: import.meta.env.VITE_GIT_SHA, // commit hash / tag
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: Number(import.meta.env.VITE_TRACE_RATE) || (isDev ? 1 : 0.2),
  replaysSessionSampleRate: Number(import.meta.env.VITE_REPLAY_RATE) || (isDev ? 0.1 : 0.02),
  replaysOnErrorSampleRate: 1.0,
  environment: isDev ? 'development' : 'production',
  // sendDefaultPii: true,          // เปิดถ้าต้องการเก็บ IP / user cookie
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App /> {/* ⬅️ ไม่ต้องห่อ SentryRoutes */}
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
