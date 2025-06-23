import { render, screen } from '@testing-library/react';
import { DropZone } from '../DropZone';

vi.mock('@/api/upload', () => ({
  uploadFiles: vi.fn().mockResolvedValue({
    message: 'ok',
    files: [],
  }),
}));

describe('<DropZone />', () => {
  it('shows placeholder text', () => {
    render(<DropZone />);

    expect(screen.getByText(/ลาก PDF มาวาง หรือคลิกเพื่อเลือกไฟล์/i)).toBeInTheDocument();
  });
});
