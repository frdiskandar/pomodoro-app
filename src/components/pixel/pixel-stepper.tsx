import { Pressable, View } from 'react-native';

import { PixelIcon } from '@/components/pixel/pixel-icon';
import { PixelText } from '@/components/pixel/pixel-text';
import { useTheme } from '@/hooks/use-theme';
import { Border, Spacing } from '@/theme/tokens';

export function PixelStepper({
  label,
  hint,
  value,
  unit,
  min,
  max,
  step,
  onChange,
  accent,
}: {
  label: string;
  hint?: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  accent?: string;
}) {
  const theme = useTheme();
  const color = accent ?? theme.ink;

  const clampValue = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: Spacing.md,
        paddingVertical: Spacing.sm,
      }}>
      <View style={{ flex: 1, gap: Spacing.xxs }}>
        <PixelText variant="bodyBold">{label}</PixelText>
        {hint ? (
          <PixelText variant="small" tone="muted">
            {hint}
          </PixelText>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
        <StepButton
          icon="minus"
          label={`Kurangi ${label}`}
          disabled={value <= min}
          onPress={() => onChange(clampValue(value - step))}
          color={color}
        />
        <View style={{ minWidth: 68, alignItems: 'center' }}>
          <PixelText variant="mono" style={{ fontSize: 16, lineHeight: 22 }}>
            {value} {unit}
          </PixelText>
        </View>
        <StepButton
          icon="plus"
          label={`Tambah ${label}`}
          disabled={value >= max}
          onPress={() => onChange(clampValue(value + step))}
          color={color}
        />
      </View>
    </View>
  );
}

function StepButton({
  icon,
  label,
  onPress,
  disabled,
  color,
}: {
  icon: 'minus' | 'plus';
  label: string;
  onPress: () => void;
  disabled: boolean;
  color: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={Spacing.xs}
      onPress={onPress}
      style={{
        width: 34,
        height: 34,
        borderWidth: Border.width,
        borderColor: theme.line,
        backgroundColor: disabled ? theme.surfaceAlt : theme.surface,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
      }}>
      <PixelIcon name={icon} size={12} color={color} />
    </Pressable>
  );
}
