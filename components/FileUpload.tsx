import React, { useCallback, useState } from 'react';
import { type UploadedFile } from '../types';
import { UploadIcon } from './icons/Icons';

interface FileUploadProps {
  onFileUpload: (file: UploadedFile) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      // Fix: Explicitly type `file` as `File` to resolve properties `name`, `type`, and `size`.
      Array.from(event.target.files).forEach((file: File) => {
        onFileUpload({
          name: file.name,
          type: file.type,
          size: file.size,
        });
      });
    }
  };
  
  const handleDragEvent = (e: React.DragEvent<HTMLLabelElement>, isEntering: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(isEntering);
  };
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        // Fix: Explicitly type `file` as `File` to resolve properties `name`, `type`, and `size`.
        Array.from(e.dataTransfer.files).forEach((file: File) => {
          onFileUpload({
            name: file.name,
            type: file.type,
            size: file.size,
          });
        });
        e.dataTransfer.clearData();
      }
  }, [onFileUpload]);


  return (
    <div className="w-full px-2">
      <label
        onDragEnter={(e) => handleDragEvent(e, true)}
        onDragLeave={(e) => handleDragEvent(e, false)}
        onDragOver={(e) => handleDragEvent(e, true)}
        onDrop={handleDrop}
        className={`flex justify-center w-full h-32 px-4 transition bg-white border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300'} border-dashed rounded-md appearance-none cursor-pointer hover:border-slate-400 focus:outline-none`}>
        <span className="flex items-center space-x-2">
          <UploadIcon />
          <span className="font-medium text-slate-600">
            Drop files to attach, or{' '}
            <span className="text-blue-600 underline">browse</span>
          </span>
        </span>
        <input 
            type="file" 
            name="file_upload" 
            className="hidden" 
            multiple 
            onChange={handleFileChange} 
        />
      </label>
    </div>
  );
};