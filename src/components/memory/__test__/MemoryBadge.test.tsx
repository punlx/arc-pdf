// src/components/__test__/MemoryBadge.test.tsx

import { render, screen } from '@testing-library/react';
import { MemoryBadge } from '../MemoryBadge';

// --- 1. Mock Dependencies ---
import { useChatStore, type ChatState } from '@/stores/chatStore'; // 🆕 Import State type

vi.mock('@/stores/chatStore');

describe('<MemoryBadge />', () => {
  // --- 2. Test Cases ---

  it('should display the "Memory" badge when hasMemory is true', () => {
    // Arrange: 🆕 เพิ่ม Type ให้กับ 'selector'
    vi.mocked(useChatStore).mockImplementation((selector: (state: ChatState) => any) =>
      selector({ hasMemory: true } as ChatState)
    );

    // Act
    render(<MemoryBadge />);

    // Assert
    const memoryBadge = screen.getByText('Memory');
    expect(memoryBadge).toBeInTheDocument();
    expect(memoryBadge.parentElement).toHaveClass('bg-green-600');
    expect(screen.queryByText('No Memory')).not.toBeInTheDocument();
  });

  it('should display the "No Memory" badge when hasMemory is false', () => {
    // Arrange: 🆕 เพิ่ม Type ให้กับ 'selector'
    vi.mocked(useChatStore).mockImplementation((selector: (state: ChatState) => any) =>
      selector({ hasMemory: false } as ChatState)
    );

    // Act
    render(<MemoryBadge />);

    // Assert
    const noMemoryBadge = screen.getByText('No Memory');
    expect(noMemoryBadge).toBeInTheDocument();
    expect(noMemoryBadge).toHaveClass('border');
    expect(screen.queryByText('Memory')).not.toBeInTheDocument();
  });
});
