import { useColorScheme } from 'react-native';

import { useAppData } from '@/state/app-context';
import { palettes, type Palette } from '@/theme/palette';

export function useScheme(): 'light' | 'dark' {
  const systemScheme = useColorScheme();
  const { settings } = useAppData();
  if (settings.theme === 'light' || settings.theme === 'dark') return settings.theme;
  return systemScheme === 'dark' ? 'dark' : 'light';
}

export function useTheme(): Palette {
  return palettes[useScheme()];
}
