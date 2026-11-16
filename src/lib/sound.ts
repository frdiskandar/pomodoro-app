import { Platform } from 'react-native';

import type { AudioPlayer } from 'expo-audio';

export type SoundCue = 'start' | 'focusComplete' | 'breakComplete';

type AudioModule = typeof import('expo-audio');

const SOURCES: Record<SoundCue, number> = {
  start: require('@/assets/sounds/start.wav'),
  focusComplete: require('@/assets/sounds/focus-complete.wav'),
  breakComplete: require('@/assets/sounds/break-complete.wav'),
};

let audio: AudioModule | null = null;
let unavailable = false;
let configured = false;
let enabled = true;

const players = new Map<SoundCue, AudioPlayer>();

function getAudio(): AudioModule | null {
  if (audio) return audio;
  if (unavailable) return null;
  // The web build is rendered on the server first; audio only exists in a browser.
  if (Platform.OS === 'web' && typeof window === 'undefined') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    audio = require('expo-audio') as AudioModule;
    return audio;
  } catch {
    unavailable = true;
    return null;
  }
}

function playerFor(cue: SoundCue): AudioPlayer | null {
  const cached = players.get(cue);
  if (cached) return cached;
  const module = getAudio();
  if (!module) return null;
  try {
    const player = module.createAudioPlayer(SOURCES[cue]);
    // Short UI cues: keep them out of the way of the user's own music.
    player.volume = 0.9;
    players.set(cue, player);
    return player;
  } catch {
    return null;
  }
}

async function configure(): Promise<void> {
  if (configured) return;
  configured = true;
  const module = getAudio();
  if (!module) return;
  try {
    await module.setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
      allowsRecording: false,
    });
  } catch {
    // Default audio mode still plays the cues; this is best-effort polish.
  }
}

/** Mirrors the `suara` setting; called by the app provider. */
export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

/** Load the clips ahead of time so the first cue is not delayed. */
export function preloadSounds(): void {
  void configure();
  (Object.keys(SOURCES) as SoundCue[]).forEach((cue) => {
    playerFor(cue);
  });
}

export function playSound(cue: SoundCue, options: { force?: boolean } = {}): void {
  if (!enabled && !options.force) return;
  const player = playerFor(cue);
  if (!player) return;
  void configure();
  try {
    if (player.currentTime > 0) {
      player
        .seekTo(0)
        .then(() => player.play())
        .catch(() => undefined);
    } else {
      player.play();
    }
  } catch {
    // Feedback is decoration; a failed cue must never interrupt the timer.
  }
}
