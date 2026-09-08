import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, Video, Volume2, Sparkles } from 'lucide-react';
import { mortimerAvatar } from '../constants/avatar';

interface CallModalProps {
  isVideo: boolean;
  onEndCall: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ isVideo, onEndCall }) => {
  const [callState, setCallState] = useState<'calling' | 'connected'>('calling');
  const [callSeconds, setCallSeconds] = useState(0);

  useEffect(() => {
    // Transition from calling to connected after 2.5 seconds
    const timer = setTimeout(() => {
      setCallState('connected');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  const formatCallTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111b21] text-white p-4 animate-in fade-in duration-200">
      <div className="flex flex-col items-center justify-between h-full max-h-[600px] w-full max-w-sm py-8 text-center select-none">
        {/* Top Info */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Satelliten-Expeditionsfunk</span>
          </div>
          <h3 className="text-2xl font-bold mt-2">Mortimer Morrison</h3>
          <p className="text-sm text-gray-300 font-mono">
            {callState === 'calling' ? (
              <span className="animate-pulse">Expedition wird gerufen...</span>
            ) : (
              `Verbunden • ${formatCallTime(callSeconds)}`
            )}
          </p>
        </div>

        {/* Center Avatar with pulse animation */}
        <div className="relative my-auto">
          <div
            className={`w-36 h-36 rounded-full overflow-hidden border-4 border-emerald-500/80 shadow-2xl transition-all ${
              callState === 'calling' ? 'animate-bounce' : 'scale-105'
            }`}
          >
            <img
              src={mortimerAvatar}
              alt="Mortimer Morrison"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {callState === 'connected' && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap animate-pulse">
              📻 Funkspruch-Audio
            </div>
          )}
        </div>

        {/* Spoken Adventurer Message */}
        {callState === 'connected' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 max-w-xs text-xs text-emerald-100 border border-white/10 animate-in fade-in duration-300 mb-4">
            <p className="leading-relaxed">
              „Ahoi, Geburtstags-Detektive! Durch das laute Rauschen des magischen Wasserfalls kann ich euch kaum verstehen! Hört euch unbedingt die Sprachnachrichten im Chat an – darin stecken die geheimen Koordinaten!“
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <button
            type="button"
            aria-label="Stummschalten"
            className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* End Call Button */}
          <button
            type="button"
            aria-label="Auflegen"
            onClick={onEndCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all"
            title="Auflegen und zurück zum Chat"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          <button
            type="button"
            aria-label="Lautsprecher"
            className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
