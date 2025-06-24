// src/components/chat/__test__/InputBar.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputBar } from '../InputBar';
import { MemoryRouter } from 'react-router-dom'; // 🆕 Import MemoryRouter

// --- 1. Mock Dependencies ---
import { useChatSubmit } from '@/hooks/useChatSubmit';
import { useFilesStore } from '@/stores/filesStore';
import { useChatStore } from '@/stores/chatStore';

vi.mock('@/hooks/useChatSubmit');
vi.mock('@/stores/filesStore');
vi.mock('@/stores/chatStore');
vi.mock('../upload/UploadPanel', () => ({
  UploadPanel: () => <div data-testid="upload-panel" />,
}));

// --- 2. สร้าง Mock Functions และ State ---
const mockSubmitChat = vi.fn();

const mockFileStoreState = {
  files: [{ id: 'file-1', filename: 'test.pdf', size: 123, upload_time: '' }],
};
const mockChatStoreState = {
  messages: [],
  chatId: 'test-chat-id',
  setChatId: vi.fn(),
};

describe('<InputBar />', () => {
  let user;

  // --- 3. ตั้งค่า Mock เริ่มต้น ---
  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();

    vi.mocked(useChatSubmit).mockReturnValue({
      isSubmitting: false,
      submitChat: mockSubmitChat,
    });

    vi.mocked(useFilesStore).mockImplementation((selector) => {
      return selector ? selector(mockFileStoreState) : mockFileStoreState;
    });

    vi.mocked(useChatStore).mockImplementation((selector) => {
      return selector ? selector(mockChatStoreState) : mockChatStoreState;
    });
  });

  // --- 4. Test Cases (เพิ่ม <MemoryRouter> ในทุก render) ---

  it('should allow user to type in the input', async () => {
    // 🔄 ห่อด้วย MemoryRouter
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
      vi.mocked(useFilesStore).mockImplementation((selector) =>
        selector ? selector({ files: [] }) : { files: [] }
      );
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
