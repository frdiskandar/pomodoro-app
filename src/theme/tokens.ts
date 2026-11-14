import { Platform } from 'react-native';

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Border = {
  width: 2,
  shadow: 4,
  target: 44,
} as const;

export const Fonts = {
  pixel: 'Silkscreen_400Regular',
  pixelBold: 'Silkscreen_700Bold',
  body: Platform.select({ ios: 'system-ui', android: 'sans-serif', default: 'system-ui' }),
} as const;

export const Layout = {
  maxWidth: 560,
  maxWidthWide: 720,
} as const;
