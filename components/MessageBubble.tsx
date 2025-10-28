
import React from 'react';
import { type ChatMessage, ChatMessageRole } from '../types';
import { UserIcon, BotIcon } from './icons/Icons';

interface MessageBubbleProps {
  message: ChatMessage;
  isLoading?: boolean;
}

// Simple Markdown-like to HTML parser
const formatText = (text: string) => {
    // Basic bold, italic, and code block support
    let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-slate-200 text-sm rounded px-1 py-0.5">$1</code>')
        .replace(/\n/g, '<br />');

    // Handle bullet points
    formattedText = formattedText.replace(/(\r\n|\n|\r)/gm, '<br>');
    formattedText = formattedText.replace(/<br \/>\s*-\s/g, '</li><li class="ml-4 list-disc">');
    if (formattedText.startsWith('</li>')) {
        formattedText = `<ul class="space-y-1">${formattedText}</li></ul>`.replace('</li><li', '<li');
    }
    
    return { __html: formattedText };
};


export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLoading = false }) => {
  const isUser = message.role === ChatMessageRole.USER;
  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white'
    : 'bg-white text-slate-800 border border-slate-200';
  const alignmentClasses = isUser ? 'justify-end' : 'justify-start';
  const IconComponent = isUser ? UserIcon : BotIcon;

  return (
    <div className={`flex items-start gap-3 ${alignmentClasses}`}>
      {!isUser && (
        <div className="w-8 h-8 flex-shrink-0 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
          <IconComponent />
        </div>
      )}
      <div
        className={`max-w-xl xl:max-w-2xl px-4 py-3 rounded-lg shadow-sm ${bubbleClasses}`}
      >
        {isLoading && message.text.length === 0 ? (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={formatText(message.text)} />
        )}
      </div>
       {isUser && (
        <div className="w-8 h-8 flex-shrink-0 bg-blue-200 rounded-full flex items-center justify-center text-blue-700">
          <IconComponent />
        </div>
      )}
    </div>
  );
};
