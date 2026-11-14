import { View, type StyleProp, type ViewStyle } from 'react-native';

import { PixelText } from '@/components/pixel/pixel-text';
import { useTheme } from '@/hooks/use-theme';
import type { Bucket, TaskBreakdown } from '@/lib/stats';
import { Spacing } from '@/theme/tokens';

export function StatTile({
  label,
  value,
  hint,
  accent,
  style,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          flex: 1,
          borderWidth: 2,
          borderColor: theme.line,
          backgroundColor: theme.surface,
          padding: Spacing.md,
          gap: 2,
          minWidth: 0,
        },
        style,
      ]}>
      <PixelText variant="caption" tone="muted" numberOfLines={1}>
        {label}
      </PixelText>
      <PixelText variant="title" style={{ fontSize: 20, lineHeight: 26, color: accent ?? theme.ink }} numberOfLines={1}>
        {value}
      </PixelText>
      {hint ? (
        <PixelText variant="small" tone="muted" numberOfLines={1}>
          {hint}
        </PixelText>
      ) : null}
    </View>
  );
}

export function TaskBreakdownList({ items }: { items: TaskBreakdown[] }) {
  const theme = useTheme();
  const max = items.reduce((value, item) => Math.max(value, item.focusSec), 0) || 1;

  if (items.length === 0) {
    return (
      <PixelText variant="small" tone="muted">
        Belum ada sesi fokus pada periode ini.
      </PixelText>
    );
  }

  return (
    <View style={{ gap: Spacing.md }}>
      {items.slice(0, 6).map((item) => (
        <View key={item.title} style={{ gap: Spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm }}>
            <PixelText variant="small" numberOfLines={1} style={{ flex: 1 }}>
              {item.title}
            </PixelText>
            <PixelText variant="caption" tone="muted">
              {item.sessions} sesi · {Math.round(item.focusSec / 60)} mnt
            </PixelText>
          </View>
          <View style={{ height: 8, backgroundColor: theme.surfaceAlt }}>
            <View
              style={{
                width: `${Math.max(4, (item.focusSec / max) * 100)}%`,
                height: 8,
                backgroundColor: theme.focus,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

export function PeriodSummary({ buckets, maxSec }: { buckets: Bucket[]; maxSec: number }) {
  const theme = useTheme();
  const total = buckets.reduce((value, bucket) => value + bucket.sessions, 0);
  return (
    <View style={{ flexDirection: 'row', gap: Spacing.lg }}>
      <View style={{ flex: 1, gap: 2 }}>
        <PixelText variant="caption" tone="muted">
          Puncak
        </PixelText>
        <PixelText variant="mono" style={{ color: theme.ink }}>
          {maxSec > 0
            ? `${buckets.reduce((best, bucket) => (bucket.focusSec > best.focusSec ? bucket : best), buckets[0]).label}`
            : '—'}
        </PixelText>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <PixelText variant="caption" tone="muted">
          Total sesi
        </PixelText>
        <PixelText variant="mono">{total}</PixelText>
      </View>
    </View>
  );
}
