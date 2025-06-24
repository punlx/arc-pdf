// src/components/chat/__test__/MessageBubble.test.tsx

import { render, screen } from '@testing-library/react';
import { MessageBubble } from '../ChatWindow/MessageBubble';
import type { Message } from '@/stores/chatStore';

// --- 1. สร้างข้อมูล Mock สำหรับแต่ละสถานการณ์ ---

const userMessage: Message = {
  id: 'user-1',
  role: 'user',
  text: 'Hello, this is a user.',
};

const botMessage: Message = {
  id: 'bot-1',
  role: 'bot',
  text: 'Hello, I am a bot.',
};

const botMessageWithSource: Message = {
  id: 'bot-2',
  role: 'bot',
  text: 'This is the answer.',
  source: 'source-document.pdf',
};

const botTypingMessage: Message = {
  id: 'bot-typing',
  role: 'bot',
  text: '...',
};

describe('<MessageBubble />', () => {
  // --- 2. เริ่ม Test Cases ---

  it('should render user message correctly', () => {
    render(<MessageBubble m={userMessage} />);

    // แสดงข้อความถูกต้อง
    expect(screen.getByText(userMessage.text)).toBeInTheDocument();

    // มี class สำหรับ user (ชิดขวา)
    const bubble = screen.getByTestId('message-bubble');
    expect(bubble).toHaveClass('ml-auto bg-primary');

    // ไม่มีส่วนของ source
    expect(screen.queryByTestId('message-source')).not.toBeInTheDocument();
  });

  it('should render bot message correctly', () => {
    render(<MessageBubble m={botMessage} />);

    // แสดงข้อความถูกต้อง
    expect(screen.getByText(botMessage.text)).toBeInTheDocument();

    // มี class สำหรับ bot (ชิดซ้าย)
    const bubble = screen.getByTestId('message-bubble');
    expect(bubble).toHaveClass('mr-auto bg-muted');

    // ไม่มีส่วนของ source
    expect(screen.queryByTestId('message-source')).not.toBeInTheDocument();
  });

  it('should render bot message with source', () => {
    render(<MessageBubble m={botMessageWithSource} />);

    // แสดงข้อความและ source ถูกต้อง
    expect(screen.getByText(botMessageWithSource.text)).toBeInTheDocument();
    expect(screen.getByTestId('message-source')).toBeInTheDocument();
    expect(screen.getByText(botMessageWithSource.source!)).toBeInTheDocument();
  });

  it('should render "Thinking..." for bot typing message', () => {
    render(<MessageBubble m={botTypingMessage} />);

    // แสดงคำว่า "Thinking..." และต้องไม่มี text '...'
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();

    // มี class สำหรับ bot
    expect(screen.getByTestId('message-bubble')).toHaveClass('mr-auto bg-muted');
  });

  it('should not render source if message is from user, even if source exists', () => {
    const userMessageWithSource: Message = {
      ...userMessage,
      source: 'should-not-be-visible.pdf',
    };
    render(<MessageBubble m={userMessageWithSource} />);

    // ต้องไม่แสดง source เพราะเป็นข้อความของ user
    expect(screen.queryByTestId('message-source')).not.toBeInTheDocument();
  });

  it('should not render source if bot is typing, even if source exists', () => {
    const typingMessageWithSource: Message = {
      ...botTypingMessage,
      source: 'should-not-be-visible.pdf',
    };
    render(<MessageBubble m={typingMessageWithSource} />);

    // ต้องไม่แสดง source เพราะบอทกำลังพิมพ์
    expect(screen.queryByTestId('message-source')).not.toBeInTheDocument();
  });
});
