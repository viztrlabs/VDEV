// Real-time Web Notification and Audio Alert Engine for VizTR Platform

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  url?: string;
  sound?: boolean;
}

/**
 * Check if the current browser environment supports the Web Notification API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermissionStatus {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission as NotificationPermissionStatus;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermissionStatus;
  } catch (error) {
    console.warn('Error requesting notification permission:', error);
    return Notification.permission as NotificationPermissionStatus;
  }
}

/**
 * Plays a subtle, pleasant audio chime using the Web Audio API without external file dependencies
 */
export function playNotificationChime(type: 'success' | 'alert' = 'success'): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'success') {
      // 2-tone melodic harmonic chime (E5 -> B5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(659.25, now); // E5
      osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.12); // B5

      osc2.frequency.setValueAtTime(1318.5, now + 0.08); // E6
      osc2.frequency.exponentialRampToValueAtTime(1975.5, now + 0.22); // B6

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.06);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } else {
      // Subtle alert chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.1); // D6

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (err) {
    // Gracefully ignore audio context restrictions
  }
}

/**
 * Dispatch desktop and system notification
 */
export function dispatchDesktopNotification(payload: NotificationPayload): boolean {
  if (typeof window === 'undefined') return false;

  const { title, body, icon = '/assets/logo.png', tag, url, sound = true } = payload;

  if (sound) {
    playNotificationChime('success');
  }

  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon,
        tag: tag || `viztr-${Date.now()}`,
        silent: !sound,
      });

      if (url) {
        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          window.location.href = url;
        };
      }
      return true;
    } catch (err) {
      console.warn('Native notification dispatch failed:', err);
    }
  }

  return false;
}
