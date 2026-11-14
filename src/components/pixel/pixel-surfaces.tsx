import { useMemo } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Border, Spacing } from '@/theme/tokens';

import { PixelText } from './pixel-text';

export function PixelCard({
  children,
  style,
  padded = true,
  shadow = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  shadow?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[shadow && styles.shadowWrap, style]}>
      {shadow ? (
        <View
          pointerEvents="none"
          style={[
            styles.shadowBlock,
            { backgroundColor: theme.shadow, borderColor: theme.shadow },
          ]}
        />
      ) : null}
      <View
        style={{
          borderWidth: Border.width,
          borderColor: theme.line,
          backgroundColor: theme.surface,
          padding: padded ? Spacing.lg : 0,
        }}>
        {children}
      </View>
    </View>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function PixelButton({
  label,
  onPress,
  icon,
  variant = 'secondary',
  disabled = false,
  style,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const face =
    variant === 'primary'
      ? { backgroundColor: theme.focus, borderColor: theme.line }
      : variant === 'danger'
        ? { backgroundColor: theme.warning, borderColor: theme.line }
        : variant === 'ghost'
          ? { backgroundColor: theme.bg, borderColor: theme.line }
          : { backgroundColor: theme.surface, borderColor: theme.line };
  const textTone = variant === 'primary' ? 'inverse' : 'ink';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={[styles.shadowWrap, style, disabled && styles.disabled]}>
      {({ pressed }) => (
        <>
          {!pressed ? (
            <View
              pointerEvents="none"
              style={[styles.shadowBlock, { backgroundColor: theme.shadow }]}
            />
          ) : null}
          <View
            style={[
              styles.buttonFace,
              face,
              pressed && { transform: [{ translateX: Border.shadow }, { translateY: Border.shadow }] },
            ]}>
            {icon}
            <PixelText variant="label" tone={textTone}>
              {label}
            </PixelText>
          </View>
        </>
      )}
    </Pressable>
  );
}

export function PixelIconButton({
  onPress,
  icon,
  accessibilityLabel,
  variant = 'secondary',
  disabled = false,
  size = 52,
  style,
}: {
  onPress: () => void;
  icon: React.ReactNode;
  accessibilityLabel: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const face =
    variant === 'primary'
      ? { backgroundColor: theme.focus, borderColor: theme.line }
      : variant === 'danger'
        ? { backgroundColor: theme.warning, borderColor: theme.line }
        : variant === 'ghost'
          ? { backgroundColor: theme.bg, borderColor: theme.line }
          : { backgroundColor: theme.surface, borderColor: theme.line };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={Spacing.sm}
      onPress={onPress}
      style={[styles.shadowWrap, style, disabled && styles.disabled]}>
      {({ pressed }) => (
        <>
          {!pressed ? (
            <View
              pointerEvents="none"
              style={[styles.shadowBlock, { backgroundColor: theme.shadow }]}
            />
          ) : null}
          <View
            style={[
              styles.buttonFace,
              face,
              { width: size - Border.shadow, height: size - Border.shadow },
              pressed && { transform: [{ translateX: Border.shadow }, { translateY: Border.shadow }] },
            ]}>
            {icon}
          </View>
        </>
      )}
    </Pressable>
  );
}

export function PixelSegmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const theme = useTheme();
  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value]
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: Border.width,
        borderColor: theme.line,
        backgroundColor: theme.surface,
      }}>
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              index !== options.length - 1 && {
                borderRightWidth: Border.width,
                borderRightColor: theme.line,
              },
              selected && { backgroundColor: theme.ink },
            ]}>
            <PixelText variant="label" tone={selected ? 'inverse' : 'muted'}>
              {option.label}
            </PixelText>
          </Pressable>
        );
      })}
      <View
        pointerEvents="none"
        style={[
          styles.segmentMarker,
          {
            left: `${selectedIndex * (100 / options.length)}%`,
            width: `${100 / options.length}%`,
            borderBottomColor: theme.focus,
          },
        ]}
      />
    </View>
  );
}

export function PixelSwitch({
  value,
  onChange,
  title,
  description,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description?: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={styles.switchRow}>
      <View style={styles.switchLabel}>
        <PixelText variant="bodyBold">{title}</PixelText>
        {description ? (
          <PixelText variant="small" tone="muted">
            {description}
          </PixelText>
        ) : null}
      </View>
      <View
        style={[
          styles.switchTrack,
          {
            borderColor: theme.line,
            backgroundColor: value ? theme.focus : theme.surfaceAlt,
          },
        ]}>
        <View
          style={[
            styles.switchKnob,
            {
              backgroundColor: value ? theme.onAccent : theme.ink,
              alignSelf: value ? 'flex-end' : 'flex-start',
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

export function PixelCheckbox({
  checked,
  onPress,
  accessibilityLabel,
  accent,
}: {
  checked: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  accent?: string;
}) {
  const theme = useTheme();
  const color = accent ?? theme.focus;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={Spacing.sm}
      onPress={onPress}
      style={{
        width: 26,
        height: 26,
        borderWidth: Border.width,
        borderColor: theme.line,
        backgroundColor: checked ? color : theme.surface,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {checked ? <PixelCheckMark color={theme.onAccent} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    paddingRight: Border.shadow,
    paddingBottom: Border.shadow,
  },
  shadowBlock: {
    position: 'absolute',
    left: Border.shadow,
    top: Border.shadow,
    right: 0,
    bottom: 0,
  },
  buttonFace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: Border.width,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 52,
  },
  disabled: {
    opacity: 0.45,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  segmentMarker: {
    position: 'absolute',
    bottom: 0,
    borderBottomWidth: 3,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  switchLabel: {
    flex: 1,
    gap: Spacing.xxs,
  },
  switchTrack: {
    width: 52,
    height: 28,
    borderWidth: Border.width,
    justifyContent: 'center',
    padding: 2,
  },
  switchKnob: {
    width: 18,
    height: 18,
  },
});

const CHECK_CELLS: [number, number][] = [
  [1, 5],
  [4, 8],
  [7, 5],
  [10, 2],
];

function PixelCheckMark({ color }: { color: string }) {
  return (
    <View style={{ width: 14, height: 14 }}>
      {CHECK_CELLS.map(([left, top]) => (
        <View
          key={`${left}-${top}`}
          style={{
            position: 'absolute',
            left,
            top,
            width: 3,
            height: 3,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}
