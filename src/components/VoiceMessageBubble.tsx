import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic, Volume2, AlertCircle, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { formatTime, generateWaveform, resolveAudioSource } from '../utils/audioUtils';
import { mortimerAvatar } from '../constants/avatar';

interface VoiceMessageBubbleProps {
  message: ChatMessage;
  theme: 'whatsapp' | 'telegram' | 'whatsapp-dark';
  onAudioPlay?: () => void;
  autoPlay?: boolean;
}

export const VoiceMessageBubble: React.FC<VoiceMessageBubbleProps> = ({
  message,
  theme,
  onAudioPlay,
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(message.duration || 0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isUsingSynthesizer, setIsUsingSynthesizer] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const synthTimerRef = useRef<number | null>(null);

  // Memoized waveform bars
  const waveformBars = React.useMemo(() => {
    const seed = (message.clueNumber || 1) * 37;
    return generateWaveform(seed, 34);
  }, [message.clueNumber]);

  // Candidate sources: custom blob URL or files in /public (e.g. 1.mp3)
  const audioSources = React.useMemo(() => {
    const filename = message.audioFile || `${message.clueNumber || 1}.mp3`;
    return resolveAudioSource(filename, message.customAudioUrl);
  }, [message.audioFile, message.clueNumber, message.customAudioUrl]);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Try primary audio source
    if (audioSources.length > 0) {
      audio.src = audioSources[0];
    }

    audio.preload = 'metadata';

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(Math.round(audio.duration));
      }
      setAudioError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      // If primary source failed, try second candidate source if available
      if (audio.src !== audioSources[1] && audioSources[1]) {
        audio.src = audioSources[1];
        return;
      }
      // Note that file might not yet exist; synthesized fallback will take over when user clicks play
      setAudioError(`Audiodatei nicht gefunden. Bereit für Test-Vorschauton.`);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    if (autoPlay) {
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => setIsPlaying(true)).catch(() => {});
      }
    }

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
    };
  }, [audioSources, autoPlay]);

  // Procedural Web Audio synthesizer fallback for mystery clue chime
  const playSynthesizerClue = () => {
    setIsUsingSynthesizer(true);
    setIsPlaying(true);
    setCurrentTime(0);
    const synthDuration = 6;
    setDuration(synthDuration);

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Play a lovely adventurous melodic phrase reminiscent of Mortimer Morrison's magical quest
      const clueNum = message.clueNumber || 1;
      const notes = [
        392.00, // G4
        440.00, // A4
        523.25, // C5
        587.33, // D5
        659.25, // E5
        783.99, // G5
        880.00, // A5
      ];
      // Melodic sequence based on clue index
      const phrase = [
        { freq: notes[clueNum % notes.length], time: 0, dur: 0.5 },
        { freq: notes[(clueNum + 2) % notes.length], time: 0.6, dur: 0.6 },
        { freq: notes[(clueNum + 4) % notes.length], time: 1.3, dur: 0.8 },
        { freq: notes[(clueNum + 1) % notes.length], time: 2.3, dur: 0.5 },
        { freq: notes[(clueNum + 3) % notes.length], time: 3.0, dur: 1.5 },
      ];

      phrase.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0.001, now + time);
        gain.gain.linearRampToValueAtTime(0.25, now + time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    } catch {
      // AudioContext failed
    }

    let progress = 0;
    if (synthTimerRef.current) clearInterval(synthTimerRef.current);
    synthTimerRef.current = window.setInterval(() => {
      progress += 0.2;
      setCurrentTime(progress);
      if (progress >= synthDuration) {
        if (synthTimerRef.current) clearInterval(synthTimerRef.current);
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }, 200);
  };

  const togglePlay = () => {
    if (onAudioPlay) onAudioPlay();

    if (isPlaying) {
      if (audioRef.current && !isUsingSynthesizer) {
        audioRef.current.pause();
      }
      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current);
      }
      setIsPlaying(false);
    } else {
      // Attempt HTMLAudioElement
      if (audioRef.current) {
        const promise = audioRef.current.play();
        if (promise !== undefined) {
          promise
            .then(() => {
              setIsPlaying(true);
              setIsUsingSynthesizer(false);
            })
            .catch(() => {
              // Fallback to synthesizer
              playSynthesizerClue();
            });
        }
      } else {
        playSynthesizerClue();
      }
    }
  };

  // Change playback speed
  const cyclePlaybackRate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rates = [1, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const newRate = rates[nextIdx];
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  // Seek on waveform click
  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * (duration || 5);

    setCurrentTime(targetTime);
    if (audioRef.current && !isUsingSynthesizer) {
      audioRef.current.currentTime = targetTime;
    }
  };

  // Calculate progress percentage
  const currentRatio = duration > 0 ? currentTime / duration : 0;

  // Theming
  const bubbleBg =
    theme === 'whatsapp-dark'
      ? 'bg-[#1f2c34] text-gray-100 shadow-md'
      : theme === 'telegram'
      ? 'bg-white text-gray-800 shadow-md'
      : 'bg-white text-gray-800 shadow-sm';

  const accentColor =
    theme === 'telegram' ? 'bg-[#2a76a8] text-white' : 'bg-[#00a884] text-white';

  const progressColor =
    theme === 'telegram' ? 'bg-[#2a76a8]' : 'bg-[#00a884]';

  const trackColor =
    theme === 'whatsapp-dark' ? 'bg-gray-700' : 'bg-gray-300';

  return (
    <div className="flex flex-col items-start max-w-[90%] sm:max-w-[82%] mb-3 animate-in fade-in slide-in-from-left-2 duration-200">
      {/* Sender name label */}
      <div className="flex items-center gap-1.5 ml-3 mb-1">
        <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
          Mortimer Morrison
        </span>
        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-medium">
          Geheime Sprachnachricht
        </span>
      </div>

      <div
        className={`${bubbleBg} rounded-2xl rounded-tl-sm p-2.5 sm:p-3 relative border border-black/5 dark:border-white/5 transition-all`}
      >
        {/* Main Audio Player Row */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Avatar with microphone badge */}
          <div className="relative shrink-0">
            <img
              src={mortimerAvatar}
              alt="Mortimer Morrison"
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover shadow-sm border border-black/10"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
              <Mic className="w-3 h-3" />
            </div>
          </div>

          {/* Play / Pause Circular Button */}
          <button
            type="button"
            aria-label={isPlaying ? 'Sprach-Hinweis pausieren' : 'Sprach-Hinweis abspielen'}
            onClick={togglePlay}
            className={`${accentColor} shrink-0 w-11 h-11 rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Waveform and Progress Bar */}
          <div className="flex flex-col flex-1 min-w-0 pr-1">
            {/* Interactive Waveform */}
            <div
              ref={waveformRef}
              onClick={handleWaveformClick}
              className="h-8 flex items-center gap-[2.5px] cursor-pointer py-1 relative group select-none"
              title="Klicken oder ziehen zum Spulen"
            >
              {waveformBars.map((heightFactor, idx) => {
                const barProgress = idx / waveformBars.length;
                const isPlayed = barProgress <= currentRatio;
                const barHeight = Math.max(5, Math.round(heightFactor * 26));

                return (
                  <div
                    key={idx}
                    className={`w-[3px] sm:w-[3.5px] rounded-full transition-colors duration-75 ${
                      isPlayed ? progressColor : trackColor
                    } group-hover:opacity-90`}
                    style={{ height: `${barHeight}px` }}
                  />
                );
              })}
            </div>

            {/* Time / Duration and Speed Toggle */}
            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
              <span>
                {isPlaying || currentTime > 0
                  ? formatTime(currentTime)
                  : formatTime(duration || 4)}
              </span>

              {/* Speed toggle pill */}
              <button
                type="button"
                onClick={cyclePlaybackRate}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors"
                title="Geschwindigkeit anpassen"
              >
                {playbackRate}x
              </button>
            </div>
          </div>
        </div>

        {/* Clue Info & Metadata Footer */}
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-semibold">
              Hinweis #{message.clueNumber || 1}
            </span>
            <span className="text-gray-400 dark:text-gray-500 text-[10px]">
              ({message.audioFile || `${message.clueNumber || 1}.mp3`})
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
            <span>{message.timestamp}</span>
            <span className="text-emerald-600 font-bold">✓✓</span>
          </div>
        </div>

        {/* Informative Synthesizer / Audio Status Toast */}
        {isUsingSynthesizer && (
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded">
            <Volume2 className="w-3.5 h-3.5 shrink-0" />
            <span>
              Spielt Audio-Vorschauton. (Lege <code>{message.audioFile || `${message.clueNumber || 1}.mp3`}</code> in <code>public/</code> für deine echte Aufnahme!)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
