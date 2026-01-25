import React from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  name?: string; // Prop for EmailJS attachment
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading, name }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Note: Dragged files won't populate the input[type=file] value due to browser security.
      // So they won't be sent as attachments via EmailJS sendForm.
      // The extracted text will work, but the attachment will be missing.
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isLoading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.html,.htm"
        name={name}
      />

      {isLoading ? (
        <div className="flex flex-col items-center">
          {/* Spinner would go here, managed by parent state usually */}
          <p className="text-blue-600 font-medium">Processando...</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-[#00569e]">Clique aqui</span> ou arraste o arquivo PDF/HTML
          </p>
          <p className="text-xs text-gray-400">Suporta PDFs, Imagens e HTML de cias aéreas</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
