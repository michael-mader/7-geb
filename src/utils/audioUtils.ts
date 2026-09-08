/**
 * Audio utilities for the treasure hunt chat app
 */

// Formats seconds to mm:ss format
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Generates an array of visual waveform bar heights (0.15 - 1.0)
export function generateWaveform(seed: number = 42, count: number = 36): number[] {
  const bars: number[] = [];
  let prev = 0.5;
  for (let i = 0; i < count; i++) {
    // Generate organic-looking speech waveform pattern
    const sinFactor = Math.sin((i / count) * Math.PI) * 0.4 + 0.3;
    const randomJitter = (Math.sin(i * 3.7 + seed) * 0.5 + 0.5) * 0.4;
    const value = Math.max(0.18, Math.min(1.0, (prev * 0.3) + (sinFactor + randomJitter) * 0.7));
    bars.push(Number(value.toFixed(2)));
    prev = value;
  }
  return bars;
}

// Play notification sound for incoming or sent message
export function playNotificationSound(type: 'sent' | 'incoming', enabled: boolean = true) {
  if (!enabled) return;

  try {
    const audio = new Audio();
    const basePath = import.meta.env.BASE_URL || './';
    const cleanBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
    audio.src = `${cleanBase}${type}.mp3`;
    audio.volume = 0.7;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback to Web Audio synthesis if autoplay or file load fails
        synthesizeNotificationBeep(type);
      });
    }
  } catch {
    synthesizeNotificationBeep(type);
  }
}

// Web Audio synthesizer beep fallback for UI sounds
export function synthesizeNotificationBeep(type: 'sent' | 'incoming') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'sent') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else {
      // Incoming pleasant double chime
      [
        { freq: 587.33, delay: 0 },
        { freq: 880.00, delay: 0.12 }
      ].forEach(({ freq, delay }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.25, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.25);
      });
    }
  } catch {
    // Ignore audio context errors
  }
}

// Resolves candidate URLs for an audio file (e.g. "1.mp3")
export function resolveAudioSource(filename: string, customUrl?: string): string[] {
  if (customUrl) {
    return [customUrl];
  }
  const basePath = import.meta.env.BASE_URL || './';
  const cleanBase = basePath.endsWith('/') ? basePath : `${basePath}/`;

  return [
    `${cleanBase}${filename}`,
    `./${filename}`,
    `/${filename}`,
    filename
  ];
}
