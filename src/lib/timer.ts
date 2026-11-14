import type { Settings, TimerMode, TimerState } from './types';

export function durationForMode(mode: TimerMode, settings: Settings): number {
  if (mode === 'focus') return settings.focusMin * 60;
  if (mode === 'short') return settings.shortMin * 60;
  return settings.longMin * 60;
}

export function remainingForTimer(timer: TimerState, now: number): number {
  if (timer.status === 'running' && timer.endsAt !== null) {
    return Math.max(0, Math.ceil((timer.endsAt - now) / 1000));
  }
  return Math.max(0, timer.remainingSec);
}

export function nextModeAfterComplete(
  mode: TimerMode,
  cycle: number,
  longEvery: number
): { mode: TimerMode; cycle: number } {
  if (mode === 'focus') {
    const nextCycle = cycle + 1;
    return { mode: nextCycle >= longEvery ? 'long' : 'short', cycle: nextCycle };
  }
  if (mode === 'long') {
    return { mode: 'focus', cycle: 0 };
  }
  return { mode: 'focus', cycle };
}

export function nextModeAfterSkip(mode: TimerMode): TimerMode {
  return mode === 'focus' ? 'short' : 'focus';
}
