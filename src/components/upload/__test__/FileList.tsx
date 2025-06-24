// src/components/upload/__test__/FileList.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileList } from '../UploadPanel/FileList';

import { useChatStore } from '@/stores/chatStore';
import { useFilesStore, type UploadFileMeta } from '@/stores/filesStore';
import { deleteFile } from '@/api/files';
import { toast } from 'sonner';

vi.mock('@/stores/chatStore');
vi.mock('@/stores/filesStore');
vi.mock('@/api/files');
vi.mock('sonner');

const mockDeleteById = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

const mockFiles: UploadFileMeta[] = [
  { id: 'file-1', filename: 'document.pdf', size: 10240, upload_time: '' },
  { id: 'file-2', filename: 'report.pdf', size: 20480, upload_time: '' },
];

const mockFileStoreState = {
  files: mockFiles,
  deleteById: mockDeleteById,
};

// 🆕 สร้าง state จำลองสำหรับ Chat Store
const mockChatStoreState = {
  chatId: 'chat-123',
};

describe('<FileList />', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // ตั้งค่า Mock สำหรับ Store ทั้งสองด้วย mockImplementation
    vi.mocked(useFilesStore).mockImplementation((selector) => selector(mockFileStoreState));
    // 🔄 แก้ไข mock ของ useChatStore ให้ใช้ mockImplementation
    vi.mocked(useChatStore).mockImplementation((selector) => selector(mockChatStoreState));

    vi.mocked(deleteFile).mockResolvedValue(undefined);
    vi.mocked(toast, true).success = mockToastSuccess;
    vi.mocked(toast, true).error = mockToastError;
  });

  // ส่วนของ Rendering (เหมือนเดิมและผ่านแล้ว)
  describe('Rendering', () => {
    it('should render a list of files when files exist', () => {
      render(<FileList />);
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
      expect(screen.getByText('10.0 KB')).toBeInTheDocument();
    });

    it('should render "no files" message when the file list is empty', () => {
      vi.mocked(useFilesStore).mockImplementation((selector) =>
        selector({ files: [], deleteById: mockDeleteById })
      );
      render(<FileList />);
      expect(screen.getByText(/ยังไม่มีไฟล์ที่อัปโหลด/i)).toBeInTheDocument();
    });
  });

  describe('File Deletion', () => {
    it('should call deleteFile, update store, and show success toast on successful deletion', async () => {
      const user = userEvent.setup();
      render(<FileList />);

      const deleteButton = screen.getByLabelText('delete file document.pdf');
      await user.click(deleteButton);

      await waitFor(() => {
        // ตอนนี้ component จะได้รับ 'chat-123' เป็น string ที่ถูกต้อง
        expect(deleteFile).toHaveBeenCalledWith('chat-123', 'file-1');
        expect(mockDeleteById).toHaveBeenCalledWith('file-1');
        expect(mockToastSuccess).toHaveBeenCalledWith('ไฟล์ถูกลบ');
      });
    });

    it('should show error toast and not update store when API fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'API Server Error';
      vi.mocked(deleteFile).mockRejectedValue(new Error(errorMessage));

      render(<FileList />);

      const deleteButton = screen.getByLabelText('delete file document.pdf');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(errorMessage);
        expect(mockDeleteById).not.toHaveBeenCalled();
      });
    });

    it('should show error toast and not call API when chatId is null', async () => {
      const user = userEvent.setup();
      // 🔄 Override mock ของ useChatStore สำหรับ test case นี้โดยเฉพาะ
      vi.mocked(useChatStore).mockImplementation((selector) => selector({ chatId: null }));

      render(<FileList />);

      const deleteButton = screen.getByLabelText('delete file document.pdf');
      await user.click(deleteButton);

      await waitFor(() => {
        // ตอนนี้ component จะได้รับ null จริงๆ และ toast.error จะถูกเรียก
        expect(mockToastError).toHaveBeenCalledWith('No chat');
        expect(deleteFile).not.toHaveBeenCalled();
      });
    });
  });
});
