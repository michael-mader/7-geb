import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, Smile } from 'lucide-react';

interface ImagePreviewModalProps {
  imageUrl: string;
  onSend: (caption?: string) => void;
  onCancel: () => void;
  theme: 'whatsapp' | 'telegram' | 'whatsapp-dark';
  currentClueNumber: number;
}

const QUICK_PHOTO_CAPTIONS = [
  'Hier ist unser Beweisfoto! 📸',
  'Gefunden! 🗝️',
  'Wir haben das Versteck! 🔍',
  'Stimmt das so, Mortimer? ✨',
];

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  imageUrl,
  onSend,
  onCancel,
  theme,
  currentClueNumber,
}) => {
  const [caption, setCaption] = useState('');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(caption.trim() || undefined);
  };

  const sendBtnBg =
    theme === 'telegram' ? 'bg-[#2a76a8] hover:bg-[#23638c]' : 'bg-[#00a884] hover:bg-[#008f6f]';

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between animate-in fade-in duration-150 select-none">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between p-3 sm:p-4 text-white z-10 bg-gradient-to-b from-black/80 to-transparent">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Abbrechen"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-xs sm:text-sm font-medium text-white/80">
          Foto an Mortimer senden
        </span>

        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Center Image Preview */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        <img
          src={imageUrl}
          alt="Vorschau"
          className="max-h-[60vh] sm:max-h-[68vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/10"
        />
      </div>

      {/* Bottom Caption & Send Section */}
      <div className="w-full bg-[#111b21] sm:bg-[#111b21]/95 border-t border-white/10 p-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex flex-col gap-2.5">
        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-gray-400 font-medium shrink-0 flex items-center gap-1 pl-1 text-[11px]">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Vorschlag:</span>
          </span>
          {QUICK_PHOTO_CAPTIONS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCaption(chip)}
              className="whitespace-nowrap shrink-0 bg-white/10 hover:bg-white/20 text-gray-200 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input & Send button */}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <div className="flex items-center flex-1 bg-[#2a3942] rounded-full px-3.5 py-2 text-white shadow-inner border border-white/5">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Bildunterschrift hinzufügen..."
              autoFocus
              className="flex-1 bg-transparent border-none outline-hidden text-sm sm:text-[15px] placeholder-gray-400 text-white"
            />
          </div>

          <button
            type="submit"
            aria-label="Foto senden"
            className={`${sendBtnBg} text-white w-11 h-11 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all shrink-0`}
            title={`Foto senden für Hinweis #${currentClueNumber}`}
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
