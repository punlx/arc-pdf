// src/components/upload/__test__/DropZone.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropZone } from '../UploadPanel/DropZone';
import { usePdfUploader } from '@/hooks/usePdfUploader';

// Mock hook ที่เป็น Dependency หลักของ Component
vi.mock('@/hooks/usePdfUploader');

const mockUploadPdfFiles = vi.fn();

describe('<DropZone />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test Case 1 และ 2 (ผ่านแล้ว)
  it('should render the upload icon when not loading', () => {
    vi.mocked(usePdfUploader).mockReturnValue({
      uploadPdfFiles: mockUploadPdfFiles,
      loading: false,
    });
    render(<DropZone />);
    expect(screen.getByTestId('file-up-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument();
  });

  it('should render the loader icon and be disabled when loading', () => {
    vi.mocked(usePdfUploader).mockReturnValue({
      uploadPdfFiles: mockUploadPdfFiles,
      loading: true,
    });
    render(<DropZone />);
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('file-up-icon')).not.toBeInTheDocument();
    expect(screen.getByTestId('dropzone-container')).toHaveClass('pointer-events-none');
  });

  // Test Case 3 (ฉบับแก้ไข Assertion)
  it('should call uploadPdfFiles when a file is selected via input', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usePdfUploader).mockReturnValue({
      uploadPdfFiles: mockUploadPdfFiles,
      loading: false,
    });

    const testFile = new File(['(⌐□_□)'], 'test.pdf', { type: 'application/pdf' });
    const { container } = render(<DropZone />);

    const fileInput = container.querySelector<HTMLElement>('input[type="file"]');
    expect(fileInput).not.toBeNull();

    // Act
    await user.upload(fileInput!, testFile);

    // Assert
    expect(mockUploadPdfFiles).toHaveBeenCalledTimes(1);

    // 🔄 แก้ไข: บอกให้ Vitest ตรวจสอบแค่ argument ตัวแรก
    // และยอมรับว่า argument ตัวที่ 2 และ 3 จะเป็นอะไรก็ได้
    expect(mockUploadPdfFiles).toHaveBeenCalledWith(
      [testFile],
      expect.anything(),
      expect.anything()
    );
  });
});
