// src/components/theme/__test__/ThemeToggle.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../ThemeToggle';
import type { UserEvent } from '@testing-library/user-event'; // 🆕 Import UserEvent type

// --- 1. Mock 'next-themes' library ---
import { useTheme } from 'next-themes';

vi.mock('next-themes');

// --- 2. สร้าง Mock Function ---
const mockSetTheme = vi.fn();

describe('<ThemeToggle />', () => {
  let user: UserEvent; // 🆕 กำหนด Type ให้ user

  // --- 3. ตั้งค่า Mock เริ่มต้นก่อนแต่ละเทสต์ ---
  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();

    // จำลองค่าที่คืนจาก useTheme hook
    vi.mocked(useTheme).mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'system',
      themes: ['light', 'dark', 'system'],
      // เพิ่ม properties อื่นๆ ที่ useTheme อาจจะคืนค่ามา เพื่อให้ mock สมบูรณ์
      resolvedTheme: 'system',
    });
  });

  // --- 4. Test Cases ---

  it('should render the toggle trigger button', () => {
    render(<ThemeToggle />);
    expect(screen.getByLabelText(/toggle theme/i)).toBeInTheDocument();
  });

  it('should open the dropdown and show theme options on click', async () => {
    render(<ThemeToggle />);
    const triggerButton = screen.getByLabelText(/toggle theme/i);
    await user.click(triggerButton);

    expect(await screen.findByRole('menuitem', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /system/i })).toBeInTheDocument();
  });

  it('should call setTheme with "light" when Light menu item is clicked', async () => {
    render(<ThemeToggle />);
    await user.click(screen.getByLabelText(/toggle theme/i));
    const lightMenuItem = await screen.findByRole('menuitem', { name: /light/i });
    await user.click(lightMenuItem);

    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('should call setTheme with "dark" when Dark menu item is clicked', async () => {
    render(<ThemeToggle />);
    await user.click(screen.getByLabelText(/toggle theme/i));
    const darkMenuItem = await screen.findByRole('menuitem', { name: /dark/i });
    await user.click(darkMenuItem);

    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should call setTheme with "system" when System menu item is clicked', async () => {
    render(<ThemeToggle />);
    await user.click(screen.getByLabelText(/toggle theme/i));
    const systemMenuItem = await screen.findByRole('menuitem', { name: /system/i });
    await user.click(systemMenuItem);

    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });
});
