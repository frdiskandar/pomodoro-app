export type TimerMode = 'focus' | 'short' | 'long';
export type TimerStatus = 'idle' | 'running' | 'paused';
export type Period = 'day' | 'week' | 'month';
export type ThemePreference = 'system' | 'light' | 'dark';

export type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
  pomodoros: number;
};

export type Session = {
  id: string;
  mode: TimerMode;
  startedAt: number;
  endedAt: number;
  plannedSec: number;
  taskId: string | null;
  taskTitle: string | null;
};

export type Settings = {
  focusMin: number;
  shortMin: number;
  longMin: number;
  longEvery: number;
  goalPerDay: number;
  autoStartBreak: boolean;
  autoStartFocus: boolean;
  vibrate: boolean;
  notifications: boolean;
  theme: ThemePreference;
};

export type TimerState = {
  mode: TimerMode;
  status: TimerStatus;
  endsAt: number | null;
  remainingSec: number;
  startedAt: number | null;
  cycle: number;
  taskId: string | null;
};

export type PersistedState = {
  version: 1;
  settings: Settings;
  todos: Todo[];
  sessions: Session[];
  timer: TimerState;
};

export const DEFAULT_SETTINGS: Settings = {
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  longEvery: 4,
  goalPerDay: 8,
  autoStartBreak: true,
  autoStartFocus: false,
  vibrate: true,
  notifications: true,
  theme: 'system',
};

export const LIMITS = {
  focusMin: { min: 5, max: 120, step: 5 },
  shortMin: { min: 1, max: 30, step: 1 },
  longMin: { min: 5, max: 60, step: 5 },
  longEvery: { min: 2, max: 8, step: 1 },
  goalPerDay: { min: 1, max: 20, step: 1 },
} as const;

export const MODE_LABEL: Record<TimerMode, string> = {
  focus: 'Fokus',
  short: 'Istirahat',
  long: 'Istirahat panjang',
};

export const MODE_SHORT: Record<TimerMode, string> = {
  focus: 'FOKUS',
  short: 'ISTIRAHAT',
  long: 'PANJANG',
};
