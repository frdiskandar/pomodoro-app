import { useEffect, useState } from 'react';
import { Platform, View, useColorScheme } from 'react-native';

import { PixelIcon } from '@/components/pixel/pixel-icon';
import { PixelButton, PixelCard, PixelSegmented, PixelSwitch } from '@/components/pixel/pixel-surfaces';
import { PixelStepper } from '@/components/pixel/pixel-stepper';
import { PixelText } from '@/components/pixel/pixel-text';
import { Screen, ScreenHeader, SectionLabel } from '@/components/screen';
import { useTheme } from '@/hooks/use-theme';
import {
  getNotificationPermission,
  notificationsSupported,
  requestNotificationPermission,
  type NotificationPermission,
} from '@/lib/notifications';
import { LIMITS, DEFAULT_SETTINGS, type ThemePreference } from '@/lib/types';
import { useAppData } from '@/state/app-context';
import { Spacing } from '@/theme/tokens';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Sistem' },
  { value: 'light', label: 'Terang' },
  { value: 'dark', label: 'Gelap' },
];

const PERMISSION_LABEL: Record<NotificationPermission, string> = {
  granted: 'Diizinkan',
  denied: 'Ditolak — aktifkan lewat pengaturan sistem',
  undetermined: 'Belum diizinkan',
  unsupported: 'Tidak tersedia di web',
};

export default function SettingsScreen() {
  const theme = useTheme();
  const systemScheme = useColorScheme();
  const { settings, actions } = useAppData();
  const [permission, setPermission] = useState<NotificationPermission>('undetermined');
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    void getNotificationPermission().then(setPermission);
  }, []);

  const requestPermission = async () => {
    const next = await requestNotificationPermission();
    setPermission(next);
    if (next === 'granted') actions.setSettings({ notifications: true });
  };

  const resetAll = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    actions.resetData();
    setConfirmReset(false);
  };

  return (
    <Screen>
      <ScreenHeader
        title="Setelan"
        subtitle={settings.theme === 'system' ? `tema ${systemScheme ?? 'light'}` : `tema ${settings.theme}`}
      />

      <SectionLabel>Timer</SectionLabel>
      <PixelCard>
        <PixelStepper
          label="Durasi fokus"
          value={settings.focusMin}
          unit="mnt"
          {...LIMITS.focusMin}
          onChange={(focusMin) => actions.setSettings({ focusMin })}
          accent={theme.focus}
        />
        <Divider />
        <PixelStepper
          label="Istirahat pendek"
          value={settings.shortMin}
          unit="mnt"
          {...LIMITS.shortMin}
          onChange={(shortMin) => actions.setSettings({ shortMin })}
          accent={theme.short}
        />
        <Divider />
        <PixelStepper
          label="Istirahat panjang"
          value={settings.longMin}
          unit="mnt"
          {...LIMITS.longMin}
          onChange={(longMin) => actions.setSettings({ longMin })}
          accent={theme.long}
        />
        <Divider />
        <PixelStepper
          label="Istirahat panjang tiap"
          hint="Jumlah sesi fokus sebelum istirahat panjang"
          value={settings.longEvery}
          unit="sesi"
          {...LIMITS.longEvery}
          onChange={(longEvery) => actions.setSettings({ longEvery })}
        />
      </PixelCard>

      <SectionLabel>Target & otomatisasi</SectionLabel>
      <PixelCard>
        <PixelStepper
          label="Target harian"
          hint="Jumlah sesi fokus yang ingin diselesaikan"
          value={settings.goalPerDay}
          unit="sesi"
          {...LIMITS.goalPerDay}
          onChange={(goalPerDay) => actions.setSettings({ goalPerDay })}
        />
        <Divider />
        <PixelSwitch
          title="Mulai istirahat otomatis"
          description="Istirahat langsung berjalan setelah fokus selesai"
          value={settings.autoStartBreak}
          onChange={(autoStartBreak) => actions.setSettings({ autoStartBreak })}
        />
        <Divider />
        <PixelSwitch
          title="Mulai fokus otomatis"
          description="Sesi fokus langsung berjalan setelah istirahat"
          value={settings.autoStartFocus}
          onChange={(autoStartFocus) => actions.setSettings({ autoStartFocus })}
        />
      </PixelCard>

      <SectionLabel>Umpan balik</SectionLabel>
      <PixelCard>
        <PixelSwitch
          title="Getar"
          description="Getar singkat saat sesi selesai"
          value={settings.vibrate}
          onChange={(vibrate) => actions.setSettings({ vibrate })}
        />
        <Divider />
        <PixelSwitch
          title="Notifikasi lokal"
          description="Beri tahu saat sesi selesai walau app di background"
          value={settings.notifications}
          onChange={(notifications) => actions.setSettings({ notifications })}
        />
        {notificationsSupported ? (
          <View
            style={{
              marginTop: Spacing.sm,
              gap: Spacing.sm,
              borderTopWidth: 2,
              borderTopColor: theme.line,
              paddingTop: Spacing.md,
            }}>
            <View style={{ gap: 2 }}>
              <PixelText variant="caption" tone="muted">
                Izin notifikasi
              </PixelText>
              <PixelText
                variant="small"
                tone={permission === 'granted' ? 'short' : 'muted'}>
                {PERMISSION_LABEL[permission]}
              </PixelText>
              {Platform.OS === 'android' ? (
                <PixelText variant="caption" tone="muted">
                  Android 12+ juga butuh izin alarm presisi
                </PixelText>
              ) : null}
            </View>
            {permission !== 'granted' ? (
              <PixelButton
                label="Aktifkan izin"
                variant="primary"
                onPress={() => void requestPermission()}
                icon={<PixelIcon name="bell" size={14} color={theme.onAccent} />}
                style={{ alignSelf: 'flex-start' }}
              />
            ) : null}
          </View>
        ) : (
          <PixelText variant="small" tone="muted" style={{ marginTop: Spacing.sm }}>
            Notifikasi tidak berjalan di browser. Getar juga tidak tersedia di web.
          </PixelText>
        )}
      </PixelCard>

      <SectionLabel>Tampilan</SectionLabel>
      <PixelCard>
        <PixelText variant="label">Tema</PixelText>
        <View style={{ marginTop: Spacing.sm }}>
          <PixelSegmented
            options={THEME_OPTIONS}
            value={settings.theme}
            onChange={(value) => actions.setSettings({ theme: value })}
          />
        </View>
      </PixelCard>

      <SectionLabel>Data</SectionLabel>
      <PixelCard>
        <PixelText variant="small" tone="muted">
          Semua data disimpan di perangkat ini. Tidak ada akun, tidak ada sinkronisasi.
        </PixelText>
        <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
          <PixelButton
            label="Kembalikan default"
            onPress={() => {
              actions.setSettings(DEFAULT_SETTINGS);
              actions.reset();
            }}
            icon={<PixelIcon name="reset" size={14} color={theme.ink} />}
          />
          <PixelButton
            label={confirmReset ? 'Ketuk lagi untuk hapus' : 'Hapus semua data'}
            variant={confirmReset ? 'danger' : 'secondary'}
            onPress={resetAll}
            icon={<PixelIcon name="trash" size={14} color={theme.ink} />}
          />
        </View>
      </PixelCard>

      <View style={{ alignItems: 'center', gap: Spacing.xs, paddingTop: Spacing.sm }}>
        <PixelText variant="caption" tone="muted">
          Pomodoro · v1.0.0
        </PixelText>
        <PixelText variant="caption" tone="muted">
          dibuat blok per blok
        </PixelText>
      </View>
    </Screen>
  );
}

function Divider() {
  const theme = useTheme();
  return <View style={{ height: 2, backgroundColor: theme.line, opacity: 0.15 }} />;
}
