import { useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { PixelIcon } from '@/components/pixel/pixel-icon';
import { PixelBarChart } from '@/components/pixel/pixel-chart';
import { PixelIconButton, PixelCard, PixelSegmented } from '@/components/pixel/pixel-surfaces';
import { PixelText } from '@/components/pixel/pixel-text';
import { Screen, ScreenHeader } from '@/components/screen';
import { StatTile, TaskBreakdownList } from '@/components/stats/stat-parts';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import {
  addDays,
  addMonths,
  formatDuration,
  formatDurationShort,
  formatMonthShort,
  formatPeriodLabel,
  formatTimeOfDay,
  isSameDay,
} from '@/lib/date';
import { computeStreak, periodRange, summarize } from '@/lib/stats';
import { useAppData } from '@/state/app-context';
import type { Period } from '@/lib/types';
import { Border, Spacing } from '@/theme/tokens';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Hari' },
  { value: 'week', label: 'Minggu' },
  { value: 'month', label: 'Bulan' },
];

export default function StatisticsScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { sessions, settings } = useAppData();
  const [period, setPeriod] = useState<Period>('day');
  const [anchor, setAnchor] = useState(() => Date.now());

  // Below ~390dp the three summary tiles get too narrow for their labels.
  const narrow = width < 390;

  const now = useNow();
  const summary = useMemo(
    () => summarize(sessions, period, anchor, now),
    [sessions, period, anchor, now]
  );

  const currentRange = periodRange(period, now);
  const shownRange = periodRange(period, anchor);
  const isCurrent = shownRange.start === currentRange.start;

  const daySpan =
    period === 'day' ? 1 : period === 'week' ? 7 : summary.buckets.length;
  const goalSessions = settings.goalPerDay * daySpan;
  const goalPercent = Math.min(
    100,
    Math.round((summary.focusSessions / Math.max(1, goalSessions)) * 100)
  );
  const streak = useMemo(() => computeStreak(sessions, now), [sessions, now]);

  const shift = (direction: -1 | 1) => {
    setAnchor((current) => {
      if (period === 'day') return addDays(current, direction);
      if (period === 'week') return addDays(current, direction * 7);
      return addMonths(current, direction);
    });
  };

  const changePeriod = (next: Period) => {
    setPeriod(next);
    setAnchor(Date.now());
  };

  const rangeSessions = summary.rangeSessions
    .filter((session) => session.mode === 'focus')
    .sort((a, b) => b.endedAt - a.endedAt)
    .slice(0, 8);

  const peakLabel = useMemo(() => {
    const peak = summary.buckets.reduce(
      (best, bucket) => (bucket.focusSec > best.focusSec ? bucket : best),
      summary.buckets[0]
    );
    if (!peak || peak.focusSec === 0) return '—';
    if (period === 'day') return `${peak.label}:00`;
    return peak.label;
  }, [summary.buckets, period]);

  const peakHint =
    summary.maxBucketSec === 0
      ? 'waktu terbaik'
      : period === 'day'
        ? 'jam tersibuk'
        : period === 'week'
          ? 'hari terbaik'
          : `${formatMonthShort(anchor)} terbaik`;

  const totalLabel =
    period === 'day'
      ? formatDuration(summary.focusSec)
      : formatDurationShort(summary.focusSec);

  return (
    <Screen>
      <ScreenHeader title="Statistik" subtitle="Ringkasan aktivitas" />

      <PixelSegmented options={PERIODS} value={period} onChange={changePeriod} />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <PixelIconButton
          accessibilityLabel="Periode sebelumnya"
          size={44}
          onPress={() => shift(-1)}
          icon={<PixelIcon name="left" size={14} color={theme.ink} />}
        />
        <View style={{ alignItems: 'center', gap: 2, flex: 1 }}>
          <PixelText variant="mono" style={{ fontSize: 13 }}>
            {formatPeriodLabel(period, anchor)}
          </PixelText>
          {!isCurrent ? (
            <PixelText
              variant="caption"
              tone="focus"
              onPress={() => setAnchor(Date.now())}
              style={{ paddingHorizontal: Spacing.sm }}>
              kembali ke sekarang
            </PixelText>
          ) : (
            <PixelText variant="caption" tone="muted">
              periode berjalan
            </PixelText>
          )}
        </View>
        <PixelIconButton
          accessibilityLabel="Periode berikutnya"
          size={44}
          disabled={isCurrent}
          onPress={() => shift(1)}
          icon={<PixelIcon name="right" size={14} color={theme.ink} />}
        />
      </View>

      <PixelCard>
        <PixelText variant="caption" tone="muted">
          Total fokus
        </PixelText>
        <PixelText
          variant="display"
          style={{ fontSize: 34, lineHeight: 40, marginTop: Spacing.xxs }}>
          {totalLabel}
        </PixelText>
        <View style={{ flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.sm }}>
          <Metric label="Sesi" value={`${summary.focusSessions}`} />
          <Metric label="Istirahat" value={formatDurationShort(summary.breakSec)} />
          <Metric label="Rentetan" value={`${streak} hari`} />
        </View>
      </PixelCard>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
        <StatTile
          label="Rata-rata"
          value={formatDurationShort(summary.avgFocusSec)}
          hint={period === 'day' ? 'per sesi' : 'per hari'}
          style={narrow ? { flexBasis: '47%' } : undefined}
        />
        <StatTile
          label="Target"
          value={`${goalPercent}%`}
          hint={`${summary.focusSessions}/${goalSessions} sesi`}
          accent={theme.focus}
          style={narrow ? { flexBasis: '47%' } : undefined}
        />
        <StatTile
          label="Puncak"
          value={peakLabel}
          hint={peakHint}
          style={narrow ? { flexBasis: '47%' } : undefined}
        />
      </View>

      <PixelCard>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <PixelText variant="label">Aktivitas fokus</PixelText>
          <PixelText variant="caption" tone="muted">
            menit
          </PixelText>
        </View>
        <View style={{ marginTop: Spacing.md }}>
          <PixelBarChart buckets={summary.buckets} maxSec={summary.maxBucketSec} accent={theme.focus} />
        </View>
      </PixelCard>

      <PixelCard>
        <PixelText variant="label">Per tugas</PixelText>
        <View style={{ marginTop: Spacing.md }}>
          <TaskBreakdownList items={summary.byTask} />
        </View>
      </PixelCard>

      <PixelCard padded={false}>
        <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md }}>
          <PixelText variant="label">Sesi terakhir</PixelText>
        </View>
        <View style={{ height: Border.width, backgroundColor: theme.line }} />
        {rangeSessions.length === 0 ? (
          <View style={{ padding: Spacing.lg }}>
            <PixelText variant="small" tone="muted">
              Belum ada sesi fokus yang selesai pada periode ini.
            </PixelText>
          </View>
        ) : (
          rangeSessions.map((session, index) => (
            <View key={session.id}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing.md,
                  paddingHorizontal: Spacing.lg,
                  paddingVertical: Spacing.md,
                }}>
                <View style={{ width: 8, height: 8, backgroundColor: theme.focus }} />
                <View style={{ flex: 1, gap: 2 }}>
                  <PixelText variant="bodyBold" numberOfLines={1}>
                    {session.taskTitle ?? 'Tanpa tugas'}
                  </PixelText>
                  <PixelText variant="caption" tone="muted">
                    {isSameDay(session.endedAt, now)
                      ? `Hari ini · ${formatTimeOfDay(session.endedAt)}`
                      : formatTimeOfDay(session.endedAt)}
                  </PixelText>
                </View>
                <PixelText variant="mono" tone="muted" style={{ fontSize: 12 }}>
                  {Math.round(session.plannedSec / 60)} mnt
                </PixelText>
              </View>
              {index < rangeSessions.length - 1 ? (
                <View style={{ height: Border.width, backgroundColor: theme.line }} />
              ) : null}
            </View>
          ))
        )}
      </PixelCard>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <PixelText variant="caption" tone="muted">
        {label}
      </PixelText>
      <PixelText variant="mono">{value}</PixelText>
    </View>
  );
}
