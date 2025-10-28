
import React from 'react';
import { type UploadedFile } from '../types';
import { FileUpload } from './FileUpload';
import { DocumentIcon, EuIcon, TrashIcon } from './icons/Icons';

interface SidebarProps {
  uploadedFiles: UploadedFile[];
  onFileUpload: (file: UploadedFile) => void;
  onRemoveFile: (fileName: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ uploadedFiles, onFileUpload, onRemoveFile }) => {
  return (
    <aside className="w-full md:w-1/3 lg:w-1/4 h-screen bg-white border-r border-slate-200 flex flex-col p-4 shadow-md">
      <div className="flex items-center space-x-3 p-2 mb-4 border-b border-slate-200 pb-4">
        <div className="w-12 h-12 flex items-center justify-center text-blue-800">
           <EuIcon />
        </div>
        <div>
            <h1 className="text-lg font-bold text-blue-800">EU Transport Policy</h1>
            <p className="text-sm text-slate-600">AI Agent</p>
        </div>
      </div>

      <div className="flex-grow flex flex-col overflow-y-auto">
        <h2 className="text-md font-semibold text-slate-700 mb-2 px-2">Knowledge Base</h2>
        <FileUpload onFileUpload={onFileUpload} />
        
        <div className="mt-4 flex-1 overflow-y-auto">
          {uploadedFiles.length > 0 ? (
            <ul className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <li 
                  key={index} 
                  className="flex items-center justify-between p-2 bg-slate-100 rounded-lg group hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center min-w-0">
                    <div className="text-slate-500 mr-3 flex-shrink-0">
                       <DocumentIcon />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-slate-800 truncate">{file.name}</span>
                      <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemoveFile(file.name)} 
                    className="ml-2 p-1 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove ${file.name}`}
                   >
                     <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-sm text-slate-500 mt-4 p-4 border-2 border-dashed border-slate-300 rounded-lg">
              <p>Upload documents to begin your analysis.</p>
            </div>
          )}
        </div>
      </div>
      
       <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
        <p>This AI agent uses a Retrieval-Augmented Generation (RAG) framework to analyze your documents. All data is processed securely.</p>
      </div>
    </aside>
  );
};
