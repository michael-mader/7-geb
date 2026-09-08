import React from 'react';
import { Phone, Video, MoreVertical, ChevronLeft, ShieldCheck, Settings, Trash2, HelpCircle, Maximize2, Minimize2, Smartphone, RefreshCw } from 'lucide-react';
import { mortimerAvatar } from '../constants/avatar';

interface ChatHeaderProps {
  statusText: string;
  isRecordingOrTyping: boolean;
  onOpenProfile: () => void;
  onOpenOrganizer: () => void;
  onStartCall: (video: boolean) => void;
  onClearChat: () => void;
  currentClueIndex: number;
  totalClues: number;
  theme: 'whatsapp' | 'telegram' | 'whatsapp-dark';
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenInstallModal?: () => void;
  canInstall?: boolean;
  isIOS?: boolean;
  onHardReload?: () => void;
  updateAvailable?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  statusText,
  isRecordingOrTyping,
  onOpenProfile,
  onOpenOrganizer,
  onStartCall,
  onClearChat,
  currentClueIndex,
  totalClues,
  theme,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenInstallModal,
  canInstall = false,
  isIOS = false,
  onHardReload,
  updateAvailable = false,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  // Styling based on theme
  const headerBg =
    theme === 'whatsapp-dark'
      ? 'bg-[#1f2c34] text-gray-100 border-b border-gray-800'
      : theme === 'telegram'
      ? 'bg-[#517da2] text-white shadow-sm'
      : 'bg-[#008069] text-white shadow-sm';

  return (
    <header className={`${headerBg} px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between z-30 select-none relative transition-colors duration-200`}>
      {/* Left side: Back, Avatar, Name & Status */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 cursor-pointer" onClick={onOpenProfile}>
        <button
          type="button"
          aria-label="Back"
          className="p-1 -ml-1 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onOpenProfile();
          }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Profile Avatar */}
        <div className="relative shrink-0">
          <img
            src={mortimerAvatar}
            alt="Mortimer Morrison"
            referrerPolicy="no-referrer"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-white/20 shadow-sm"
          />
          {/* Online green indicator */}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#008069] rounded-full"></span>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-semibold text-base sm:text-lg leading-tight truncate">
              Mortimer Morrison
            </h1>
            <span title="Secret Treasure Master">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs opacity-90 truncate">
            {isRecordingOrTyping ? (
              <span className="text-emerald-200 font-medium animate-pulse flex items-center gap-1">
                {statusText}
              </span>
            ) : (
              <span className="truncate">{statusText}</span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Clue badge & Action buttons */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Current Clue Counter Badge */}
        <button
          type="button"
          onClick={onOpenOrganizer}
          className="hidden xs:flex items-center gap-1 bg-black/20 hover:bg-black/30 text-white/90 text-xs px-2.5 py-1 rounded-full font-medium transition-colors"
          title="Klicken, um Hinweise zu verwalten oder Audio zu testen"
        >
          <span>Hinweis {Math.max(1, currentClueIndex - 1)}</span>
          <span className="opacity-60">/ {totalClues}</span>
        </button>

        {/* Video Call */}
        <button
          type="button"
          aria-label="Videoanruf"
          onClick={() => onStartCall(true)}
          className="p-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title="Videoanruf mit Mortimer"
        >
          <Video className="w-5 h-5" />
        </button>

        {/* Voice Call */}
        <button
          type="button"
          aria-label="Sprachanruf"
          onClick={() => onStartCall(false)}
          className="p-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title="Anruf mit Mortimer"
        >
          <Phone className="w-5 h-5" />
        </button>

        {/* Overflow Menu */}
        <div className="relative">
          <button
            type="button"
            aria-label="Menü-Optionen"
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-[#233138] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 z-50 text-gray-800 dark:text-gray-100 text-sm animate-in fade-in zoom-in-95 duration-100">
                {onToggleFullscreen && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onToggleFullscreen();
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 font-medium"
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Vollbild beenden</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Vollbild (ohne Browserleiste)</span>
                      </>
                    )}
                  </button>
                )}

                {onOpenInstallModal && (canInstall || isIOS) && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onOpenInstallModal();
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2.5"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Auf Startbildschirm speichern</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenProfile();
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2.5"
                >
                  <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Mortimers Profil ansehen</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenOrganizer();
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2.5"
                >
                  <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Spielleiter / Hinweise einstellen</span>
                </button>

                {onHardReload && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onHardReload();
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5"
                  >
                    <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>App aktualisieren & Cache leeren</span>
                    {updateAvailable && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-auto" />
                    )}
                  </button>
                )}

                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onClearChat();
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center gap-2.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Chat zurücksetzen</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
