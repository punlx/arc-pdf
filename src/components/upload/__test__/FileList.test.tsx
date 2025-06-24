// src/components/upload/__test__/FileList.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileList } from '../UploadPanel/FileList';

import { useChatStore, type ChatState } from '@/stores/chatStore'; // 🆕 Import State type
import { useFilesStore, type UploadFileMeta, type FilesState } from '@/stores/filesStore'; // 🆕 Import State type
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

const mockFileStoreState: Partial<FilesState> = {
  files: mockFiles,
  deleteById: mockDeleteById,
};

const mockChatStoreState: Partial<ChatState> = {
  chatId: 'chat-123',
};

describe('<FileList />', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 🆕 เพิ่ม Type ให้ selector และ cast state
    vi.mocked(useFilesStore).mockImplementation((selector: (state: FilesState) => any) =>
      selector(mockFileStoreState as FilesState)
    );
    vi.mocked(useChatStore).mockImplementation((selector: (state: ChatState) => any) =>
      selector(mockChatStoreState as ChatState)
    );

    vi.mocked(deleteFile).mockResolvedValue(undefined);
    vi.mocked(toast, true).success = mockToastSuccess;
    vi.mocked(toast, true).error = mockToastError;
  });

  describe('Rendering', () => {
    it('should render a list of files when files exist', () => {
      render(<FileList />);
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
      expect(screen.getByText('10.0 KB')).toBeInTheDocument();
    });

    it('should render "no files" message when the file list is empty', () => {
      // 🆕 เพิ่ม Type ให้ selector และ cast state
      vi.mocked(useFilesStore).mockImplementation((selector: (state: FilesState) => any) =>
        selector({ files: [], deleteById: mockDeleteById } as unknown as FilesState)
      );
      render(<FileList />);
      expect(screen.getByText(/ยังไม่มีไฟล์ที่อัปโหลด/i)).toBeInTheDocument();
    });
  });
});
