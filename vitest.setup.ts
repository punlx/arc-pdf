// vitest.setup.ts

import '@testing-library/jest-dom';

// -------------------------------------------------------------
// Mock #1: ResizeObserver (ตัวเดิม)
// -------------------------------------------------------------
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// -------------------------------------------------------------
// Mock #2: window.matchMedia (ที่เพิ่มเข้ามาใหม่)
// -------------------------------------------------------------
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false, // ทำให้ค่า default ของ useIsMobile เป็น false (desktop)
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
