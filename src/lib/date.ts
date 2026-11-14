import type { Period } from './types';

export const DAY_MS = 86_400_000;

const DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const DAY_LONG = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTH_LONG = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function startOfDay(ts: number): number {
  const date = new Date(ts);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function startOfWeek(ts: number): number {
  const date = new Date(startOfDay(ts));
  const weekday = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - weekday);
  return date.getTime();
}

export function startOfMonth(ts: number): number {
  const date = new Date(ts);
  date.setHours(0, 0, 0, 0);
  date.setDate(1);
  return date.getTime();
}

export function addDays(ts: number, amount: number): number {
  const date = new Date(ts);
  date.setDate(date.getDate() + amount);
  return date.getTime();
}

export function addMonths(ts: number, amount: number): number {
  const date = new Date(ts);
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);
  return date.getTime();
}

export function daysInMonth(ts: number): number {
  const date = new Date(ts);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function dateKey(ts: number): string {
  const date = new Date(ts);
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function isSameDay(a: number, b: number): boolean {
  return dateKey(a) === dateKey(b);
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${`${minutes}`.padStart(2, '0')}:${`${seconds}`.padStart(2, '0')}`;
}

export function formatDuration(totalSeconds: number): string {
  const totalMinutes = Math.max(0, Math.round(totalSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} mnt`;
  if (minutes === 0) return `${hours} jam`;
  return `${hours} jam ${minutes} mnt`;
}

export function formatDurationShort(totalSeconds: number): string {
  const totalMinutes = Math.max(0, Math.round(totalSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}j ${`${minutes}`.padStart(2, '0')}m`;
}

export function formatTimeOfDay(ts: number): string {
  const date = new Date(ts);
  return `${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}`;
}

export function formatDayLabel(ts: number): string {
  const date = new Date(ts);
  return `${DAY_SHORT[date.getDay()]}, ${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
}

export function formatDayLong(ts: number): string {
  const date = new Date(ts);
  return `${DAY_LONG[date.getDay()]}, ${date.getDate()} ${MONTH_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

export function monthName(ts: number): string {
  return MONTH_LONG[new Date(ts).getMonth()];
}

export function weekdayShort(ts: number): string {
  return DAY_SHORT[new Date(ts).getDay()];
}

export function formatPeriodLabel(period: Period, anchor: number): string {
  if (period === 'day') return formatDayLabel(anchor);
  if (period === 'week') {
    const start = startOfWeek(anchor);
    const end = addDays(start, 6);
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.getDate()} – ${endDate.getDate()} ${MONTH_SHORT[endDate.getMonth()]}`;
    }
    return `${startDate.getDate()} ${MONTH_SHORT[startDate.getMonth()]} – ${endDate.getDate()} ${MONTH_SHORT[endDate.getMonth()]}`;
  }
  return `${monthName(anchor)} ${new Date(anchor).getFullYear()}`;
}

export function formatMonthShort(ts: number): string {
  return MONTH_SHORT[new Date(ts).getMonth()];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
