import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { View } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { useScheme } from '@/hooks/use-theme';
import { AppProvider, useAppData } from '@/state/app-context';
import { palettes } from '@/theme/palette';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Silkscreen_400Regular: require('@/assets/fonts/Silkscreen-Regular.ttf'),
    Silkscreen_700Bold: require('@/assets/fonts/Silkscreen-Bold.ttf'),
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <AppProvider>
      <ThemedApp />
    </AppProvider>
  );
}

function ThemedApp() {
  const scheme = useScheme();
  const theme = palettes[scheme];
  const { ready } = useAppData();

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.bg,
        card: theme.surface,
        text: theme.ink,
        border: theme.line,
        primary: theme.focus,
        notification: theme.focus,
      },
    };
  }, [scheme, theme]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: theme.bg }}>{ready ? <AppTabs /> : null}</View>
    </ThemeProvider>
  );
}
