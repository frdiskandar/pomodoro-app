import { PixelSegmented } from '@/components/pixel/pixel-surfaces';
import { useAppData, useTimer } from '@/state/app-context';
import type { TimerMode } from '@/lib/types';

const OPTIONS: { value: TimerMode; label: string }[] = [
  { value: 'focus', label: 'Fokus' },
  { value: 'short', label: 'Istirahat' },
  { value: 'long', label: 'Panjang' },
];

export function ModeTabs() {
  const { actions } = useAppData();
  const { timer } = useTimer();
  return (
    <PixelSegmented
      options={OPTIONS}
      value={timer.mode}
      onChange={(mode) => actions.setMode(mode)}
    />
  );
}
