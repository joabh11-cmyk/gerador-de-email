import React, { useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (isLoading) return;
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    },
    [onFileSelect, isLoading]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isLoading) return;
      if (e.target.files && e.target.files[0]) {
        onFileSelect(e.target.files[0]);
      }
    },
    [onFileSelect, isLoading]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
        ${isLoading ? 'border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 bg-white'}
      `}
    >
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleChange}
        className="hidden"
        id="file-upload"
        disabled={isLoading}
      />
      <label htmlFor="file-upload" className="cursor-pointer w-full h-full block">
        <div className="flex flex-col items-center justify-center gap-3">
          <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-gray-700 font-medium text-lg">
            {isLoading ? 'Processando...' : 'Clique para enviar ou arraste o PDF/Imagem aqui'}
          </span>
          <span className="text-sm text-gray-500">
            Suporta JPG, PNG, PDF
          </span>
        </div>
      </label>
    </div>
  );
};

export default FileUpload;
