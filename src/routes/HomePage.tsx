import { useEffect, useState, useCallback } from 'react';
import UploadPDF from '@/assets/upload_pdf.png';
import { Loader2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { uploadFiles } from '@/api/upload';
import { client } from '@/api/client';
import { useFilesStore } from '@/stores/filesStore';
import { useChatStore } from '@/stores/chatStore';
import { usePdfUploader } from '@/hooks/usePdfUploader';
import { useDropzone } from 'react-dropzone';

const text = 'Let’s Upload your PDF...'; // ✨ แก้ typo จาก Uplaod → Upload

export const HomePage = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const typeInterval = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      setIndex((prev) => prev + 1);
    }, 100);

    if (index === text.length) {
      clearInterval(typeInterval);
      const resetTimeout = setTimeout(() => {
        setDisplayedText('');
        setIndex(0);
      }, 7000); // ⏲️ reset ทุก 5 วิ
      return () => clearTimeout(resetTimeout);
    }

    return () => clearInterval(typeInterval);
  }, [index]);

  const { uploadPdfFiles, loading } = usePdfUploader();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: uploadPdfFiles,
    accept: { 'application/pdf': [] },
    multiple: true,
  });

  return (
    <div className="flex items-center justify-center h-full flex-col gap-4">
      <div className="px-8 py-4 border-2 border-foreground rounded-full text-2xl font-medium font-mono whitespace-pre relative top-[50px] z-10">
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
        <div className="text-xl font-extralight opacity-50 relative bottom-[60px] z-10">
          {isDragActive ? 'Drop Here!!' : 'Drag and drop your PDF here, or click to select a file'}
        </div>
      )}
    </div>
  );
};
