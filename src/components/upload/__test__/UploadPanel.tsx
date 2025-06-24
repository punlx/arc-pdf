// src/components/upload/__test__/UploadPanel.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadPanel } from '../UploadPanel';

import { useFilesStore, type UploadFileMeta } from '@/stores/filesStore';
import { useIsMobile } from '@/hooks/useMobile';
import { TooltipProvider } from '@/components/ui/tooltip';

vi.mock('../UploadPanel/DropZone', () => ({ DropZone: () => <div data-testid="drop-zone" /> }));
vi.mock('../UploadPanel/FileList', () => ({ FileList: () => <div data-testid="file-list" /> }));
vi.mock('@/stores/filesStore');
vi.mock('@/hooks/use-mobile');

const mockFiles: UploadFileMeta[] = [
  { id: 'file-1', filename: 'file1.pdf', size: 100 },
  { id: 'file-2', filename: 'file2.pdf', size: 200 },
  { id: 'file-3', filename: 'file3.pdf', size: 300 },
];

// --- 1. สร้างฟังก์ชันสำหรับ Mock offsetWidth ---
// ฟังก์ชันนี้จะ Mock getter ของ offsetWidth ให้คืนค่าตามเงื่อนไขที่เรากำหนด
const mockOffsetWidths = (widths: { container: number; tag: number; badge: number }) => {
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get: function () {
      // คืนค่าความกว้างของ container หลัก
      if (this.classList.contains('flex-1')) {
        return widths.container;
      }
      // คืนค่าความกว้างของแท็กไฟล์
      if (this.classList.contains('rounded-full') && this.textContent?.includes('.pdf')) {
        return widths.tag;
      }
      // คืนค่าความกว้างของปุ่ม +n
      if (this.textContent?.startsWith('+')) {
        return widths.badge;
      }
      return 0;
    },
  });
  return () => {
    // ฟังก์ชันสำหรับ Cleanup/Restore ค่าเดิม
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth!);
  };
};

describe('<UploadPanel />', () => {
  let user;
  let cleanupMock: () => void;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    vi.mocked(useIsMobile).mockReturnValue(false); // Default to desktop
  });

  afterEach(() => {
    // Restore offsetWidth เดิมหลังจบแต่ละเทสต์
    if (cleanupMock) cleanupMock();
  });

  it('should render all tags when they fit', async () => {
    // Arrange: container กว้างมาก (600), tag กว้าง 100 -> ควรจะพอดี 3 อัน
    cleanupMock = mockOffsetWidths({ container: 600, tag: 100, badge: 40 });
    vi.mocked(useFilesStore).mockImplementation((selector) => selector({ files: mockFiles }));

    render(
      <TooltipProvider>
        <UploadPanel />
      </TooltipProvider>
    );

    // Act & Assert: ใช้ waitFor เพื่อรอให้ re-render จาก useLayoutEffect ทำงานเสร็จ
    await waitFor(() => {
      expect(screen.getByText('file1.pdf')).toBeInTheDocument();
      expect(screen.getByText('file2.pdf')).toBeInTheDocument();
      expect(screen.getByText('file3.pdf')).toBeInTheDocument();
      // ไม่ควรมีปุ่ม +n
      expect(screen.queryByText(/\+\d+/)).not.toBeInTheDocument();
    });
  });

  it('should render subset of tags and a badge when overflowing', async () => {
    // Arrange: container กว้างน้อย (250), tag กว้าง 100 -> ควรจะแสดงได้ 2 อัน
    cleanupMock = mockOffsetWidths({ container: 250, tag: 100, badge: 40 });
    vi.mocked(useFilesStore).mockImplementation((selector) => selector({ files: mockFiles }));

    render(
      <TooltipProvider>
        <UploadPanel />
      </TooltipProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('file1.pdf')).toBeInTheDocument();
      expect(screen.getByText('file2.pdf')).toBeInTheDocument();
      expect(screen.queryByText('file3.pdf')).not.toBeInTheDocument();
      // ควรมีปุ่ม +1 (มี 3 ไฟล์, แสดง 2, ซ่อน 1)
      expect(screen.getByText('+1')).toBeInTheDocument();
    });
  });

  it('should open Popover on badge click when overflowing on desktop', async () => {
    // Arrange
    cleanupMock = mockOffsetWidths({ container: 250, tag: 100, badge: 40 });
    vi.mocked(useFilesStore).mockImplementation((selector) => selector({ files: mockFiles }));
    vi.mocked(useIsMobile).mockReturnValue(false);

    render(
      <TooltipProvider>
        <UploadPanel />
      </TooltipProvider>
    );

    // Act: รอให้ปุ่ม +1 แสดงขึ้นมาก่อน แล้วค่อยคลิก
    const badge = await screen.findByText('+1');
    await user.click(badge);

    // Assert: Popover ควรจะเปิดขึ้นมา
    await waitFor(() => {
      expect(screen.getByText('All files (3)')).toBeInTheDocument();
      expect(screen.getByTestId('file-list')).toBeInTheDocument();
    });
  });
});
