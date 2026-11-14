import {
  addDays,
  clamp,
  dateKey,
  daysInMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  weekdayShort,
} from './date';
import type { Period, Session } from './types';

export type Bucket = {
  key: string;
  label: string;
  showLabel: boolean;
  focusSec: number;
  sessions: number;
  isNow: boolean;
};

export type TaskBreakdown = {
  title: string;
  focusSec: number;
  sessions: number;
};

export type Summary = {
  focusSessions: number;
  focusSec: number;
  breakSec: number;
  avgFocusSec: number;
  goalPercent: number;
  byTask: TaskBreakdown[];
  bestDay: { key: string; focusSec: number } | null;
  peakHour: number | null;
  buckets: Bucket[];
  maxBucketSec: number;
  rangeSessions: Session[];
};

export function periodRange(period: Period, anchor: number): { start: number; end: number } {
  if (period === 'day') {
    const start = startOfDay(anchor);
    return { start, end: addDays(start, 1) };
  }
  if (period === 'week') {
    const start = startOfWeek(anchor);
    return { start, end: addDays(start, 7) };
  }
  const start = startOfMonth(anchor);
  return { start, end: addDays(start, daysInMonth(start)) };
}

function isFocus(session: Session): boolean {
  return session.mode === 'focus';
}

function inRange(session: Session, start: number, end: number): boolean {
  return session.endedAt >= start && session.endedAt < end;
}

function buildBuckets(
  period: Period,
  anchor: number,
  sessions: Session[],
  now: number
): Bucket[] {
  if (period === 'day') {
    const start = startOfDay(anchor);
    const buckets: Bucket[] = Array.from({ length: 24 }, (_, hour) => ({
      key: `${hour}`,
      label: `${`${hour}`.padStart(2, '0')}`,
      showLabel: hour % 6 === 0,
      focusSec: 0,
      sessions: 0,
      isNow: startOfDay(now) === start && new Date(now).getHours() === hour,
    }));
    for (const session of sessions) {
      if (!isFocus(session)) continue;
      const hour = new Date(session.endedAt).getHours();
      buckets[hour].focusSec += session.plannedSec;
      buckets[hour].sessions += 1;
    }
    return buckets;
  }

  if (period === 'week') {
    const start = startOfWeek(anchor);
    const buckets: Bucket[] = Array.from({ length: 7 }, (_, index) => {
      const day = addDays(start, index);
      return {
        key: dateKey(day),
        label: weekdayShort(day),
        showLabel: true,
        focusSec: 0,
        sessions: 0,
        isNow: dateKey(day) === dateKey(now),
      };
    });
    const indexByKey = new Map(buckets.map((bucket, index) => [bucket.key, index]));
    for (const session of sessions) {
      if (!isFocus(session)) continue;
      const index = indexByKey.get(dateKey(session.endedAt));
      if (index === undefined) continue;
      buckets[index].focusSec += session.plannedSec;
      buckets[index].sessions += 1;
    }
    return buckets;
  }

  const start = startOfMonth(anchor);
  const monthDays = daysInMonth(start);
  const buckets: Bucket[] = Array.from({ length: monthDays }, (_, index) => {
    const day = addDays(start, index);
    return {
      key: dateKey(day),
      label: `${index + 1}`,
      showLabel: index === 0 || (index + 1) % 5 === 0,
      focusSec: 0,
      sessions: 0,
      isNow: dateKey(day) === dateKey(now),
    };
  });
  const indexByKey = new Map(buckets.map((bucket, index) => [bucket.key, index]));
  for (const session of sessions) {
    if (!isFocus(session)) continue;
    const index = indexByKey.get(dateKey(session.endedAt));
    if (index === undefined) continue;
    buckets[index].focusSec += session.plannedSec;
    buckets[index].sessions += 1;
  }
  return buckets;
}

export function computeStreak(sessions: Session[], now: number): number {
  const focusedDays = new Set(
    sessions.filter(isFocus).map((session) => dateKey(session.endedAt))
  );
  if (focusedDays.size === 0) return 0;
  let cursor = startOfDay(now);
  if (!focusedDays.has(dateKey(cursor))) {
    cursor = addDays(cursor, -1);
    if (!focusedDays.has(dateKey(cursor))) return 0;
  }
  let streak = 0;
  while (focusedDays.has(dateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function summarize(
  sessions: Session[],
  period: Period,
  anchor: number,
  now: number
): Summary {
  const { start, end } = periodRange(period, anchor);
  const rangeSessions = sessions.filter((session) => inRange(session, start, end));
  const focus = rangeSessions.filter(isFocus);
  const focusSec = focus.reduce((total, session) => total + session.plannedSec, 0);
  const breakSec = rangeSessions
    .filter((session) => !isFocus(session))
    .reduce((total, session) => total + session.plannedSec, 0);

  const taskMap = new Map<string, TaskBreakdown>();
  for (const session of focus) {
    const title = session.taskTitle?.trim() || 'Tanpa tugas';
    const entry = taskMap.get(title) ?? { title, focusSec: 0, sessions: 0 };
    entry.focusSec += session.plannedSec;
    entry.sessions += 1;
    taskMap.set(title, entry);
  }
  const byTask = [...taskMap.values()].sort((a, b) => b.focusSec - a.focusSec);

  const buckets = buildBuckets(period, anchor, rangeSessions, now);
  const maxBucketSec = buckets.reduce((max, bucket) => Math.max(max, bucket.focusSec), 0);
  const peak = buckets.reduce<Bucket | null>(
    (best, bucket) => (best === null || bucket.focusSec > best.focusSec ? bucket : best),
    null
  );

  const dayTotals = new Map<string, number>();
  for (const session of focus) {
    const key = dateKey(session.endedAt);
    dayTotals.set(key, (dayTotals.get(key) ?? 0) + session.plannedSec);
  }
  let bestDay: Summary['bestDay'] = null;
  for (const [key, value] of dayTotals) {
    if (bestDay === null || value > bestDay.focusSec) bestDay = { key, focusSec: value };
  }

  const dayCount =
    period === 'day' ? 1 : period === 'week' ? 7 : Math.max(1, buckets.length);

  const avgFocusSec =
    period === 'day'
      ? focus.length > 0
        ? Math.round(focusSec / focus.length)
        : 0
      : Math.round(focusSec / dayCount);

  return {
    focusSessions: focus.length,
    focusSec,
    breakSec,
    avgFocusSec,
    goalPercent: 0,
    byTask,
    bestDay,
    peakHour: peak && peak.focusSec > 0 ? Number(peak.key) : null,
    buckets,
    maxBucketSec,
    rangeSessions,
  };
}

export function todayFocusCount(sessions: Session[], now: number): number {
  const start = startOfDay(now);
  const end = addDays(start, 1);
  return sessions.filter(
    (session) => isFocus(session) && session.endedAt >= start && session.endedAt < end
  ).length;
}

export function todayFocusSec(sessions: Session[], now: number): number {
  const start = startOfDay(now);
  const end = addDays(start, 1);
  return sessions
    .filter((session) => isFocus(session) && session.endedAt >= start && session.endedAt < end)
    .reduce((total, session) => total + session.plannedSec, 0);
}

export function todayTaskCounts(sessions: Session[], now: number): Record<string, number> {
  const start = startOfDay(now);
  const end = addDays(start, 1);
  const counts: Record<string, number> = {};
  for (const session of sessions) {
    if (!isFocus(session) || !session.taskId) continue;
    if (session.endedAt < start || session.endedAt >= end) continue;
    counts[session.taskId] = (counts[session.taskId] ?? 0) + 1;
  }
  return counts;
}

export function clampMinutes(value: number, min: number, max: number): number {
  return clamp(Math.round(value), min, max);
}
