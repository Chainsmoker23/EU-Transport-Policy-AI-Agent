
import React, { useState, useRef, useEffect } from 'react';
import { type ChatMessage, ChatMessageRole } from '../types';
import { MessageBubble } from './MessageBubble';
import { SendIcon, StopIcon } from './icons/Icons';

interface ChatViewProps {
  chatHistory: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onStopGenerating: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ chatHistory, isLoading, onSendMessage, onStopGenerating }) => {
  const [inputMessage, setInputMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        {chatHistory.map((message, index) => (
          <MessageBubble 
            key={index} 
            message={message}
            isLoading={isLoading && message.role === ChatMessageRole.MODEL && index === chatHistory.length - 1}
          />
        ))}
      </div>

      <div className="px-6 py-4 bg-white border-t border-slate-200 shadow-inner">
        {isLoading && (
            <div className="flex justify-center mb-2">
                <button
                    onClick={onStopGenerating}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 border border-slate-300 transition-colors"
                    aria-label="Stop generating response"
                >
                    <StopIcon />
                    Stop generating
                </button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                }
            }}
            placeholder="Ask a question about your documents..."
            className="w-full border border-slate-300 rounded-lg py-3 pl-4 pr-16 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <SendIcon />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
