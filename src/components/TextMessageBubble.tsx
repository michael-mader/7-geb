import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { ChatMessage } from '../types';

interface TextMessageBubbleProps {
  message: ChatMessage;
  theme: 'whatsapp' | 'telegram' | 'whatsapp-dark';
}

export const TextMessageBubble: React.FC<TextMessageBubbleProps> = ({
  message,
  theme,
}) => {
  const isUser = message.sender === 'user';

  // Bubble color styles
  const bubbleColor = isUser
    ? theme === 'whatsapp-dark'
      ? 'bg-[#005c4b] text-white self-end rounded-tr-none'
      : theme === 'telegram'
      ? 'bg-[#eef2f5] text-gray-900 self-end rounded-tr-none border border-blue-200'
      : 'bg-[#d9fdd3] text-gray-900 self-end rounded-tr-none shadow-sm'
    : theme === 'whatsapp-dark'
    ? 'bg-[#1f2c34] text-white self-start rounded-tl-none'
    : 'bg-white text-gray-900 self-start rounded-tl-none shadow-sm';

  return (
    <div
      className={`flex flex-col max-w-[85%] sm:max-w-[75%] mb-2.5 animate-in fade-in ${
        isUser ? 'self-end items-end' : 'self-start items-start'
      }`}
    >
      <div
        className={`${bubbleColor} rounded-2xl px-3 py-2 text-sm sm:text-[15px] relative leading-relaxed shadow-sm`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>

        {/* Timestamp & double checkmarks */}
        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-500 dark:text-gray-300">
          <span>{message.timestamp}</span>
          {isUser && (
            <span>
              {message.status === 'sent' ? (
                <Check className="w-3.5 h-3.5 text-gray-400 inline" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] inline" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
