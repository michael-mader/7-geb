import { ChatMessage, HuntSettings } from '../types';

const STORAGE_MESSAGES_KEY = 'treasure_hunt_chat_messages';
const STORAGE_SETTINGS_KEY = 'treasure_hunt_settings';
const STORAGE_CLUE_INDEX_KEY = 'treasure_hunt_clue_index';

export const DEFAULT_SETTINGS: HuntSettings = {
  kidName: 'Detektiv-Team',
  huntTitle: 'Die geheime Geburtstags-Schnitzeljagd',
  totalClues: 5,
  soundEffects: true,
  autoPlayIncoming: true,
  theme: 'whatsapp',
  clueLabels: {
    1: 'Das Abenteuer beginnt',
    2: 'Das geheime Rätsel',
    3: 'Spuren im Garten',
    4: 'Unter der alten Eiche',
    5: 'Die verborgene Schatztruhe',
  },
};

export function getStoredSettings(): HuntSettings {
  try {
    const data = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: HuntSettings) {
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // fallback
  }
}

export function getStoredClueIndex(): number {
  try {
    const val = localStorage.getItem(STORAGE_CLUE_INDEX_KEY);
    if (val !== null) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed >= 1) return parsed;
    }
  } catch {
    // fallback
  }
  return 1;
}

export function saveClueIndex(index: number) {
  try {
    localStorage.setItem(STORAGE_CLUE_INDEX_KEY, index.toString());
  } catch {
    // fallback
  }
}

export function getStoredMessages(): ChatMessage[] | null {
  try {
    const data = localStorage.getItem(STORAGE_MESSAGES_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // fallback
  }
  return null;
}

export function saveMessages(messages: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messages));
  } catch (err) {
    console.warn('LocalStorage quota limit reached while saving messages, attempting fallback pruning...', err);
    try {
      // If quota exceeded, preserve the last 30 messages
      const trimmed = messages.slice(-30);
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(trimmed));
    } catch {
      // If still failing, keep messages without heavy image data for older messages
      try {
        const lightweight = messages.map((m, idx) => {
          if (idx < messages.length - 5 && m.imageUrl) {
            return { ...m, imageUrl: undefined, text: m.text || '[Foto]' };
          }
          return m;
        });
        localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(lightweight));
      } catch {
        // Ignore fallback failure
      }
    }
  }
}

export function clearChatStorage() {
  try {
    localStorage.removeItem(STORAGE_MESSAGES_KEY);
    localStorage.removeItem(STORAGE_CLUE_INDEX_KEY);
  } catch {
    // fallback
  }
}
