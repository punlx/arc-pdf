// src/components/upload/__test__/UploadPanel.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadPanel } from '../UploadPanel';
import type { UserEvent } from '@testing-library/user-event'; // 🆕

// --- 1. Mock Dependencies ---
import { useFilesStore, type UploadFileMeta, type FilesState } from '@/stores/filesStore'; // 🆕
import { useIsMobile } from '@/hooks/useMobile';
import { TooltipProvider } from '@/components/ui/tooltip';

vi.mock('../UploadPanel/DropZone', () => ({ DropZone: () => <div data-testid="drop-zone" /> }));
vi.mock('../UploadPanel/FileList', () => ({ FileList: () => <div data-testid="file-list" /> }));
vi.mock('@/stores/filesStore');
vi.mock('@/hooks/useMobile');

// --- 2. สร้างข้อมูล Mock ที่สมบูรณ์ ---
const mockFiles: UploadFileMeta[] = [
  // 🆕 เพิ่ม property 'upload_time' ที่ขาดไป
  { id: 'file-1', filename: 'file1.pdf', size: 100, upload_time: '2025-01-01T12:00:00Z' },
  { id: 'file-2', filename: 'file2.pdf', size: 200, upload_time: '2025-01-01T12:00:00Z' },
  { id: 'file-3', filename: 'file3.pdf', size: 300, upload_time: '2025-01-01T12:00:00Z' },
];

describe('<UploadPanel />', () => {
  let user: UserEvent; // 🆕
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');

  // ใช้ beforeAll/afterAll สำหรับ mock ที่ทำครั้งเดียว
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get: function () {
        if (this.classList.contains('flex-1')) return 500;
        if (this.classList.contains('rounded-full') && this.textContent?.includes('.pdf'))
          return 120;
        if (this.textContent?.startsWith('+')) return 40;
        return 0;
      },
    });
  });
  afterAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth!);
  });

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    vi.mocked(useIsMobile).mockReturnValue(false);
  });

  // ไม่จำเป็นต้องมี afterEach สำหรับ cleanupMock อีกต่อไป

  it('renders DropZone and no file tags when there are no files', () => {
    // 🆕 เพิ่ม Type ให้ selector
    vi.mocked(useFilesStore).mockImplementation((selector: (state: FilesState) => any) =>
      selector({ files: [] } as unknown as FilesState)
    );
    render(
      <TooltipProvider>
        <UploadPanel />
      </TooltipProvider>
    );

    expect(screen.getByTestId('drop-zone')).toBeInTheDocument();
    expect(screen.queryByText(/file1.pdf/)).not.toBeInTheDocument();
  });

  it('renders all file tags when they fit in the container', async () => {
    vi.mocked(useFilesStore).mockImplementation((selector: (state: FilesState) => any) =>
      selector({ files: mockFiles } as FilesState)
    );
    render(
      <TooltipProvider>
        <UploadPanel />
      </TooltipProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('file1.pdf')).toBeInTheDocument();
      expect(screen.getByText('file2.pdf')).toBeInTheDocument();
      expect(screen.getByText('file3.pdf')).toBeInTheDocument();
      expect(screen.queryByText(/\+\d+/)).not.toBeInTheDocument();
    });
  });

  describe('when files overflow', () => {
    beforeEach(() => {
      // Override offsetWidth สำหรับกลุ่ม test นี้
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
        configurable: true,
        get: function () {
          if (this.classList.contains('flex-1')) return 250; // container กว้างน้อยลง
          if (this.classList.contains('rounded-full') && this.textContent?.includes('.pdf'))
            return 120;
          if (this.textContent?.startsWith('+')) return 40;
          return 0;
        },
      });
      vi.mocked(useFilesStore).mockImplementation((selector: (state: FilesState) => any) =>
        selector({ files: mockFiles } as FilesState)
      );
    });

    it('opens a Popover on badge click on desktop', async () => {
      vi.mocked(useIsMobile).mockReturnValue(false);
      render(
        <TooltipProvider>
          <UploadPanel />
        </TooltipProvider>
      );

      const badge = await screen.findByText('+1');
      await user.click(badge);

      await waitFor(() => {
        expect(screen.getByText('All files (3)')).toBeInTheDocument();
        expect(screen.getByTestId('file-list')).toBeInTheDocument();
      });
    });
  });
});
