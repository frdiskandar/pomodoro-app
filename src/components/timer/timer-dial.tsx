import { StyleSheet, View } from 'react-native';

import { PixelText, type PixelTextTone } from '@/components/pixel/pixel-text';
import { useTheme } from '@/hooks/use-theme';
import { formatClock } from '@/lib/date';
import { MODE_LABEL, type TimerMode } from '@/lib/types';
import { Spacing } from '@/theme/tokens';

const SEGMENTS = 48;

const MODE_TONE: Record<TimerMode, PixelTextTone> = {
  focus: 'focus',
  short: 'short',
  long: 'long',
};

export function TimerDial({
  size,
  progress,
  remainingSec,
  mode,
  taskTitle,
  cycle,
  cycleTotal,
}: {
  size: number;
  progress: number;
  remainingSec: number;
  mode: TimerMode;
  taskTitle: string | null;
  cycle: number;
  cycleTotal: number;
}) {
  const theme = useTheme();
  const accent = mode === 'focus' ? theme.focus : mode === 'short' ? theme.short : theme.long;
  const block = Math.max(5, Math.round(size * 0.023));
  const radius = size / 2 - block * 1.7;
  const center = size / 2;
  const activeSegments = Math.round(progress * SEGMENTS);

  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      {Array.from({ length: SEGMENTS }, (_, index) => {
        const angle = (index / SEGMENTS) * Math.PI * 2 - Math.PI / 2;
        const x = center + radius * Math.cos(angle) - block / 2;
        const y = center + radius * Math.sin(angle) - block / 2;
        const filled = index < activeSegments;
        return (
          <View
            key={index}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: block,
              height: block,
              backgroundColor: filled ? accent : theme.ink,
              opacity: filled ? 1 : 0.11,
            }}
          />
        );
      })}

      <View
        style={[
          StyleSheet.absoluteFill,
          { alignItems: 'center', justifyContent: 'center' },
        ]}>
        <PixelText variant="label" tone={MODE_TONE[mode]}>
          {MODE_LABEL[mode]}
        </PixelText>

        <PixelText
          variant="display"
          style={{
            fontSize: Math.round(size * 0.2),
            lineHeight: Math.round(size * 0.24),
            marginVertical: Spacing.xs,
          }}>
          {formatClock(remainingSec)}
        </PixelText>

        <View style={{ maxWidth: size * 0.64 }}>
          <PixelText variant="small" tone={taskTitle ? 'soft' : 'muted'} numberOfLines={1}>
            {taskTitle ?? 'Tanpa tugas'}
          </PixelText>
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: 4,
            marginTop: Spacing.md,
          }}>
          {Array.from({ length: cycleTotal }, (_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderWidth: 1,
                borderColor: theme.line,
                backgroundColor: index < cycle ? accent : 'transparent',
                opacity: index < cycle ? 1 : 0.35,
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
