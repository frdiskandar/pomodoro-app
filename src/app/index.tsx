import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { PixelText } from '@/components/pixel/pixel-text';
import { Screen, ScreenHeader } from '@/components/screen';
import { TimerControls } from '@/components/timer/timer-controls';
import { TimerDial } from '@/components/timer/timer-dial';
import { ModeTabs } from '@/components/timer/mode-tabs';
import { TodoList } from '@/components/todo/todo-list';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { formatDayLong, formatDurationShort } from '@/lib/date';
import { todayFocusCount, todayFocusSec } from '@/lib/stats';
import { useAppData, useTimer } from '@/state/app-context';
import { Border, Spacing } from '@/theme/tokens';

export default function HomeScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { settings, sessions, activeTask } = useAppData();
  const { timer, remainingSec, progress } = useTimer();
  const now = useNow();

  const dialSize = Math.min(width - Spacing.lg * 2 - Spacing.xl, 300);
  const focusSec = useMemo(() => todayFocusSec(sessions, now), [sessions, now]);
  const todayFocus = useMemo(() => todayFocusCount(sessions, now), [sessions, now]);
  const goalPercent = Math.min(100, Math.round((todayFocus / settings.goalPerDay) * 100));
  const taskTitle = activeTask && !activeTask.done ? activeTask.title : null;

  return (
    <Screen>
      <ScreenHeader
        title="Pomodoro"
        subtitle={formatDayLong(now)}
        right={
          <View
            style={{
              borderWidth: Border.width,
              borderColor: theme.line,
              backgroundColor: theme.surface,
              paddingHorizontal: Spacing.sm,
              paddingVertical: Spacing.xs,
              alignItems: 'center',
            }}>
            <PixelText variant="mono" style={{ fontSize: 13 }}>
              {todayFocus}/{settings.goalPerDay}
            </PixelText>
            <PixelText variant="caption" tone="muted" style={{ fontSize: 8 }}>
              sesi
            </PixelText>
          </View>
        }
      />

      <ModeTabs />

      <TimerDial
        size={dialSize}
        progress={progress}
        remainingSec={remainingSec}
        mode={timer.mode}
        taskTitle={taskTitle}
        cycle={timer.cycle}
        cycleTotal={settings.longEvery}
      />

      <TimerControls />

      <View
        style={{
          flexDirection: 'row',
          borderWidth: Border.width,
          borderColor: theme.line,
          backgroundColor: theme.surface,
        }}>
        <MiniStat label="Sesi" value={`${todayFocus}`} />
        <MiniStat label="Fokus" value={formatDurationShort(focusSec)} divider />
        <MiniStat label="Target" value={`${goalPercent}%`} divider />
      </View>

      <TodoList />
    </Screen>
  );
}

function MiniStat({
  label,
  value,
  divider = false,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        alignItems: 'center',
        gap: 2,
        borderLeftWidth: divider ? Border.width : 0,
        borderLeftColor: theme.line,
      }}>
      <PixelText variant="caption" tone="muted">
        {label}
      </PixelText>
      <PixelText variant="mono" style={{ fontSize: 14 }}>
        {value}
      </PixelText>
    </View>
  );
}
