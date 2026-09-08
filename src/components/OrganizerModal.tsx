import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  FileAudio,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Palette,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { HuntSettings, AudioUploadMap } from '../types';
import { resolveAudioSource } from '../utils/audioUtils';

interface OrganizerModalProps {
  onClose: () => void;
  currentClueIndex: number;
  onSetClueIndex: (index: number) => void;
  onResetHunt: () => void;
  settings: HuntSettings;
  onUpdateSettings: (newSettings: HuntSettings) => void;
  audioUploads: AudioUploadMap;
  onUploadCustomAudio: (clueNumber: number, file: File) => void;
  onClearCustomAudio: (clueNumber: number) => void;
}

export const OrganizerModal: React.FC<OrganizerModalProps> = ({
  onClose,
  currentClueIndex,
  onSetClueIndex,
  onResetHunt,
  settings,
  onUpdateSettings,
  audioUploads,
  onUploadCustomAudio,
  onClearCustomAudio,
}) => {
  const [activeTab, setActiveTab] = useState<'clues' | 'audio' | 'github' | 'settings'>('clues');
  const [testingAudioIndex, setTestingAudioIndex] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [audioErrorMsg, setAudioErrorMsg] = useState<string | null>(null);
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);

  // Test an audio track
  const handleTestAudio = (clueNum: number) => {
    setAudioErrorMsg(null);
    if (testingAudioIndex === clueNum) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setTestingAudioIndex(null);
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    const filename = `${clueNum}.mp3`;
    const customUrl = audioUploads[clueNum]?.blobUrl;
    const sources = resolveAudioSource(filename, customUrl);

    const audio = new Audio(sources[0]);
    audioPlayerRef.current = audio;
    setTestingAudioIndex(clueNum);

    audio.play().catch(() => {
      // Try secondary source or show error message
      if (sources[1]) {
        audio.src = sources[1];
        audio.play().catch(() => {
          setAudioErrorMsg(`Hinweis #${clueNum}: Audiodatei "${filename}" noch nicht in public/ gefunden. Du kannst sie oben hochladen.`);
          setTestingAudioIndex(null);
        });
      } else {
        setAudioErrorMsg(`Hinweis #${clueNum}: Audiodatei "${filename}" noch nicht in public/ gefunden. Du kannst sie oben hochladen.`);
        setTestingAudioIndex(null);
      }
    });

    audio.onended = () => {
      setTestingAudioIndex(null);
    };
  };

  const handleFileChange = (clueNum: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadCustomAudio(clueNum, file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-[#111b21] text-gray-900 dark:text-gray-100 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#008069] text-white p-3.5 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <div>
              <h2 className="font-bold text-base sm:text-lg">Schnitzeljagd-Spielleiter</h2>
              <p className="text-xs text-emerald-100">Steuerzentrale für Eltern & Spielleiter</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Einstellungen schließen"
            onClick={onClose}
            className="p-1.5 hover:bg-black/20 rounded-full text-white/90 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1f2c34] text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('clues')}
            className={`flex-1 py-2.5 px-3 text-center border-b-2 transition-colors ${
              activeTab === 'clues'
                ? 'border-[#008069] text-[#008069] dark:text-emerald-400 font-semibold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Hinweis-Ablauf
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-2.5 px-3 text-center border-b-2 transition-colors ${
              activeTab === 'audio'
                ? 'border-[#008069] text-[#008069] dark:text-emerald-400 font-semibold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Audiodateien (.mp3)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-2.5 px-3 text-center border-b-2 transition-colors ${
              activeTab === 'github'
                ? 'border-[#008069] text-[#008069] dark:text-emerald-400 font-semibold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            GitHub Anleitung
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2.5 px-3 text-center border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-[#008069] text-[#008069] dark:text-emerald-400 font-semibold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Design & Sound
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-sm flex-1">
          {/* TAB 1: CLUES */}
          {activeTab === 'clues' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block mb-1">
                  So funktioniert der Ablauf:
                </span>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  Jedes Mal, wenn ein Kind oder Elternteil im Chat auf <strong>Senden</strong> tippt, wechselt Mortimers Status zu <em>„nimmt Audio auf... 🎙️“</em> und liefert die nächste Sprachnachricht (<code>1.mp3</code>, <code>2.mp3</code> usw.).
                </p>
              </div>

              {/* Next Clue Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                  Nächste Sprachnachricht, die gesendet wird:
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    Hinweis #{currentClueIndex} ({currentClueIndex}.mp3)
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={currentClueIndex <= 1}
                      onClick={() => onSetClueIndex(Math.max(1, currentClueIndex - 1))}
                      className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs font-bold disabled:opacity-40"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetClueIndex(currentClueIndex + 1)}
                      className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs font-bold"
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div>
                <span className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Direkt zu einem Hinweis springen:
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => onSetClueIndex(num)}
                      className={`py-2 px-1 rounded-xl text-center font-medium text-xs border transition-all ${
                        currentClueIndex === num
                          ? 'bg-[#008069] text-white border-[#008069] shadow-sm'
                          : 'bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Hinweis {num}
                      <span className="block text-[10px] opacity-75">{num}.mp3</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Hunt */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Schnitzeljagd auf Anfang zurücksetzen</span>
                  </button>
                ) : (
                  <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl p-3 text-xs text-red-800 dark:text-red-300 space-y-2 animate-in fade-in duration-150">
                    <div className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Chat wirklich auf Hinweis #1 zurücksetzen?</span>
                    </div>
                    <p className="text-[11px] text-red-700 dark:text-red-400">
                      Alle bisher gesendeten Sprachnachrichten im Chat werden gelöscht.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onResetHunt();
                          onClose();
                        }}
                        className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                      >
                        Ja, jetzt zurücksetzen
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="py-1.5 px-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-medium"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AUDIO FILES & DIRECT UPLOAD */}
          {activeTab === 'audio' && (
            <div className="space-y-3">
              {audioErrorMsg && (
                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-2.5 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="flex-1">{audioErrorMsg}</span>
                  <button
                    type="button"
                    onClick={() => setAudioErrorMsg(null)}
                    className="text-amber-600 hover:text-amber-800 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
                <p>
                  <strong>Audiodatei-Namen:</strong> Die App sucht nach <code>1.mp3</code>, <code>2.mp3</code>, <code>3.mp3</code> usw. Vorinstallierte Töne sind bereits enthalten, damit alles sofort ausprobiert werden kann!
                </p>
                <p className="mt-1">
                  Du kannst eigene Sprachaufnahmen auch direkt hier von diesem Smartphone oder Tablet hochladen, ganz ohne Programmierkenntnisse.
                </p>
              </div>

              {/* Clues 1 to 5 list with tester and upload */}
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((clueNum) => {
                  const customUpload = audioUploads[clueNum];
                  const isTesting = testingAudioIndex === clueNum;

                  return (
                    <div
                      key={clueNum}
                      className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          aria-label={`Test ${clueNum}.mp3`}
                          onClick={() => handleTestAudio(clueNum)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-colors ${
                            isTesting
                              ? 'bg-amber-500 text-white animate-pulse'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                          title="Audio testen"
                        >
                          {isTesting ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                              Hinweis #{clueNum}
                            </span>
                            <code className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-200/60 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                              {clueNum}.mp3
                            </code>
                          </div>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate block">
                            {customUpload
                              ? `Hochgeladen: ${customUpload.filename}`
                              : `Standard: public/${clueNum}.mp3`}
                          </span>
                        </div>
                      </div>

                      {/* Upload / Replace Action */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className="cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600 shadow-xs flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          <span>{customUpload ? 'Ändern' : 'Hochladen'}</span>
                          <input
                            type="file"
                            accept="audio/*,.mp3,.m4a,.wav"
                            className="hidden"
                            onChange={(e) => handleFileChange(clueNum, e)}
                          />
                        </label>

                        {customUpload && (
                          <button
                            type="button"
                            onClick={() => onClearCustomAudio(clueNum)}
                            className="text-gray-400 hover:text-red-500 p-1 text-xs"
                            title="Hochgeladenes Audio entfernen"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: GITHUB PAGES GUIDE */}
          {activeTab === 'github' && (
            <div className="space-y-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                <span className="font-semibold text-blue-900 dark:text-blue-300 block mb-1">
                  So veröffentlichst du auf GitHub Pages:
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-blue-800 dark:text-blue-200">
                  <li>Nimm deine Sprach-Hinweise auf dem Smartphone oder Computer auf.</li>
                  <li>Benenne die Dateien: <code>1.mp3</code>, <code>2.mp3</code>, <code>3.mp3</code> usw.</li>
                  <li>Lege sie in den <code>public/</code> Ordner deines Projekts.</li>
                  <li>Veröffentliche auf GitHub Pages (das Projekt ist mit relativen Pfaden <code>./</code> vorkonfiguriert).</li>
                </ol>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1">
                <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                  Direkt im Vorschaufenster testen:
                </span>
                <p className="text-gray-600 dark:text-gray-400">
                  Du musst nicht auf GitHub Pages warten! Du kannst die Schnitzeljagd direkt hier im Live-Vorschaufenster ausprobieren. Wenn die Kinder auf Senden tippen, antwortet Mortimer Morrison mit dem jeweiligen Hinweis.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: THEME & SOUND SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Theme Picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Aussehen der Chat-App
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'whatsapp', label: 'WhatsApp Hell', color: 'bg-[#008069]' },
                    { id: 'whatsapp-dark', label: 'WhatsApp Dunkel', color: 'bg-[#1f2c34]' },
                    { id: 'telegram', label: 'Telegram Blau', color: 'bg-[#517da2]' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, theme: t.id as any })}
                      className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                        settings.theme === t.id
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-full h-5 rounded-md ${t.color} mb-1.5`} />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Effects Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  {settings.soundEffects ? (
                    <Volume2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <span className="text-xs font-semibold block text-gray-800 dark:text-gray-200">
                      Benachrichtigungstöne & Soundeffekte
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Spielt WhatsApp-Töne ab, wenn neue Sprachnachrichten eintreffen
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={settings.soundEffects}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, soundEffects: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Kid / Team Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Name des Detektiv-Teams:
                </label>
                <input
                  type="text"
                  value={settings.kidName}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, kidName: e.target.value })
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="z. B. Detektive Leo & Emma"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-[#111b21] border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#008069] hover:bg-[#008f6f] text-white font-medium rounded-xl text-xs transition-colors shadow-sm"
          >
            Speichern & Fortsetzen
          </button>
        </div>
      </div>
    </div>
  );
};
