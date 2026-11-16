import { useSyncExternalStore } from 'react';
import { useColorScheme } from 'react-native';

import { useAppData } from '@/state/app-context';
import { palettes, type Palette } from '@/theme/palette';

const subscribe = () => () => {};

/**
 * The server render cannot know the system colour scheme, so the first client
 * render has to agree with it. `useSyncExternalStore` uses the server snapshot
 * while hydrating and re-renders afterwards, which avoids a hydration mismatch
 * (and the flash-free paint stays light for exactly one frame).
 */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

export function useScheme(): 'light' | 'dark' {
  const systemScheme = useColorScheme();
  const hydrated = useHydrated();
  const { settings } = useAppData();
  if (settings.theme === 'light' || settings.theme === 'dark') return settings.theme;
  if (!hydrated) return 'light';
  return systemScheme === 'dark' ? 'dark' : 'light';
}

export function useTheme(): Palette {
  return palettes[useScheme()];
}
