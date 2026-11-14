import { Platform, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PixelText } from '@/components/pixel/pixel-text';
import { useTheme } from '@/hooks/use-theme';
import { Layout, Spacing } from '@/theme/tokens';

export function Screen({
  children,
  contentStyle,
  scroll = true,
}: {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
}) {
  const theme = useTheme();
  const content: StyleProp<ViewStyle> = [
    {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.sm,
      // The web tab bar is an overlay; native tabs lay out below the content.
      paddingBottom: Platform.OS === 'web' ? 112 : Spacing.xxxl,
      gap: Spacing.lg,
      width: '100%',
      maxWidth: Layout.maxWidth,
      alignSelf: 'center',
    },
    contentStyle,
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic">
            {children}
          </ScrollView>
        ) : (
          <View style={[content, { flex: 1 }]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: Spacing.md,
        paddingTop: Spacing.sm,
      }}>
      <View style={{ flexShrink: 1, gap: Spacing.xxs }}>
        <PixelText variant="title">{title}</PixelText>
        {subtitle ? (
          <PixelText variant="label" tone="muted">
            {subtitle}
          </PixelText>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return (
    <PixelText variant="label" tone="muted" style={{ paddingHorizontal: Spacing.xs }}>
      {children}
    </PixelText>
  );
}
