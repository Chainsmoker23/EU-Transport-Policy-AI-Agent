
import React, { useState, useCallback } from 'react';
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

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFiles((prevFiles) => [...prevFiles, file]);
  };
  
  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles((prevFiles) => prevFiles.filter(file => file.name !== fileName));
  };

  const handleSendMessage = useCallback(async (message: string) => {
    setIsLoading(true);
    const userMessage: ChatMessage = { role: ChatMessageRole.USER, text: message };
    
    // Immediately add user message and an empty model message for streaming
    setChatHistory((prev) => [...prev, userMessage, { role: ChatMessageRole.MODEL, text: '' }]);

    try {
      const stream = streamChatResponse(message, uploadedFiles, chatHistory);
      for await (const chunk of stream) {
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
      console.error('Error streaming response:', error);
      setChatHistory((prev) => {
        const newHistory = [...prev];
        const lastMessage = newHistory[newHistory.length - 1];
        if (lastMessage.role === ChatMessageRole.MODEL) {
          lastMessage.text = "Sorry, I encountered an error. Please check the console for details.";
        }
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  }, [uploadedFiles, chatHistory]);

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
        />
      </main>
    </div>
  );
};

export default App;
