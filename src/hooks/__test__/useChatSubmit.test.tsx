import { renderHook, act } from '@testing-library/react';
import { useChatSubmit } from '../useChatSubmit';
import { MemoryRouter } from 'react-router-dom';

import { useChatStore, type ChatState } from '@/stores/chatStore';
import { useConfigStore, type ConfigState } from '@/stores/configStore';
import { useFilesStore, type FilesState } from '@/stores/filesStore';
import { useSessionsStore, type SessionsState } from '@/stores/sessionsStore';
import { sendChat } from '@/api/chat';
import { sendChatWS, genTempId, type WSChunk } from '@/api/wsChat';
import { client } from '@/api/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';

vi.mock('@/stores/chatStore');
vi.mock('@/stores/configStore');
vi.mock('@/stores/filesStore');
vi.mock('@/stores/sessionsStore');
vi.mock('@/api/chat');
vi.mock('@/api/wsChat');
vi.mock('@/api/client');
vi.mock('sonner');
vi.mock(
  'react-router-dom',
  async (importOriginal: () => Promise<typeof import('react-router-dom')>) => {
    const actual = await importOriginal();
    return { ...actual, useNavigate: vi.fn() };
  }
);
vi.mock('uuid');

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

type WsChatCallbacks = {
  onTyping: () => void;
  onChunk: (text: string) => void;
  onComplete: (payload: WSChunk) => Promise<void>;
  onError: (msg: string) => void;
};

describe('useChatSubmit', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );
  const renderSubmitHook = () => renderHook(() => useChatSubmit(), { wrapper });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    vi.mocked(useChatStore).mockImplementation((selector?: (state: ChatState) => any) => {
      const state: Partial<ChatState> = {
        sending: false,
        chatId: undefined,
        addMessage: mockAddMessage,
        updateMessage: mockUpdateMessage,
        setSending: mockSetSending,
        setChatId: mockSetChatId,
        setMemory: mockSetMemory,
      };
      return selector ? selector(state as ChatState) : state;
    });
    vi.mocked(useConfigStore).mockImplementation((selector: (state: ConfigState) => any) =>
      selector({ useStream: false } as ConfigState)
    );
    vi.mocked(useFilesStore).mockImplementation((selector?: (state: FilesState) => any) => {
      const state: Partial<FilesState> = {
        files: [{ id: '1', filename: 'a', size: 1, upload_time: '' }],
      };
      return selector ? selector(state as FilesState) : state;
    });
    vi.mocked(useSessionsStore).mockImplementation((selector: (state: SessionsState) => any) =>
      selector({ setSessions: mockSetSessions } as SessionsState)
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

  describe('WebSocket Path (useStream: true)', () => {
    beforeEach(() => {
      vi.mocked(useConfigStore).mockImplementation((selector: (state: ConfigState) => any) =>
        selector({ useStream: true } as ConfigState)
      );
    });

    it('should call sendChatWS and handle onComplete callback', async () => {
      const { result } = renderSubmitHook();

      await act(() => result.current.submitChat('ws question'));

      expect(mockSendChatWS).toHaveBeenCalledTimes(1);

      const callbacks = vi.mocked(sendChatWS).mock.calls[0][1] as WsChatCallbacks;

      const completePayload: WSChunk = {
        type: 'complete',
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
