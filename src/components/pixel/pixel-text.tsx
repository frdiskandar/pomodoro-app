import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Fonts } from '@/theme/tokens';
import type { Palette } from '@/theme/palette';

export type PixelTextVariant =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'label'
  | 'mono'
  | 'body'
  | 'bodyBold'
  | 'small'
  | 'caption';

export type PixelTextTone = 'ink' | 'soft' | 'muted' | 'inverse' | 'focus' | 'short' | 'long';

function toneColor(theme: Palette, tone: PixelTextTone): string {
  switch (tone) {
    case 'soft':
      return theme.inkSoft;
    case 'muted':
      return theme.inkMuted;
    case 'inverse':
      return theme.onAccent;
    case 'focus':
      return theme.focus;
    case 'short':
      return theme.short;
    case 'long':
      return theme.long;
    default:
      return theme.ink;
  }
}

export function PixelText({
  variant = 'body',
  tone = 'ink',
  style,
  ...rest
}: TextProps & { variant?: PixelTextVariant; tone?: PixelTextTone }) {
  const theme = useTheme();
  const base: TextStyle = styles[variant];
  return <Text {...rest} style={[base, { color: toneColor(theme, tone) }, style]} />;
}

const styles: Record<PixelTextVariant, TextStyle> = {
  display: {
    fontFamily: Fonts.pixelBold,
    fontSize: 44,
    lineHeight: 52,
  },
  title: {
    fontFamily: Fonts.pixelBold,
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: Fonts.pixelBold,
    fontSize: 16,
    lineHeight: 22,
  },
  label: {
    fontFamily: Fonts.pixel,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: Fonts.pixel,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  bodyBold: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  small: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  caption: {
    fontFamily: Fonts.pixel,
    fontSize: 9,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
};
