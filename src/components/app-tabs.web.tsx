import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { Pressable, useWindowDimensions, View } from 'react-native';

import { PixelIcon, type PixelIconName } from '@/components/pixel/pixel-icon';
import { PixelText } from '@/components/pixel/pixel-text';
import { useTheme } from '@/hooks/use-theme';
import { Border, Layout, Spacing } from '@/theme/tokens';

export default function AppTabs() {
  const { width } = useWindowDimensions();
  // Narrow phones keep the labels readable by dropping the icons.
  const showIcon = width >= 350;

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <PixelTabBar>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon="home" showIcon={showIcon}>
              Home
            </TabButton>
          </TabTrigger>
          <TabTrigger name="statistics" href="/statistics" asChild>
            <TabButton icon="chart" showIcon={showIcon}>
              Statistik
            </TabButton>
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" asChild>
            <TabButton icon="gear" showIcon={showIcon}>
              Setelan
            </TabButton>
          </TabTrigger>
        </PixelTabBar>
      </TabList>
    </Tabs>
  );
}

function PixelTabBar(props: TabListProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: theme.bg,
        borderTopWidth: Border.width,
        borderTopColor: theme.line,
      }}>
      <View
        style={{
          flexDirection: 'row',
          gap: Spacing.xs,
          width: '100%',
          maxWidth: Layout.maxWidth,
          padding: Spacing.xs,
        }}>
        {props.children}
      </View>
    </View>
  );
}

function TabButton({
  children,
  isFocused,
  icon,
  showIcon = true,
  ...props
}: TabTriggerSlotProps & {
  children?: React.ReactNode;
  icon: PixelIconName;
  showIcon?: boolean;
}) {
  const theme = useTheme();
  const color = isFocused ? theme.onAccent : theme.inkMuted;

  const pressableProps = props as unknown as React.ComponentProps<typeof Pressable>;

  return (
    <Pressable {...pressableProps} style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.xs,
          borderWidth: Border.width,
          borderColor: theme.line,
          backgroundColor: isFocused ? theme.ink : theme.surface,
        }}>
        {showIcon ? <PixelIcon name={icon} size={14} color={color} /> : null}
        <PixelText variant="label" tone={isFocused ? 'inverse' : 'muted'}>
          {children}
        </PixelText>
      </View>
    </Pressable>
  );
}
