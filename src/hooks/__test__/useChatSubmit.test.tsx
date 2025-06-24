// src/hooks/__test__/useChatSubmit.test.tsx

import { renderHook, act } from '@testing-library/react';
import { useChatSubmit } from '../useChatSubmit';
import { MemoryRouter } from 'react-router-dom';

// --- 1. Mock Dependencies ---
import { useChatStore } from '@/stores/chatStore';
import { useConfigStore } from '@/stores/configStore';
import { useFilesStore } from '@/stores/filesStore';
import { useSessionsStore } from '@/stores/sessionsStore';
import { sendChat } from '@/api/chat';
import { sendChatWS, genTempId } from '@/api/wsChat';
import { client } from '@/api/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid'; // Import uuid

vi.mock('@/stores/chatStore');
vi.mock('@/stores/configStore');
vi.mock('@/stores/filesStore');
vi.mock('@/stores/sessionsStore');
vi.mock('@/api/chat');
vi.mock('@/api/wsChat');
vi.mock('@/api/client');
vi.mock('sonner');
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  useNavigate: vi.fn(),
}));
vi.mock('uuid'); // Mock uuid

// --- 2. สร้าง Mock Functions และ Data ---
const mockNavigate = vi.fn();
const mockAddMessage = vi.fn();
const mockUpdateMessage = vi.fn();
const mockSetSending = vi.fn();
const mockSetChatId = vi.fn();
const mockSetMemory = vi.fn();
const mockSetSessions = vi.fn();
const mockToastWarning = vi.fn();
const mockToastError = vi.fn();
const mockSendChat = vi.mocked(sendChat);
const mockSendChatWS = vi.mocked(sendChatWS);
const mockClientGet = vi.spyOn(client, 'get');

describe('useChatSubmit', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  const renderSubmitHook = () => {
    return renderHook(() => useChatSubmit(), { wrapper });
  };

  // --- 3. ตั้งค่า Mock เริ่มต้น ---
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    vi.mocked(useChatStore).mockImplementation((selector) =>
      selector
        ? selector({
            sending: false,
            addMessage: mockAddMessage,
            updateMessage: mockUpdateMessage,
            setSending: mockSetSending,
            setChatId: mockSetChatId,
            setMemory: mockSetMemory,
          })
        : {
            sending: false,
            addMessage: mockAddMessage,
            updateMessage: mockUpdateMessage,
            setSending: mockSetSending,
            setChatId: mockSetChatId,
            setMemory: mockSetMemory,
          }
    );
    vi.mocked(useConfigStore).mockImplementation((selector) => selector({ useStream: false }));
    vi.mocked(useFilesStore).mockImplementation((selector) => selector({ files: [{ id: '1' }] }));
    vi.mocked(useSessionsStore).mockImplementation((selector) =>
      selector({ setSessions: mockSetSessions })
    );

    mockSendChat.mockResolvedValue({
      id: 'res-id-1',
      answer: 'answer',
      source: 'source',
      chat_id: 'chat-id-1',
      timestamp: '',
    });
    mockClientGet.mockResolvedValue({ data: { chats: [] } });

    vi.mocked(toast, true).warning = mockToastWarning;
    vi.mocked(toast, true).error = mockToastError;

    vi.mocked(genTempId).mockReturnValue('temp-bot-id');
    vi.mocked(uuid).mockReturnValue('temp-user-id');
  });

  // --- 4. Test Cases ---

  it('should not submit if question is empty', async () => {
    const { result } = renderSubmitHook();
    await act(async () => {
      await result.current.submitChat('   ');
    });
    expect(mockSetSending).not.toHaveBeenCalled();
    expect(mockSendChat).not.toHaveBeenCalled();
  });

  it('should not submit if there are no files and should show warning toast', async () => {
    vi.mocked(useFilesStore).mockImplementation((selector) => selector({ files: [] }));
    const { result } = renderSubmitHook();
    await act(async () => {
      await result.current.submitChat('test');
    });
    expect(mockToastWarning).toHaveBeenCalledWith('กรุณาอัปโหลด PDF ก่อนถามคำถาม');
    expect(mockSetSending).not.toHaveBeenCalled();
  });

  describe('REST Path (useStream: false)', () => {
    it('should handle successful submission', async () => {
      const { result } = renderSubmitHook();

      await act(async () => {
        await result.current.submitChat('test question');
      });

      expect(mockSetSending).toHaveBeenCalledWith(true);
      expect(mockAddMessage).toHaveBeenCalledWith({
        id: 'temp-user-id',
        role: 'user',
        text: 'test question',
      });
      expect(mockAddMessage).toHaveBeenCalledWith({ id: 'temp-bot-id', role: 'bot', text: '...' });
      expect(mockSendChat).toHaveBeenCalledWith({ question: 'test question', chat_id: undefined });
      expect(mockUpdateMessage).toHaveBeenCalledWith('temp-bot-id', {
        id: 'res-id-1',
        text: 'answer',
        source: 'source',
      });
      expect(mockClientGet).toHaveBeenCalled();
      expect(mockSetSending).toHaveBeenCalledWith(false);
    });

    it('should handle failed submission', async () => {
      const error = new Error('API Failed');
      mockSendChat.mockRejectedValue(error);
      const { result } = renderSubmitHook();

      await act(async () => {
        await result.current.submitChat('test question');
      });

      expect(mockToastError).toHaveBeenCalledWith('API Failed');
      expect(mockUpdateMessage).toHaveBeenCalledWith('temp-bot-id', {
        text: `❌ ${error.message}`,
      });
      expect(mockClientGet).toHaveBeenCalled();
      expect(mockSetSending).toHaveBeenCalledWith(false);
    });
  });

  describe('WebSocket Path (useStream: true)', () => {
    beforeEach(() => {
      vi.mocked(useConfigStore).mockImplementation((selector) => selector({ useStream: true }));
    });

    it('should call sendChatWS and handle onComplete callback', async () => {
      const { result } = renderSubmitHook();

      await act(async () => {
        await result.current.submitChat('ws question');
      });

      expect(mockSendChatWS).toHaveBeenCalledTimes(1);

      const callbacks = vi.mocked(sendChatWS).mock.calls[0][1];
      const completePayload = {
        id: 'ws-id-1',
        answer: 'ws answer',
        source: 'ws source',
        chat_id: 'ws-chat-1',
      };

      await act(async () => {
        await callbacks.onComplete(completePayload);
      });

      expect(mockUpdateMessage).toHaveBeenCalledWith('temp-bot-id', {
        id: 'ws-id-1',
        text: 'ws answer',
        source: 'ws source',
      });
      expect(mockSetChatId).toHaveBeenCalledWith('ws-chat-1');
      expect(mockNavigate).toHaveBeenCalledWith('/ws-chat-1');
      expect(mockClientGet).toHaveBeenCalled();
      expect(mockSetSending).toHaveBeenCalledWith(false);
    });
  });
});
