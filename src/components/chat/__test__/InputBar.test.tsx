// src/components/chat/__test__/InputBar.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputBar } from '../InputBar';
import { MemoryRouter } from 'react-router-dom';
import type { UserEvent } from '@testing-library/user-event'; // 🆕 Import UserEvent type

// --- 1. Mock Dependencies ---
import { useChatSubmit } from '@/hooks/useChatSubmit';
import { useFilesStore, type FilesState } from '@/stores/filesStore'; // 🆕 Import State type
import { useChatStore, type ChatState } from '@/stores/chatStore'; // 🆕 Import State type

vi.mock('@/hooks/useChatSubmit');
vi.mock('@/stores/filesStore');
vi.mock('@/stores/chatStore');
vi.mock('../upload/UploadPanel', () => ({
  UploadPanel: () => <div data-testid="upload-panel" />,
}));

// --- 2. สร้าง Mock Functions และ State ---
const mockSubmitChat = vi.fn();

const mockFileStoreState: Partial<FilesState> = {
  files: [{ id: 'file-1', filename: 'test.pdf', size: 123, upload_time: '' }],
};

const mockChatStoreState: Partial<ChatState> = {
  messages: [],
  chatId: 'test-chat-id',
  setChatId: vi.fn(),
};

describe('<InputBar />', () => {
  let user: UserEvent; // 🆕 กำหนด Type ให้ user

  // --- 3. ตั้งค่า Mock เริ่มต้น ---
  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();

    vi.mocked(useChatSubmit).mockReturnValue({
      isSubmitting: false,
      submitChat: mockSubmitChat,
    });

    // 🆕 เพิ่ม Type ให้กับ 'selector' และจัดการ state
    vi.mocked(useFilesStore).mockImplementation((selector?: (state: FilesState) => any) => {
      return selector
        ? selector(mockFileStoreState as FilesState)
        : (mockFileStoreState as FilesState);
    });

    // 🆕 เพิ่ม Type ให้กับ 'selector' และจัดการ state
    vi.mocked(useChatStore).mockImplementation((selector?: (state: ChatState) => any) => {
      return selector
        ? selector(mockChatStoreState as ChatState)
        : (mockChatStoreState as ChatState);
    });
  });

  // --- 4. Test Cases (เพิ่ม <MemoryRouter> ในทุก render) ---

  it('should allow user to type in the input', async () => {
    render(
      <MemoryRouter>
        <InputBar />
      </MemoryRouter>
    );
    const input = screen.getByPlaceholderText('Ask anything...');
    await user.type(input, 'Hello, world!');
    expect(input).toHaveValue('Hello, world!');
  });

  describe('Submit Button State', () => {
    it('should be disabled initially when text is empty', () => {
      render(
        <MemoryRouter>
          <InputBar />
        </MemoryRouter>
      );
      const submitButton = screen.getByRole('button');
      expect(submitButton).toBeDisabled();
    });

    it('should be disabled if there is text but no files', async () => {
      // Override mock: ไม่มีไฟล์
      vi.mocked(useFilesStore).mockImplementation((selector?: (state: FilesState) => any) => {
        const emptyState = { files: [] };
        return selector
          ? selector(emptyState as unknown as FilesState)
          : (emptyState as unknown as FilesState);
      });

      render(
        <MemoryRouter>
          <InputBar />
        </MemoryRouter>
      );
      const input = screen.getByPlaceholderText('Ask anything...');
      await user.type(input, 'test');
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should be enabled when there is text and files', async () => {
      render(
        <MemoryRouter>
          <InputBar />
        </MemoryRouter>
      );
      const input = screen.getByPlaceholderText('Ask anything...');
      await user.type(input, 'test');
      expect(screen.getByRole('button')).toBeEnabled();
    });

    it('should be disabled and show loader when submitting', () => {
      vi.mocked(useChatSubmit).mockReturnValue({
        isSubmitting: true,
        submitChat: mockSubmitChat,
      });
      render(
        <MemoryRouter>
          <InputBar />
        </MemoryRouter>
      );
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('send-icon')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call submitChat with trimmed text and clear input on submit', async () => {
      render(
        <MemoryRouter>
          <InputBar />
        </MemoryRouter>
      );
      const input = screen.getByPlaceholderText('Ask anything...');
      const submitButton = screen.getByRole('button');

      await user.type(input, '  some question  ');
      await user.click(submitButton);

      expect(mockSubmitChat).toHaveBeenCalledTimes(1);
      expect(mockSubmitChat).toHaveBeenCalledWith('some question');
      expect(input).toHaveValue('');
    });

    it('should not call submitChat if text is empty', async () => {
      render(
        <MemoryRouter>
          <InputBar />
        </MemoryRouter>
      );
      const submitButton = screen.getByRole('button');
      await user.click(submitButton);
      expect(mockSubmitChat).not.toHaveBeenCalled();
    });
  });
});
