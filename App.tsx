
import React, { useState, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { type UploadedFile, type ChatMessage, ChatMessageRole } from './types';
import { streamChatResponse } from './services/geminiService';

const App: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: ChatMessageRole.MODEL,
      text: "Welcome to the EU Transport Policy AI Agent. Please upload your policy documents, research reports, or datasets. Then, ask me anything about them.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFiles((prevFiles) => [...prevFiles, file]);
  };
  
  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles((prevFiles) => prevFiles.filter(file => file.name !== fileName));
  };

  const handleSendMessage = useCallback(async (message: string) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    setIsLoading(true);
    const userMessage: ChatMessage = { role: ChatMessageRole.USER, text: message };
    
    // Immediately add user message and an empty model message for streaming
    setChatHistory((prev) => [...prev, userMessage, { role: ChatMessageRole.MODEL, text: '' }]);

    try {
      const stream = streamChatResponse(message, uploadedFiles, chatHistory);
      for await (const chunk of stream) {
        if (controller.signal.aborted) {
          break;
        }
        setChatHistory((prev) => {
          const newHistory = [...prev];
          const lastMessage = newHistory[newHistory.length - 1];
          if (lastMessage.role === ChatMessageRole.MODEL) {
            lastMessage.text += chunk;
          }
          return newHistory;
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream generation stopped by user.');
      } else {
        console.error('Error streaming response:', error);
        setChatHistory((prev) => {
          const newHistory = [...prev];
          const lastMessage = newHistory[newHistory.length - 1];
          if (lastMessage.role === ChatMessageRole.MODEL) {
            lastMessage.text = "Sorry, I encountered an error. Please check the console for details.";
          }
          return newHistory;
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [uploadedFiles, chatHistory]);

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-sans text-slate-800">
      <Sidebar 
        uploadedFiles={uploadedFiles} 
        onFileUpload={handleFileUpload} 
        onRemoveFile={handleRemoveFile}
      />
      <main className="flex-1 flex flex-col bg-slate-50">
        <ChatView
          chatHistory={chatHistory}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onStopGenerating={handleStopGenerating}
        />
      </main>
    </div>
  );
};

export default App;
