import { View } from 'react-native';

import { PixelText } from '@/components/pixel/pixel-text';
import { useTheme } from '@/hooks/use-theme';
import type { Bucket } from '@/lib/stats';
import { Border, Spacing } from '@/theme/tokens';

const LEVELS = 12;

export function PixelBarChart({
  buckets,
  maxSec,
  accent,
  height = 120,
  emptyLabel = 'Belum ada aktivitas',
}: {
  buckets: Bucket[];
  maxSec: number;
  accent: string;
  height?: number;
  emptyLabel?: string;
}) {
  const theme = useTheme();
  const max = maxSec > 0 ? maxSec : 1;
  const empty = maxSec === 0;

  return (
    <View style={{ gap: Spacing.sm }}>
      {empty ? (
        <View
          style={{
            height: Math.round(height * 0.6),
            borderWidth: Border.width,
            borderColor: theme.line,
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.xxs,
          }}>
          <PixelText variant="caption" tone="muted">
            {emptyLabel}
          </PixelText>
        </View>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            height,
            paddingTop: Spacing.xs,
            gap: 3,
          }}>
          {buckets.map((bucket) => {
            const ratio = Math.min(1, bucket.focusSec / max);
            const level =
              bucket.focusSec > 0 ? Math.max(1 / LEVELS, Math.round(ratio * LEVELS) / LEVELS) : 0;
            return (
              <View
                key={bucket.key}
                accessibilityLabel={`${bucket.label}: ${bucket.sessions} sesi`}
                style={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                <View
                  style={{
                    height: 2,
                    backgroundColor: bucket.isNow ? accent : theme.ink,
                    opacity: bucket.isNow ? 1 : 0.12,
                  }}
                />
                {level > 0 ? (
                  <View
                    style={{
                      height: `${level * 100}%`,
                      backgroundColor: accent,
                      marginTop: -2,
                      opacity: bucket.isNow ? 1 : 0.85,
                    }}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      <View style={{ flexDirection: 'row', height: 14 }}>
        {buckets.map((bucket) => (
          <View key={`label-${bucket.key}`} style={{ flex: 1, alignItems: 'center' }}>
            {bucket.showLabel ? (
              <View
                pointerEvents="none"
                style={{ position: 'absolute', top: 0, width: 44, alignItems: 'center' }}>
                <PixelText
                  variant="caption"
                  tone={bucket.isNow ? 'ink' : 'muted'}
                  style={{ fontSize: 8, lineHeight: 12 }}
                  numberOfLines={1}>
                  {bucket.label}
                </PixelText>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}
