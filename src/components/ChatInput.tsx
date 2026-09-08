import React, { useState } from 'react';
import { Send, Smile, Paperclip, Camera, Mic, Compass, Sparkles, Key } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  theme: 'whatsapp' | 'telegram' | 'whatsapp-dark';
  currentClueNumber: number;
}

const QUICK_EMOJIS = ['🔍', '🗺️', '🗝️', '🏴‍☠️', '💎', '🎂', '🦁', '🦉', '🐾', '✨', '🏆', '🎉'];

const SUGGESTIONS = [
  'Bereit für den nächsten Hinweis! 🔍',
  'Wir haben das Versteck gefunden! 🗝️',
  'Was ist das nächste Geheimnis? 🗺️',
  'Mission erfolgreich erfüllt! 🎉',
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  theme,
  currentClueNumber,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSend = () => {
    if (disabled) return;
    const textToSend = inputValue.trim() || `Bereit für Hinweis #${currentClueNumber}! 🗝️`;
    onSendMessage(textToSend);
    setInputValue('');
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setInputValue((prev) => prev + emoji);
  };

  const containerBg =
    theme === 'whatsapp-dark'
      ? 'bg-[#1f2c34] border-t border-gray-800'
      : theme === 'telegram'
      ? 'bg-white border-t border-gray-200'
      : 'bg-[#f0f2f5] border-t border-gray-200';

  const inputBg =
    theme === 'whatsapp-dark'
      ? 'bg-[#2a3942] text-white placeholder-gray-400'
      : 'bg-white text-gray-900 placeholder-gray-400';

  const sendBtnBg =
    theme === 'telegram' ? 'bg-[#2a76a8] hover:bg-[#23638c]' : 'bg-[#00a884] hover:bg-[#008f6f]';

  return (
    <div className={`${containerBg} p-2 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:p-2.5 sm:pb-[calc(1rem+env(safe-area-inset-bottom))] z-20 select-none relative transition-colors duration-200`}>
      {/* Quick Suggestion Chips for Kids */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
        <span className="text-gray-400 dark:text-gray-500 font-medium shrink-0 flex items-center gap-1 pl-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Schnell:</span>
        </span>
        {SUGGESTIONS.map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSendMessage(suggestion)}
            className="whitespace-nowrap shrink-0 bg-white/80 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-2.5 py-1 rounded-full border border-gray-200/80 dark:border-gray-700 text-[11px] font-medium shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Quick Emoji Drawer */}
      {showEmojiPicker && (
        <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 bg-white/95 dark:bg-[#202c33] rounded-xl mb-1.5 shadow-sm border border-gray-200 dark:border-gray-700 animate-in fade-in duration-100">
          {QUICK_EMOJIS.map((emoji, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Rounded Input Capsule */}
        <div className={`flex items-center flex-1 rounded-full px-3 py-1.5 ${inputBg} shadow-xs border border-black/5 dark:border-white/5`}>
          {/* Emoji toggle */}
          <button
            type="button"
            aria-label="Emoji-Tastatur"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mr-2 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              disabled
                ? 'Mortimer nimmt den Sprach-Hinweis auf...'
                : `Nachricht an Mortimer oder tippen für Hinweis #${currentClueNumber}...`
            }
            className="flex-1 bg-transparent border-none outline-hidden text-sm sm:text-[15px] min-w-0"
          />

          {/* Attachment button */}
          <button
            type="button"
            aria-label="Datei anhängen"
            onClick={() => setInputValue('Wir haben die Schatzkarte entziffert! 🗺️')}
            title="Schatzkarte erwähnen"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2 transition-colors"
          >
            <Paperclip className="w-5 h-5 -rotate-45" />
          </button>

          {/* Camera button */}
          <button
            type="button"
            aria-label="Kamera"
            onClick={() => setInputValue('Hier ist ein Beweisfoto von unserem Fund! 📸')}
            title="Beweisfoto erwähnen"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2.5 transition-colors hidden xs:block"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Action / Send Button */}
        <button
          type="button"
          aria-label="Nachricht senden für Sprach-Hinweis"
          onClick={handleSend}
          disabled={disabled}
          title={`Tippen, um Hinweis #${currentClueNumber} anzufordern`}
          className={`${sendBtnBg} text-white w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all shrink-0 disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {inputValue.trim() ? (
            <Send className="w-5 h-5 ml-0.5" />
          ) : (
            // Prominent Send / Voice prompt button
            <Send className="w-5 h-5 ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};
