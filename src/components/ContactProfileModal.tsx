import React from 'react';
import { X, Phone, Video, ShieldCheck, MapPin, Sparkles, Mic, Calendar, Heart } from 'lucide-react';
import { mortimerAvatar } from '../constants/avatar';

interface ContactProfileModalProps {
  onClose: () => void;
  cluesReceived: number;
  totalClues: number;
}

export const ContactProfileModal: React.FC<ContactProfileModalProps> = ({
  onClose,
  cluesReceived,
  totalClues,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-[#111b21] text-gray-900 dark:text-gray-100 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative bg-emerald-800 h-48 sm:h-56 flex items-center justify-center overflow-hidden">
          <img
            src={mortimerAvatar}
            alt="Mortimer Morrison"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

          {/* Close button */}
          <button
            type="button"
            aria-label="Close profile"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating name and role */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-bold">Mortimer Morrison</h2>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-xs text-emerald-200">
              Weltenbummler & Inhaber der magischen Zoohandlung
            </p>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="p-4 overflow-y-auto space-y-4 text-sm">
          {/* About / Status */}
          <div className="bg-gray-50 dark:bg-[#202c33] p-3 rounded-xl">
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
              Status & Über mich
            </span>
            <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
              „Mit meinem magischen Omnibus reise ich um die ganze Welt, um geheime Hinweise für schlaue Geburtstags-Detektive zu hinterlassen! 🐾🗺️“
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Geheime Geburtstags-Mission aktiv</span>
            </div>
          </div>

          {/* Mission Progress */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Mic className="w-4 h-4" />
                <span>Gefundene Sprach-Hinweise</span>
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-200/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                {cluesReceived} / {totalClues}
              </span>
            </div>
            <div className="w-full bg-emerald-200 dark:bg-emerald-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (cluesReceived / Math.max(1, totalClues)) * 100)}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-2">
              Tippe im Chat auf den grünen Senden-Button, um die nächste Sprachnachricht von Mortimer anzufordern!
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Magischer Omnibus (Aktuelle Koordinaten: Geheimes Versteck)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <span>+44 7700 900345 (Satelliten-Expeditionsfunk)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Aktive Geburtstags-Schnitzeljagd • Heute</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-[#111b21] border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#00a884] hover:bg-[#008f6f] text-white font-medium py-2 rounded-xl text-sm transition-colors shadow-sm"
          >
            Zurück zum Chat
          </button>
        </div>
      </div>
    </div>
  );
};
