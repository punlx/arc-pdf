// src/components/upload/DropZone.tsx

import { useDropzone } from 'react-dropzone';
import { FileUp, Loader2 } from 'lucide-react';

import { usePdfUploader } from '@/hooks/usePdfUploader';
import { cn } from '@/lib/utils';

export const DropZone = () => {
  const { uploadPdfFiles, loading } = usePdfUploader();

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: uploadPdfFiles,
    accept: { 'application/pdf': [] },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      data-testid="dropzone-container"
      className={cn(
        'flex items-center justify-center cursor-pointer',
        'focus-visible:ring-2 focus-visible:ring-ring',
        loading && 'pointer-events-none'
      )}
    >
      <input {...getInputProps()} />

      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" data-testid="loader-icon" />
      ) : (
        <FileUp data-testid="file-up-icon" />
      )}
    </div>
  );
};
