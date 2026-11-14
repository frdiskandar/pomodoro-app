import { View } from 'react-native';

import { PixelIcon } from '@/components/pixel/pixel-icon';
import {
  PixelButton,
  PixelIconButton,
} from '@/components/pixel/pixel-surfaces';
import { useAppData, useTimer } from '@/state/app-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/theme/tokens';

export function TimerControls() {
  const theme = useTheme();
  const { actions } = useAppData();
  const { timer, progress } = useTimer();

  const running = timer.status === 'running';
  const paused = timer.status === 'paused';

  const primaryLabel = running ? 'Jeda' : paused ? 'Lanjutkan' : 'Mulai';
  const primaryIcon = running ? 'pause' : 'play';
  const canReset = timer.status !== 'idle' || progress > 0;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.md }}>
      <PixelButton
        label={primaryLabel}
        variant="primary"
        style={{ flex: 1 }}
        onPress={running ? actions.pause : actions.start}
        icon={<PixelIcon name={primaryIcon} size={14} color={theme.onAccent} />}
      />
      <PixelIconButton
        accessibilityLabel="Reset timer"
        onPress={actions.reset}
        disabled={!canReset}
        icon={<PixelIcon name="reset" size={16} color={theme.ink} />}
      />
      <PixelIconButton
        accessibilityLabel="Lewati sesi"
        onPress={actions.skip}
        icon={<PixelIcon name="skip" size={16} color={theme.ink} />}
      />
    </View>
  );
}
