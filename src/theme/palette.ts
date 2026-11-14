export type Palette = {
  dark: boolean;
  bg: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  inkSoft: string;
  inkMuted: string;
  line: string;
  shadow: string;
  focus: string;
  focusSoft: string;
  short: string;
  shortSoft: string;
  long: string;
  longSoft: string;
  success: string;
  warning: string;
  onAccent: string;
};

export const palettes: Record<'light' | 'dark', Palette> = {
  light: {
    dark: false,
    bg: '#F4EFE6',
    surface: '#FFFDF7',
    surfaceAlt: '#E9E1D2',
    ink: '#14110F',
    inkSoft: '#5F574C',
    inkMuted: '#93897A',
    line: '#14110F',
    shadow: '#14110F',
    focus: '#E8503A',
    focusSoft: '#F7CFC4',
    short: '#2F9E8F',
    shortSoft: '#C7E6E0',
    long: '#4C6FD1',
    longSoft: '#CDD8F3',
    success: '#4C9A46',
    warning: '#D9A400',
    onAccent: '#FFFDF7',
  },
  dark: {
    dark: true,
    bg: '#131316',
    surface: '#1C1C21',
    surfaceAlt: '#26262D',
    ink: '#F3EEE5',
    inkSoft: '#B6AFA3',
    inkMuted: '#7C756A',
    line: '#F3EEE5',
    shadow: '#000000',
    focus: '#FF6B52',
    focusSoft: '#3B221C',
    short: '#3FBFAE',
    shortSoft: '#17302D',
    long: '#7C97E8',
    longSoft: '#1E2440',
    success: '#6BC462',
    warning: '#E9BE45',
    onAccent: '#131316',
  },
};
