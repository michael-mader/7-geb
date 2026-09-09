import React, { useState } from 'react';
import { Check, CheckCheck, X, ZoomIn } from 'lucide-react';
import { ChatMessage } from '../types';

interface ImageMessageBubbleProps {
  message: ChatMessage;
  theme: 'whatsapp' | 'telegram' | 'whatsapp-dark';
  onImageClick?: (url: string) => void;
}

export const ImageMessageBubble: React.FC<ImageMessageBubbleProps> = ({
  message,
  theme,
  onImageClick,
}) => {
  const [showLightbox, setShowLightbox] = useState(false);
  const isUser = message.sender === 'user';
  const hasCaption = Boolean(message.caption || message.text);

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

  const handleOpenImage = () => {
    if (onImageClick && message.imageUrl) {
      onImageClick(message.imageUrl);
    } else {
      setShowLightbox(true);
    }
  };

  return (
    <>
      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[75%] mb-2.5 animate-in fade-in ${
          isUser ? 'self-end items-end' : 'self-start items-start'
        }`}
      >
        <div
          className={`${bubbleColor} rounded-2xl p-1 sm:p-1.5 text-sm relative shadow-sm overflow-hidden`}
        >
          {/* Image Container */}
          <div
            className="relative rounded-xl overflow-hidden cursor-pointer group bg-black/5 dark:bg-white/5"
            onClick={handleOpenImage}
          >
            {message.imageUrl && (
              <img
                src={message.imageUrl}
                alt={message.caption || 'Gesendetes Foto'}
                loading="lazy"
                className="w-full max-h-[340px] sm:max-h-[400px] object-cover rounded-xl transition-transform duration-200 group-hover:scale-[1.02]"
              />
            )}

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <div className="bg-black/50 text-white rounded-full p-2 backdrop-blur-xs">
                <ZoomIn className="w-5 h-5" />
              </div>
            </div>

            {/* Floating timestamp if NO caption is present (authentic WhatsApp style) */}
            {!hasCaption && (
              <div className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[10.5px] px-1.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                <span>{message.timestamp}</span>
                {isUser && (
                  <span>
                    {message.status === 'sent' ? (
                      <Check className="w-3.5 h-3.5 text-white/80 inline" />
                    ) : (
                      <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] inline" />
                    )}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Optional Caption */}
          {hasCaption && (
            <div className="px-2 pt-1.5 pb-1">
              <p className="whitespace-pre-wrap break-words text-sm sm:text-[15px] leading-relaxed">
                {message.caption || message.text}
              </p>

              {/* Timestamp & double checkmarks below caption */}
              <div className="flex items-center justify-end gap-1 mt-0.5 text-[10px] text-gray-500 dark:text-gray-300">
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
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && message.imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowLightbox(false)}
        >
          {/* Top Bar */}
          <div
            className="w-full flex items-center justify-between p-3 text-white absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Foto</span>
              <span className="text-xs text-white/70">{message.timestamp}</span>
            </div>
            <button
              type="button"
              aria-label="Schließen"
              onClick={() => setShowLightbox(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Full Image */}
          <div
            className="max-w-full max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={message.imageUrl}
              alt={message.caption || 'Foto Großansicht'}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            {hasCaption && (
              <p className="text-white text-center mt-3 text-sm px-4 py-1.5 bg-black/60 rounded-full max-w-lg">
                {message.caption || message.text}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
