export type MessageSender = 'user' | 'mortimer';

export type MessageType = 'voice' | 'text' | 'image';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  text?: string;
  imageUrl?: string;
  audioFile?: string; // e.g. "1.mp3", "2.mp3"
  customAudioUrl?: string; // blob URL if parent uploaded audio directly
  clueNumber?: number;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  duration?: number; // duration in seconds
  caption?: string;
}

export interface HuntSettings {
  kidName: string;
  huntTitle: string;
  totalClues: number;
  soundEffects: boolean;
  autoPlayIncoming: boolean;
  theme: 'whatsapp' | 'telegram' | 'whatsapp-dark';
  clueLabels: Record<number, string>;
}

export interface AudioUploadMap {
  [clueNumber: number]: {
    filename: string;
    blobUrl: string;
    duration?: number;
  };
}
