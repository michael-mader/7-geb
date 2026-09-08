import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Lock, Sparkles, Compass, PartyPopper, RotateCcw, Maximize2, X as CloseIcon } from 'lucide-react';
import { ChatMessage, HuntSettings, AudioUploadMap } from './types';
import { ChatHeader } from './components/ChatHeader';
import { VoiceMessageBubble } from './components/VoiceMessageBubble';
import { TextMessageBubble } from './components/TextMessageBubble';
import { ChatInput } from './components/ChatInput';
import { ContactProfileModal } from './components/ContactProfileModal';
import { OrganizerModal } from './components/OrganizerModal';
import { CallModal } from './components/CallModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { InstallGuideModal } from './components/InstallGuideModal';
import { useFullscreen } from './utils/useFullscreen';
import { usePWAInstall } from './utils/usePWAInstall';
import { useAppUpdate } from './utils/useAppUpdate';
import {
  getStoredSettings,
  saveSettings,
  getStoredClueIndex,
  saveClueIndex,
  getStoredMessages,
  saveMessages,
  clearChatStorage,
  DEFAULT_SETTINGS,
} from './utils/storage';
import { playNotificationSound } from './utils/audioUtils';
import { triggerHapticFeedback } from './utils/haptics';

// Initial greeting message from Mortimer
const createInitialMessages = (timeStr?: string): ChatMessage[] => [
  {
    id: 'welcome-1',
    sender: 'mortimer',
    senderName: 'Mortimer Morrison',
    type: 'text',
    text: "Seid gegrüßt, unerschrockene Detektive! 🐾 Hier ist Mortimer Morrison von der magischen Zoohandlung. Mein magischer Omnibus hat heute für eure Geburtstags-Schnitzeljagd einen geheimen Zwischenstopp eingelegt!\n\nSobald euer Team bereit ist, tippt einfach unten auf den grünen Senden-Button, um euren ersten Sprach-Hinweis zu erhalten! 🗺️✨",
    timestamp: timeStr || '10:00',
    status: 'read',
  },
];

export default function App() {
  const [settings, setSettings] = useState<HuntSettings>(getStoredSettings);
  const [clueIndex, setClueIndex] = useState<number>(getStoredClueIndex);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = getStoredMessages();
    return saved && saved.length > 0 ? saved : createInitialMessages();
  });

  const [headerStatus, setHeaderStatus] = useState<string>('online');
  const [isBusy, setIsBusy] = useState<boolean>(false);

  // Fullscreen and PWA hooks
  const appContainerRef = useRef<HTMLDivElement | null>(null);
  const { isFullscreen, toggleFullscreen, enterFullscreen, isStandalone } = useFullscreen(appContainerRef);
  const { isInstallable, install, isIOS } = usePWAInstall();
  const { updateAvailable, applyUpdate, dismissUpdate } = useAppUpdate();
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);
  const [dismissedFullscreenBanner, setDismissedFullscreenBanner] = useState<boolean>(false);

  // Modals & Feedback
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showOrganizerModal, setShowOrganizerModal] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<{ isVideo: boolean } | null>(null);

  // Audio Uploads Map (for custom parent audio uploads in memory)
  const [audioUploads, setAudioUploads] = useState<AudioUploadMap>({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const activeTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Sync state to local storage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveClueIndex(clueIndex);
  }, [clueIndex]);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Smooth scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, headerStatus]);

  // Format current time (e.g. "10:14")
  const getCurrentTimeFormatted = () => {
    const now = new Date();
    return now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  // Handle Send: User sends message -> Mortimer records and responds with next voice message
  const handleSendMessage = (text: string) => {
    if (isBusy) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      senderName: settings.kidName || 'Detektiv-Team',
      type: 'text',
      text,
      timestamp: getCurrentTimeFormatted(),
      status: 'sent',
    };

    // 1. Append user message
    setMessages((prev) => [...prev, userMessage]);
    playNotificationSound('sent', settings.soundEffects);
    triggerHapticFeedback('sent');
    setIsBusy(true);

    // 2. After short delay, mark as read (double blue ticks)
    const t1 = setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMsgId ? { ...msg, status: 'read' } : msg
        )
      );
    }, 450);

    // 3. Status changes to "tippt..." then "nimmt Audio auf... 🎙️"
    const t2 = setTimeout(() => {
      setHeaderStatus('tippt...');
    }, 500);

    const t3 = setTimeout(() => {
      setHeaderStatus('nimmt Audio auf... 🎙️');
    }, 1100);

    // 4. Mortimer delivers the new voice message
    const t4 = setTimeout(() => {
      const thisClueNumber = clueIndex;
      const audioFileName = `${thisClueNumber}.mp3`;
      const customUpload = audioUploads[thisClueNumber];

      const mortimerVoiceMessage: ChatMessage = {
        id: `mortimer-voice-${Date.now()}`,
        sender: 'mortimer',
        senderName: 'Mortimer Morrison',
        type: 'voice',
        audioFile: audioFileName,
        customAudioUrl: customUpload?.blobUrl,
        clueNumber: thisClueNumber,
        timestamp: getCurrentTimeFormatted(),
        status: 'read',
        duration: customUpload?.duration || 8,
      };

      setMessages((prev) => [...prev, mortimerVoiceMessage]);
      playNotificationSound('incoming', settings.soundEffects);
      triggerHapticFeedback('incoming');
      setHeaderStatus('online');
      setIsBusy(false);

      // Increment clue index for next send
      const nextClue = thisClueNumber + 1;
      setClueIndex(nextClue);

      // Celebrate if completed all configured clues!
      if (thisClueNumber >= settings.totalClues) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }
    }, 2400);

    activeTimeoutsRef.current.push(t1, t2, t3, t4);
  };

  // Reset Hunt back to initial state
  const handleResetHunt = () => {
    // 1. Cancel all queued message / status timeouts
    activeTimeoutsRef.current.forEach((t) => clearTimeout(t));
    activeTimeoutsRef.current = [];

    // 2. Stop any active audio playback
    try {
      document.querySelectorAll('audio').forEach((el) => {
        el.pause();
        el.currentTime = 0;
      });
    } catch {
      // ignore
    }

    // 3. Clear stored state in localStorage
    clearChatStorage();
    saveClueIndex(1);

    // 4. Reset messages to fresh initial welcome
    const freshMessages = createInitialMessages(getCurrentTimeFormatted());
    saveMessages(freshMessages);

    // 5. Update component state
    setClueIndex(1);
    setMessages(freshMessages);
    setHeaderStatus('online');
    setIsBusy(false);

    // 6. Show confirmation toast
    setToastMessage('Chat auf Hinweis #1 zurückgesetzt ✨');
    const toastTimeout = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    activeTimeoutsRef.current.push(toastTimeout);
  };

  // Upload custom audio file for a specific clue
  const handleUploadCustomAudio = (clueNumber: number, file: File) => {
    const blobUrl = URL.createObjectURL(file);
    setAudioUploads((prev) => ({
      ...prev,
      [clueNumber]: {
        filename: file.name,
        blobUrl,
      },
    }));

    // Update existing messages with this clue number if any
    setMessages((prev) =>
      prev.map((msg) =>
        msg.clueNumber === clueNumber
          ? { ...msg, customAudioUrl: blobUrl }
          : msg
      )
    );
  };

  const handleClearCustomAudio = (clueNumber: number) => {
    setAudioUploads((prev) => {
      const copy = { ...prev };
      delete copy[clueNumber];
      return copy;
    });
  };

  // Count how many voice clues received so far
  const voiceCluesReceivedCount = messages.filter(
    (m) => m.sender === 'mortimer' && m.type === 'voice'
  ).length;

  // Background style class
  const bgClass =
    settings.theme === 'whatsapp-dark'
      ? 'whatsapp-dark-chat-bg'
      : settings.theme === 'telegram'
      ? 'telegram-chat-bg'
      : 'whatsapp-chat-bg';

  const isFullView = isFullscreen || isStandalone;

  return (
    <div
      ref={appContainerRef}
      className={`flex justify-center items-center w-full select-text transition-all duration-200 ${
        isFullView
          ? 'h-screen h-[100dvh] bg-black overflow-hidden p-0'
          : 'min-h-screen bg-neutral-900 sm:p-4 md:p-6'
      }`}
    >
      {/* Mobile-sized WhatsApp Phone Container */}
      <div
        className={`w-full flex flex-col relative overflow-hidden bg-white dark:bg-[#0b141a] transition-all duration-200 ${
          isFullView
            ? 'h-screen h-[100dvh] max-w-xl md:max-w-2xl shadow-none border-0'
            : 'sm:max-w-md md:max-w-lg h-screen sm:h-[94vh] sm:rounded-3xl shadow-2xl border-0 sm:border border-gray-700/50'
        }`}
      >
        {/* Status Bar Safe Area Spacer */}
        <div 
          className="w-full shrink-0 transition-colors duration-200 z-50"
          style={{
            height: 'env(safe-area-inset-top)',
            backgroundColor: (!isFullView && !dismissedFullscreenBanner)
              ? '#005c4b'
              : updateAvailable
              ? '#059669'
              : settings.theme === 'whatsapp-dark'
              ? '#1f2c34'
              : settings.theme === 'telegram'
              ? '#517da2'
              : '#008069'
          }}
        />

        {/* Fullscreen recommendation banner (when in normal browser mode) */}
        {!isFullView && !dismissedFullscreenBanner && (
          <div className="bg-[#005c4b] text-white text-xs px-3 py-1.5 flex items-center justify-between gap-2 shadow-xs shrink-0 select-none z-30">
            <button
              type="button"
              onClick={enterFullscreen}
              className="flex items-center gap-2 hover:text-emerald-200 font-medium text-left flex-1 min-w-0 truncate"
              title="Browserleiste ausblenden für ein echtes Vollbild-Erlebnis"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="truncate">Tipp: <strong>Vollbild aktivieren</strong> (Browserleiste ausblenden)</span>
            </button>
            <button
              type="button"
              aria-label="Hinweis schließen"
              onClick={() => setDismissedFullscreenBanner(true)}
              className="p-1 hover:bg-black/20 rounded text-emerald-200 hover:text-white shrink-0"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Update Notification Banner */}
        {updateAvailable && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs px-3 py-2 flex items-center justify-between gap-2 shadow-md z-40 shrink-0 border-b border-white/10 animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="font-medium truncate">Neues Update verfügbar!</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={applyUpdate}
                className="bg-white text-emerald-800 hover:bg-emerald-50 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors shadow-xs active:scale-95"
              >
                Jetzt aktualisieren
              </button>
              <button
                type="button"
                aria-label="Update-Hinweis schließen"
                onClick={dismissUpdate}
                className="p-1 hover:bg-black/20 rounded text-white/80 hover:text-white transition-colors"
                title="Später"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Chat Header */}
        <ChatHeader
          statusText={headerStatus}
          isRecordingOrTyping={headerStatus !== 'online'}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenOrganizer={() => setShowOrganizerModal(true)}
          onStartCall={(video) => setActiveCall({ isVideo: video })}
          onClearChat={() => setShowResetConfirmModal(true)}
          currentClueIndex={clueIndex}
          totalClues={settings.totalClues}
          theme={settings.theme}
          isFullscreen={isFullView}
          onToggleFullscreen={toggleFullscreen}
          onOpenInstallModal={() => setShowInstallGuide(true)}
          canInstall={isInstallable}
          isIOS={isIOS}
          onHardReload={applyUpdate}
          updateAvailable={updateAvailable}
        />

        {/* Transient Reset / Notification Toast */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-gray-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg border border-white/10 backdrop-blur-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Chat Message Scrollable Area with Wallpaper */}
        <main
          className={`flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 ${bgClass} flex flex-col justify-start relative`}
        >
          {/* Magic Quest Security Banner */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-1.5 bg-[#ffeecd] dark:bg-[#182229] text-[#54656f] dark:text-[#8696a0] text-[11px] px-3 py-1.5 rounded-lg shadow-xs max-w-[90%] text-center leading-tight border border-black/5 dark:border-white/5">
              <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Sprachnachrichten in diesem Chat sind geheime Hinweise von Mortimer Morrison.
              </span>
            </div>
          </div>

          {/* Date separator pill */}
          <div className="flex justify-center mb-3">
            <div className="bg-white/80 dark:bg-[#182229]/90 backdrop-blur-xs text-gray-600 dark:text-gray-300 text-[10.5px] font-semibold tracking-wider uppercase px-3 py-0.5 rounded-md shadow-xs border border-black/5 dark:border-white/5">
              Heute • Geburtstags-Schnitzeljagd
            </div>
          </div>

          {/* Message List */}
          <div className="flex flex-col space-y-1">
            {messages.map((msg) =>
              msg.type === 'voice' ? (
                <VoiceMessageBubble
                  key={msg.id}
                  message={msg}
                  theme={settings.theme}
                />
              ) : (
                <TextMessageBubble
                  key={msg.id}
                  message={msg}
                  theme={settings.theme}
                />
              )
            )}

            {/* Indicator when Mortimer is recording */}
            {isBusy && (
              <div className="flex items-center gap-2 self-start bg-white/90 dark:bg-[#1f2c34] px-3.5 py-2 rounded-2xl rounded-tl-xs shadow-xs border border-black/5 dark:border-white/5 mb-2 animate-pulse">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Mortimer Morrison nimmt Audio auf... 🎙️
                </span>
              </div>
            )}

            <div ref={messagesEndRef} className="h-2" />
          </div>
        </main>

        {/* Chat Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isBusy}
          theme={settings.theme}
          currentClueNumber={clueIndex}
        />

        {/* Profile Modal */}
        {showProfileModal && (
          <ContactProfileModal
            onClose={() => setShowProfileModal(false)}
            cluesReceived={voiceCluesReceivedCount}
            totalClues={settings.totalClues}
          />
        )}

        {/* Organizer / Game Master Control Panel */}
        {showOrganizerModal && (
          <OrganizerModal
            onClose={() => setShowOrganizerModal(false)}
            currentClueIndex={clueIndex}
            onSetClueIndex={(idx) => setClueIndex(idx)}
            onResetHunt={handleResetHunt}
            settings={settings}
            onUpdateSettings={setSettings}
            audioUploads={audioUploads}
            onUploadCustomAudio={handleUploadCustomAudio}
            onClearCustomAudio={handleClearCustomAudio}
            onHardReload={applyUpdate}
          />
        )}

        {/* Simulated Satellite Call Modal */}
        {activeCall && (
          <CallModal
            isVideo={activeCall.isVideo}
            onEndCall={() => setActiveCall(null)}
          />
        )}

        {/* Reset Confirmation Modal */}
        <ResetConfirmModal
          isOpen={showResetConfirmModal}
          onClose={() => setShowResetConfirmModal(false)}
          onConfirm={handleResetHunt}
        />

        {/* Fullscreen / PWA Install Guide Modal */}
        <InstallGuideModal
          isOpen={showInstallGuide}
          onClose={() => setShowInstallGuide(false)}
          isIOS={isIOS}
          canInstallPrompt={isInstallable}
          onTriggerInstall={install}
        />
      </div>
    </div>
  );
}
