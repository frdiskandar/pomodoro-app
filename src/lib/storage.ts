import AsyncStorage from '@react-native-async-storage/async-storage';

import { clamp } from './date';
import { durationForMode } from './timer';
import {
  DEFAULT_SETTINGS,
  LIMITS,
  type PersistedState,
  type Session,
  type Settings,
  type TimerMode,
  type TimerState,
  type TimerStatus,
  type Todo,
} from './types';

const STORAGE_KEY = 'pomo.v1.state';
const MODES: TimerMode[] = ['focus', 'short', 'long'];
const STATUSES: TimerStatus[] = ['idle', 'running', 'paused'];

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function sanitizeSettings(input: unknown): Settings {
  const raw = (input ?? {}) as Partial<Settings>;
  const theme =
    raw.theme === 'light' || raw.theme === 'dark' || raw.theme === 'system'
      ? raw.theme
      : DEFAULT_SETTINGS.theme;

  return {
    focusMin: clamp(
      Math.round(asNumber(raw.focusMin, DEFAULT_SETTINGS.focusMin)),
      LIMITS.focusMin.min,
      LIMITS.focusMin.max
    ),
    shortMin: clamp(
      Math.round(asNumber(raw.shortMin, DEFAULT_SETTINGS.shortMin)),
      LIMITS.shortMin.min,
      LIMITS.shortMin.max
    ),
    longMin: clamp(
      Math.round(asNumber(raw.longMin, DEFAULT_SETTINGS.longMin)),
      LIMITS.longMin.min,
      LIMITS.longMin.max
    ),
    longEvery: clamp(
      Math.round(asNumber(raw.longEvery, DEFAULT_SETTINGS.longEvery)),
      LIMITS.longEvery.min,
      LIMITS.longEvery.max
    ),
    goalPerDay: clamp(
      Math.round(asNumber(raw.goalPerDay, DEFAULT_SETTINGS.goalPerDay)),
      LIMITS.goalPerDay.min,
      LIMITS.goalPerDay.max
    ),
    autoStartBreak: asBoolean(raw.autoStartBreak, DEFAULT_SETTINGS.autoStartBreak),
    autoStartFocus: asBoolean(raw.autoStartFocus, DEFAULT_SETTINGS.autoStartFocus),
    vibrate: asBoolean(raw.vibrate, DEFAULT_SETTINGS.vibrate),
    sound: asBoolean(raw.sound, DEFAULT_SETTINGS.sound),
    notifications: asBoolean(raw.notifications, DEFAULT_SETTINGS.notifications),
    theme,
  };
}

function sanitizeTodos(input: unknown): Todo[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item): item is Todo => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      id: typeof item.id === 'string' ? item.id : Math.random().toString(36).slice(2, 10),
      title: typeof item.title === 'string' ? item.title.slice(0, 120) : '',
      done: Boolean(item.done),
      createdAt: asNumber(item.createdAt, Date.now()),
      pomodoros: Math.max(0, Math.round(asNumber(item.pomodoros, 0))),
    }))
    .filter((item) => item.title.length > 0)
    .slice(-300);
}

function sanitizeSessions(input: unknown): Session[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item): item is Session => Boolean(item) && typeof item === 'object')
    .filter(
      (item) =>
        MODES.includes(item.mode) &&
        Number.isFinite(item.endedAt) &&
        Number.isFinite(item.plannedSec)
    )
    .map((item) => ({
      id: typeof item.id === 'string' ? item.id : Math.random().toString(36).slice(2, 10),
      mode: item.mode,
      startedAt: asNumber(item.startedAt, item.endedAt - item.plannedSec * 1000),
      endedAt: item.endedAt,
      plannedSec: Math.max(0, Math.round(item.plannedSec)),
      taskId: typeof item.taskId === 'string' ? item.taskId : null,
      taskTitle: typeof item.taskTitle === 'string' ? item.taskTitle : null,
    }))
    .slice(-5000);
}

export function sanitizeTimer(input: unknown, settings: Settings): TimerState {
  const raw = (input ?? {}) as Partial<TimerState>;
  const mode = MODES.includes(raw.mode as TimerMode) ? (raw.mode as TimerMode) : 'focus';
  const status = STATUSES.includes(raw.status as TimerStatus)
    ? (raw.status as TimerStatus)
    : 'idle';
  const total = durationForMode(mode, settings);
  const remainingSec = clamp(
    Math.round(asNumber(raw.remainingSec, total)),
    0,
    Math.max(total, 60 * 120)
  );
  const endsAt = typeof raw.endsAt === 'number' && Number.isFinite(raw.endsAt) ? raw.endsAt : null;

  return {
    mode,
    status: status === 'running' && endsAt === null ? 'paused' : status,
    endsAt: status === 'running' ? endsAt : null,
    remainingSec,
    startedAt:
      typeof raw.startedAt === 'number' && Number.isFinite(raw.startedAt) ? raw.startedAt : null,
    cycle: clamp(Math.round(asNumber(raw.cycle, 0)), 0, settings.longEvery),
    taskId: typeof raw.taskId === 'string' ? raw.taskId : null,
  };
}

export async function loadState(): Promise<PersistedState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const settings = sanitizeSettings(parsed.settings);
    return {
      version: 1,
      settings,
      todos: sanitizeTodos(parsed.todos),
      sessions: sanitizeSessions(parsed.sessions),
      timer: sanitizeTimer(parsed.timer, settings),
    };
  } catch {
    return null;
  }
}

export async function saveState(state: PersistedState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage is best-effort; losing a write should never break the timer.
  }
}

export async function clearStoredState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
