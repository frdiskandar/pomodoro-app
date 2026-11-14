# Pomodoro

Aplikasi pomodoro pixel-art untuk Android, iOS, dan web. Dibangun dengan Expo SDK 58, React Native, dan Expo Router.

## Fitur

- **Timer 48 blok** dengan mode fokus, istirahat pendek, dan istirahat panjang.
- **Siklus otomatis**: setelah fokus selesai, lanjut ke istirahat; istirahat panjang setiap N sesi (bisa diatur).
- **Todolist**: tambah, centang, hapus, dan pilih tugas aktif. Setiap sesi fokus menambah hitungan pomodoro tugas tersebut.
- **Statistik**: ringkasan hari/minggu/bulan, grafik aktivitas per jam/hari, rincian per tugas, rentetan hari, dan daftar sesi terakhir.
- **Setelan**: durasi fokus/istirahat, target harian, mulai otomatis, getar, notifikasi lokal, dan tema terang/gelap/sistem.
- **Tahan restart**: timer memakai timestamp absolut, jadi sesi tetap berjalan dan tercatat walau aplikasi ditutup.
- **Data lokal**: semua data disimpan di perangkat dengan AsyncStorage, tanpa akun atau sinkronisasi.

## Menjalankan

```bash
npm install
npx expo start          # pilih Android/iOS/web
npx expo start --web    # langsung di browser
```

Build native (butuh Android Studio/Xcode):

```bash
npx expo run:android
npx expo run:ios
```

`android/` dan `ios/` adalah folder hasil generate (Continuous Native Generation). Jangan diedit manual — ubah konfigurasi di `app.json` lalu jalankan `npx expo prebuild`.

### Catatan JDK

Gradle pada proyek ini membutuhkan JDK 17–21. Jika JDK default terlalu baru (mis. 27), arahkan `JAVA_HOME` ke JDK 17 sebelum build:

```bash
export JAVA_HOME="$HOME/.local/share/mise/installs/java/temurin-17.0.21+9"
cd android && ./gradlew :app:assembleDebug
```

## Pemeriksaan

```bash
npx tsc --noEmit
npx eslint src
npx expo-doctor
npx expo export --platform web
```

## Notifikasi

- Notifikasi lokal dijadwalkan saat timer berjalan (`expo-notifications`), termasuk kanal Android `pomodoro`.
- Android 12+ membutuhkan izin **alarm presisi** (`SCHEDULE_EXACT_ALARM`) agar notifikasi tepat waktu; tombol izin ada di Setelan.
- Web tidak mendukung notifikasi maupun getar dari aplikasi ini.
- Untuk menguji notifikasi di Android, gunakan development build (`npx expo run:android`), bukan Expo Go.

## Struktur

```text
src/
  app/              rute Expo Router (index, statistics, settings, +html)
  components/
    pixel/          primitif UI pixel: teks, ikon, kartu, tombol, stepper, grafik
    timer/          dial 48 blok, kontrol, tab mode
    todo/           todolist + dialog hapus
    stats/          tile dan rincian statistik
  hooks/            tema, waktu
  lib/              tipe, tanggal, statistik, timer, storage, notifikasi
  state/            reducer + context (data & timer dipisah agar tidak re-render tiap tick)
  theme/            palet dan token desain
assets/
  fonts/            Silkscreen (OFL)
  images/           ikon aplikasi, splash, ikon tab, ikon notifikasi
scripts/
  generate-assets.py  membuat ulang semua aset PNG pixel
```

## Aset

Semua ikon dan splash dibuat secara prosedural agar tetap tajam di grid pixel:

```bash
python3 scripts/generate-assets.py
```
