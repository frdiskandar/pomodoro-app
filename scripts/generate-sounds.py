#!/usr/bin/env python3
"""Generate the chiptune UI sounds used by the timer.

Run from the project root:
    python3 scripts/generate-sounds.py

Each cue is a short, mono, 16-bit PCM WAV rendered from square/triangle waves
plus a soft envelope, so the files stay tiny and keep the pixel-art character.
"""

from __future__ import annotations

import math
import struct
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOUNDS = ROOT / "assets" / "sounds"

SAMPLE_RATE = 44100
MAX_AMPLITUDE = 0.34  # headroom; the player volume is fixed by the OS

Note = tuple[float, float]  # (frequency in Hz, duration in seconds)


def envelope(index: int, total: int) -> float:
    """Fast attack, exponential decay, click-free release."""
    attack = max(1, int(0.004 * SAMPLE_RATE))
    release = max(1, int(0.010 * SAMPLE_RATE))
    if index < attack:
        attack_gain = index / attack
    else:
        decay_t = (index - attack) / SAMPLE_RATE
        attack_gain = math.exp(-decay_t / 0.075)
    if index > total - release:
        attack_gain *= max(0.0, (total - index) / release)
    return attack_gain


def oscillator(kind: str, phase: float) -> float:
    cycle = phase % 1.0
    if kind == "pulse":
        return 1.0 if cycle < 0.25 else -1.0
    if kind == "square":
        return 1.0 if cycle < 0.5 else -1.0
    # triangle: softer, used for the "back to work" cue
    return 4.0 * abs(cycle - 0.5) - 1.0


def render(notes: list[Note], kind: str, glide: float = 0.0) -> list[int]:
    samples: list[int] = []
    last = 0.0
    for note_index, (frequency, duration) in enumerate(notes):
        total = max(1, int(duration * SAMPLE_RATE))
        phase = 0.0
        for index in range(total):
            # A tiny glide between notes keeps the arpeggios from clicking.
            bend = 1.0 + glide * (note_index / max(1, len(notes) - 1) - 0.5)
            phase += (frequency * bend) / SAMPLE_RATE
            value = oscillator(kind, phase) * envelope(index, total)
            # One-pole low pass tames the harshest harmonics of the pulse wave.
            last += 0.55 * (value - last)
            samples.append(int(max(-1.0, min(1.0, last)) * MAX_AMPLITUDE * 32767))
        # 12 ms of silence between notes makes each step audible.
        samples.extend([0] * int(0.012 * SAMPLE_RATE))
    return samples


def write(name: str, samples: list[int]) -> None:
    path = SOUNDS / name
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(SAMPLE_RATE)
        handle.writeframes(b"".join(struct.pack("<h", sample) for sample in samples))
    print(f"{path.name}: {len(samples) / SAMPLE_RATE:.2f}s, {path.stat().st_size / 1024:.1f} kB")


def main() -> None:
    SOUNDS.mkdir(parents=True, exist_ok=True)

    # "Mulai" — two quick rising blips.
    write("start.wav", render([(880.0, 0.055), (1174.66, 0.10)], "pulse"))

    # Fokus selesai — bright rising arpeggio, the reward cue.
    write(
        "focus-complete.wav",
        render([(1046.5, 0.075), (1318.51, 0.075), (1567.98, 0.22)], "pulse"),
    )

    # Istirahat selesai — calmer triangle pair, "back to work".
    write("break-complete.wav", render([(659.25, 0.09), (880.0, 0.20)], "triangle"))


if __name__ == "__main__":
    main()
