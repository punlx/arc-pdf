// src/routes/HomePage.tsx

import UploadPDF from '@/assets/upload_pdf.png';
import { Loader2 } from 'lucide-react';
import { usePdfUploader } from '@/hooks/usePdfUploader';
import { useDropzone } from 'react-dropzone';
import { useTypingEffect } from '@/hooks/useTypingEffect'; // 🆕 Import hook

const UPLOAD_TEXT = 'Let’s Upload your PDF...';

export const HomePage = () => {
  // 🚀 ใช้ hook เพื่อจัดการ animation อย่างสวยงาม
  const displayedText = useTypingEffect(UPLOAD_TEXT, 100, 7000);

  const { uploadPdfFiles, loading } = usePdfUploader();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: uploadPdfFiles,
    accept: { 'application/pdf': [] },
    multiple: true,
  });
  console.log('HomePage.tsx:21 |test| : ');

  return (
    <div className="flex items-center justify-center h-full flex-col gap-4">
      <div className="px-8 py-4 border-2 border-foreground rounded-full max-sm:text-[16px] max-md:text-lg text-2xl font-medium font-mono whitespace-pre relative top-[50px] z-10">
        {displayedText}
      </div>
      <div
        {...getRootProps()}
        className={`cursor-pointer hover:bg-mascot-background rounded-full transition-all p-16 relative duration-700 ${
          isDragActive ? 'border-primary bg-muted/20' : 'border-muted'
        }`}
      >
        <input {...getInputProps()} />
        <img src={UploadPDF} alt="upload pdf image" width={400} />
      </div>
      {loading ? (
        <>
          <Loader2 className="animate-spin h-6 w-6 mb-2" />
          <p className="text-sm">Uploading…</p>
        </>
      ) : (
        <div className="text-xl max-sm:text-sm max-md:text-lg font-extralight text-center opacity-50 relative bottom-[60px] z-10">
          {isDragActive ? 'Drop Here!!' : 'Drag and drop your PDF here, or click to select a file'}
        </div>
      )}
    </div>
  );
};
