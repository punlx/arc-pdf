// src/components/theme/__test__/ThemeToggle.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../ThemeToggle';

// --- 1. Mock 'next-themes' library ---
import { useTheme } from 'next-themes';

vi.mock('next-themes');

// --- 2. สร้าง Mock Function ---
const mockSetTheme = vi.fn();

describe('<ThemeToggle />', () => {
  let user;

  // --- 3. ตั้งค่า Mock เริ่มต้นก่อนแต่ละเทสต์ ---
  beforeEach(() => {
    user = userEvent.setup();
    // Reset mock ทุกครั้ง
    vi.clearAllMocks();

    // จำลองค่าที่คืนจาก useTheme hook
    vi.mocked(useTheme).mockReturnValue({
      setTheme: mockSetTheme,
      theme: 'system', // ค่าเริ่มต้นสมมติ
      themes: ['light', 'dark', 'system'],
    });
  });

  // --- 4. เริ่ม Test Cases ---

  it('should render the toggle trigger button', () => {
    render(<ThemeToggle />);
    // ตรวจสอบว่ามีปุ่มสำหรับเปิดเมนูอยู่จริง
    expect(screen.getByLabelText(/toggle theme/i)).toBeInTheDocument();
  });

  it('should open the dropdown and show theme options on click', async () => {
    render(<ThemeToggle />);

    // Act: คลิกที่ปุ่ม trigger
    const triggerButton = screen.getByLabelText(/toggle theme/i);
    await user.click(triggerButton);

    // Assert: ตรวจสอบว่าเมนูย่อยแสดงขึ้นมาครบถ้วน
    // เราใช้ findByRole เพื่อรอให้ animation การเปิดเมนูทำงานเสร็จ
    expect(await screen.findByRole('menuitem', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /system/i })).toBeInTheDocument();
  });

  it('should call setTheme with "light" when Light menu item is clicked', async () => {
    render(<ThemeToggle />);

    // Act: เปิดเมนูและคลิกที่ "Light"
    await user.click(screen.getByLabelText(/toggle theme/i));
    const lightMenuItem = await screen.findByRole('menuitem', { name: /light/i });
    await user.click(lightMenuItem);

    // Assert: ตรวจสอบว่า setTheme ถูกเรียกด้วยค่าที่ถูกต้อง
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('should call setTheme with "dark" when Dark menu item is clicked', async () => {
    render(<ThemeToggle />);

    // Act: เปิดเมนูและคลิกที่ "Dark"
    await user.click(screen.getByLabelText(/toggle theme/i));
    const darkMenuItem = await screen.findByRole('menuitem', { name: /dark/i });
    await user.click(darkMenuItem);

    // Assert
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should call setTheme with "system" when System menu item is clicked', async () => {
    render(<ThemeToggle />);

    // Act: เปิดเมนูและคลิกที่ "System"
    await user.click(screen.getByLabelText(/toggle theme/i));
    const systemMenuItem = await screen.findByRole('menuitem', { name: /system/i });
    await user.click(systemMenuItem);

    // Assert
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });
});
