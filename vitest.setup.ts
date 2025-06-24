// vitest.setup.ts

import '@testing-library/jest-dom';

// Mock #1: ResizeObserver (ตัวเดิม)
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// Mock #2: window.matchMedia (ฉบับแก้ไข)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  // 🆕 เพิ่ม Type 'string' ให้กับพารามิเตอร์ query
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
