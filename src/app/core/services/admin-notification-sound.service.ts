import { Injectable } from '@angular/core';

export type AdminNotificationSound = 'classic' | 'chime' | 'soft' | 'urgent' | 'off';

export const ADMIN_NOTIFICATION_SOUND_OPTIONS = [
  { value: 'classic', labelKey: 'NOTIFICATIONS_CENTER.SOUND.OPTIONS.CLASSIC' },
  { value: 'chime', labelKey: 'NOTIFICATIONS_CENTER.SOUND.OPTIONS.CHIME' },
  { value: 'soft', labelKey: 'NOTIFICATIONS_CENTER.SOUND.OPTIONS.SOFT' },
  { value: 'urgent', labelKey: 'NOTIFICATIONS_CENTER.SOUND.OPTIONS.URGENT' },
  { value: 'off', labelKey: 'NOTIFICATIONS_CENTER.SOUND.OPTIONS.OFF' }
] as const;

const STORAGE_KEY = 'admin_notification_sound';

export function normalizeAdminNotificationSound(value?: string | null): AdminNotificationSound {
  switch ((value || '').trim().toLowerCase()) {
    case 'chime':
      return 'chime';
    case 'soft':
      return 'soft';
    case 'urgent':
      return 'urgent';
    case 'off':
      return 'off';
    default:
      return 'classic';
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminNotificationSoundService {
  private audioContext?: AudioContext;
  private currentSound: AdminNotificationSound = this.readStoredSound();

  getCurrentSound(): AdminNotificationSound {
    return this.currentSound;
  }

  setSound(sound?: string | null, options: { persist?: boolean } = {}): AdminNotificationSound {
    const normalized = normalizeAdminNotificationSound(sound);
    this.currentSound = normalized;

    if (options.persist !== false && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    }

    return normalized;
  }

  playCurrent(): void {
    this.play(this.currentSound);
  }

  preview(sound?: string | null): void {
    this.play(normalizeAdminNotificationSound(sound));
  }

  private readStoredSound(): AdminNotificationSound {
    if (typeof window === 'undefined') {
      return 'classic';
    }

    return normalizeAdminNotificationSound(window.localStorage.getItem(STORAGE_KEY));
  }

  private play(sound: AdminNotificationSound): void {
    if (sound === 'off' || typeof window === 'undefined') {
      return;
    }

    const audioContext = this.ensureAudioContext();
    if (!audioContext) {
      return;
    }

    const patterns: Record<Exclude<AdminNotificationSound, 'off'>, Array<{
      at: number;
      frequency: number;
      duration: number;
      gain: number;
      type?: OscillatorType;
    }>> = {
      classic: [
        { at: 0, frequency: 880, duration: 0.16, gain: 0.16, type: 'sine' },
        { at: 0.12, frequency: 660, duration: 0.18, gain: 0.11, type: 'sine' }
      ],
      chime: [
        { at: 0, frequency: 784, duration: 0.16, gain: 0.11, type: 'triangle' },
        { at: 0.16, frequency: 1046, duration: 0.16, gain: 0.11, type: 'triangle' },
        { at: 0.32, frequency: 1318, duration: 0.24, gain: 0.1, type: 'triangle' }
      ],
      soft: [
        { at: 0, frequency: 620, duration: 0.28, gain: 0.06, type: 'sine' },
        { at: 0.18, frequency: 760, duration: 0.2, gain: 0.05, type: 'sine' }
      ],
      urgent: [
        { at: 0, frequency: 980, duration: 0.1, gain: 0.15, type: 'square' },
        { at: 0.14, frequency: 980, duration: 0.1, gain: 0.14, type: 'square' },
        { at: 0.28, frequency: 820, duration: 0.16, gain: 0.12, type: 'square' }
      ]
    };

    const startAt = audioContext.currentTime + 0.01;
    for (const note of patterns[sound]) {
      this.scheduleTone(audioContext, startAt + note.at, note.frequency, note.duration, note.gain, note.type ?? 'sine');
    }
  }

  private ensureAudioContext(): AudioContext | null {
    const AudioContextCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return null;
    }

    this.audioContext ??= new AudioContextCtor();

    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume().catch(() => undefined);
    }

    return this.audioContext;
  }

  private scheduleTone(
    audioContext: AudioContext,
    startAt: number,
    frequency: number,
    duration: number,
    peakGain: number,
    type: OscillatorType
  ): void {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(Math.max(peakGain, 0.0002), startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }
}
