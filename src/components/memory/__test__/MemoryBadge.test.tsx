// src/components/__test__/MemoryBadge.test.tsx

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryBadge } from '../MemoryBadge';

// --- 1. Mock Dependencies ---
import { useChatStore } from '@/stores/chatStore';

vi.mock('@/stores/chatStore');

describe('<MemoryBadge />', () => {
  // --- 2. Test Cases ---

  it('should display the "Memory" badge when hasMemory is true', () => {
    // Arrange: จำลองให้ store คืนค่า hasMemory เป็น true
    vi.mocked(useChatStore).mockImplementation((selector) => selector({ hasMemory: true }));

    // Act
    render(<MemoryBadge />);

    // Assert: ควรจะเจอข้อความ "Memory"
    const memoryBadge = screen.getByText('Memory');
    expect(memoryBadge).toBeInTheDocument();

    // และควรจะมี class สีเขียว
    // เราใช้ .parentElement เพื่อเลือก <Badge> ที่ห่อหุ้ม <span> อยู่
    expect(memoryBadge.parentElement).toHaveClass('bg-green-600');

    // และไม่ควรเจอข้อความ "No Memory"
    expect(screen.queryByText('No Memory')).not.toBeInTheDocument();
  });

  it('should display the "No Memory" badge when hasMemory is false', () => {
    // Arrange: จำลองให้ store คืนค่า hasMemory เป็น false
    vi.mocked(useChatStore).mockImplementation((selector) => selector({ hasMemory: false }));

    // Act
    render(<MemoryBadge />);

    // Assert: ควรจะเจอข้อความ "No Memory"
    const noMemoryBadge = screen.getByText('No Memory');
    expect(noMemoryBadge).toBeInTheDocument();

    // และควรจะมี class ที่แสดงว่าเป็น variant="outline"
    expect(noMemoryBadge).toHaveClass('border');

    // และไม่ควรเจอข้อความ "Memory"
    expect(screen.queryByText('Memory')).not.toBeInTheDocument();
  });
});
