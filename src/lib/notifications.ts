import { Platform } from 'react-native';

import type { NotificationTriggerInput } from 'expo-notifications';

import type { TimerMode } from './types';

type NotificationsModule = typeof import('expo-notifications');

let Notifications: NotificationsModule | null = null;

if (Platform.OS !== 'web') {
  // Local notifications have no web implementation; loading the module there throws.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Notifications = require('expo-notifications') as NotificationsModule;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const CHANNEL_ID = 'pomodoro';

export const notificationsSupported = Platform.OS !== 'web';

export type NotificationPermission = 'granted' | 'denied' | 'undetermined' | 'unsupported';

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

function isGranted(status: {
  granted: boolean;
  ios?: { status?: number };
}): boolean {
  if (status.granted) return true;
  // PROVISIONAL (3) still allows local notifications.
  return status.ios?.status === 3;
}

async function ensureChannel(): Promise<void> {
  if (!Notifications || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Timer pomodoro',
    description: 'Pemberitahuan saat sesi fokus atau istirahat selesai.',
    importance: Notifications.AndroidImportance.HIGH,
    enableVibrate: true,
    vibrationPattern: [0, 280, 140, 280],
    lightColor: '#E8503A',
  });
}

export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (!Notifications) return 'unsupported';
  try {
    const status = await Notifications.getPermissionsAsync();
    if (isGranted(status)) return 'granted';
    return status.canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'unsupported';
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!Notifications) return 'unsupported';
  return enqueue(async () => {
    try {
      await ensureChannel();
      let status = await Notifications!.getPermissionsAsync();
      if (!isGranted(status) && status.canAskAgain) {
        status = await Notifications!.requestPermissionsAsync();
      }
      if (Platform.OS === 'android') {
        try {
          const exact = await Notifications!.getExactAlarmPermissionsAsync();
          if (!exact.granted && exact.canAskAgain) {
            await Notifications!.requestExactAlarmPermissionsAsync();
          }
        } catch {
          // Exact alarms are a nice-to-have; fall back to best-effort delivery.
        }
      }
      return isGranted(status) ? 'granted' : 'denied';
    } catch {
      return 'unsupported';
    }
  });
}

const NOTIFICATION_COPY: Record<TimerMode, { title: string; body: string }> = {
  focus: {
    title: 'Sesi fokus selesai',
    body: 'Kerja bagus. Waktunya istirahat sejenak.',
  },
  short: {
    title: 'Istirahat selesai',
    body: 'Siap kembali fokus?',
  },
  long: {
    title: 'Istirahat panjang selesai',
    body: 'Mulai siklus pomodoro berikutnya.',
  },
};

export async function cancelScheduledNotifications(): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}

export async function syncTimerNotification(options: {
  enabled: boolean;
  running: boolean;
  endsAt: number | null;
  mode: TimerMode;
}): Promise<void> {
  if (!Notifications) return;
  await enqueue(async () => {
    try {
      await Notifications!.cancelAllScheduledNotificationsAsync();
      if (!options.enabled || !options.running || !options.endsAt) return;
      const permission = await Notifications!.getPermissionsAsync();
      if (!isGranted(permission)) return;
      await ensureChannel();
      const copy = NOTIFICATION_COPY[options.mode];
      await Notifications!.scheduleNotificationAsync({
        content: {
          title: copy.title,
          body: copy.body,
          sound: true,
          data: { url: '/', screen: 'home' },
        },
        trigger: {
          type: Notifications!.SchedulableTriggerInputTypes.DATE,
          date: new Date(options.endsAt),
          channelId: CHANNEL_ID,
        } as NotificationTriggerInput,
      });
    } catch {
      // A missed notification must never interrupt the timer.
    }
  });
}
