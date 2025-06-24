// src/components/chat/__test__/ChatWindow.test.tsx

import { render, screen } from '@testing-library/react';
import { ChatWindow } from '../ChatWindow';
import { useChatStore, type Message, type ChatState } from '@/stores/chatStore'; // 🆕 Import State type

// Mock Child Component
vi.mock('../ChatWindow/MessageBubble', () => ({
  MessageBubble: ({ m }: { m: Message }) => <div data-testid="message-bubble">{m.text}</div>,
}));

// Mock Zustand Store
vi.mock('@/stores/chatStore');

const mockMessages: Message[] = [
  { id: '1', role: 'user', text: 'First message' },
  { id: '2', role: 'bot', text: 'Second message' },
];

describe('<ChatWindow />', () => {
  const mockScrollIntoView = vi.fn();

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    vi.clearAllMocks();
  });

  it('should render placeholder text when there are no messages', () => {
    // Arrange: 🆕 เพิ่ม Type ให้กับ 'selector'
    vi.mocked(useChatStore).mockImplementation((selector: (state: ChatState) => any) =>
      selector({ messages: [] } as unknown as ChatState)
    );

    // Act
    render(<ChatWindow />);

    // Assert
    expect(screen.getByText(/What do you want to know about this PDF?/i)).toBeInTheDocument();
    expect(screen.queryByTestId('message-bubble')).not.toBeInTheDocument();
  });

  it('should render message bubbles when messages exist', () => {
    // Arrange
    const mockState = { messages: mockMessages };
    // 🆕 เพิ่ม Type ให้กับ 'selector'
    vi.mocked(useChatStore).mockImplementation((selector: (state: ChatState) => any) =>
      selector(mockState as ChatState)
    );

    // Act
    render(<ChatWindow />);

    // Assert
    const bubbles = screen.getAllByTestId('message-bubble');
    expect(bubbles).toHaveLength(2);
    expect(bubbles[0]).toHaveTextContent('First message');
    expect(bubbles[1]).toHaveTextContent('Second message');
  });

  it('should call scrollIntoView on initial render', () => {
    // Arrange
    const mockState = { messages: mockMessages };
    // 🆕 เพิ่ม Type ให้กับ 'selector'
    vi.mocked(useChatStore).mockImplementation((selector: (state: ChatState) => any) =>
      selector(mockState as ChatState)
    );

    // Act
    render(<ChatWindow />);

    // Assert
    expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('should call scrollIntoView again when messages array is updated', () => {
    // Arrange: เริ่มต้นด้วย 1 ข้อความ
    const initialState = { messages: [mockMessages[0]] };
    // 🆕 เพิ่ม Type ให้กับ 'selector'
    vi.mocked(useChatStore).mockImplementation((selector: (state: ChatState) => any) =>
      selector(initialState as ChatState)
    );
    const { rerender } = render(<ChatWindow />);

    expect(mockScrollIntoView).toHaveBeenCalledTimes(1);

    // Act: อัปเดต state และ re-render
    const updatedState = { messages: mockMessages };
    // 🆕 เพิ่ม Type ให้กับ 'selector'
    vi.mocked(useChatStore).mockImplementation((selector: (state: ChatState) => any) =>
      selector(updatedState as ChatState)
    );
    rerender(<ChatWindow />);

    // Assert
    expect(mockScrollIntoView).toHaveBeenCalledTimes(2);
  });
});
