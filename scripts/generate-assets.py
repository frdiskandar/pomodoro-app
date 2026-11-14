#!/usr/bin/env python3
"""Generate pixel-art assets (tab icons, app icon, splash, notification icon).

Run from the project root:
    python3 scripts/generate-assets.py

Pure PIL, nearest-neighbour scaling so every edge stays on the pixel grid.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageColor

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "assets" / "images"
TAB_ICONS = IMAGES / "tabIcons"

CREAM = "#F4EFE6"
INK = "#14110F"
TOMATO = "#E8503A"
TOMATO_DARK = "#B83725"
LEAF = "#3F8F4A"
LEAF_DARK = "#2C6B35"
WHITE = "#FFFDF7"

TAB_GRIDS = {
    "home": [
        "...##...",
        "..####..",
        ".######.",
        "########",
        ".#....#.",
        ".#.##.#.",
        ".#.##.#.",
        "........",
    ],
    "chart": [
        "........",
        "......#.",
        "....#.#.",
        "..#.#.#.",
        "..#.#.#.",
        "..#.#.#.",
        "########",
        "........",
    ],
    "gear": [
        ".#.##.#.",
        ".######.",
        "###..###",
        "##....##",
        "##....##",
        "###..###",
        ".######.",
        ".#.##.#.",
    ],
}

# 16x16 tomato. . = transparent, o = ink outline, r = tomato, d = shading,
# w = highlight, g = leaf, l = dark leaf
TOMATO_GRID = [
    "................",
    "......gg........",
    ".....lggl.......",
    "....gllllg......",
    "...oooooooo.....",
    "..orrrrrrrro....",
    ".orwwrrrrrrro...",
    ".orwwrrrrrrrro..",
    ".orrrrrrrrrrro..",
    ".orrrrrrrrrrro..",
    ".orrrrrrrrrrdo..",
    ".orrrrrrrrrrdo..",
    "..orrrrrrrrdo...",
    "...oorrrrdoo....",
    ".....oooo.......",
    "................",
]

TOMATO_COLORS = {
    "o": INK,
    "r": TOMATO,
    "d": TOMATO_DARK,
    "w": WHITE,
    "g": LEAF,
    "l": LEAF_DARK,
    ".": (0, 0, 0, 0),
}


def rgb(value: str) -> tuple[int, int, int]:
    return ImageColor.getrgb(value)


def render_grid(grid: list[str], colors: dict[str, object], scale: int) -> Image.Image:
    h = len(grid)
    w = max(len(row) for row in grid)
    image = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pixels = image.load()
    for y, row in enumerate(grid):
        for x, key in enumerate(row):
            color = colors[key]
            if color == (0, 0, 0, 0):
                continue
            pixels[x, y] = color if isinstance(color, tuple) else rgb(color)
    return image.resize((w * scale, h * scale), Image.Resampling.NEAREST)


def render_tab_icons() -> None:
    TAB_ICONS.mkdir(parents=True, exist_ok=True)
    white = {"#": "#FFFFFF", ".": (0, 0, 0, 0)}
    for name, grid in TAB_GRIDS.items():
        for scale, suffix in ((3, ""), (6, "@2x"), (9, "@3x")):
            icon = render_grid(grid, white, scale)
            icon.save(TAB_ICONS / f"{name}{suffix}.png")


def paste_centered(base: Image.Image, overlay: Image.Image) -> None:
    x = (base.width - overlay.width) // 2
    y = (base.height - overlay.height) // 2
    base.alpha_composite(overlay, (x, y))


def render_app_icons() -> None:
    tomato = render_grid(TOMATO_GRID, TOMATO_COLORS, 64)

    icon = Image.new("RGBA", (1024, 1024), CREAM)
    paste_centered(icon, tomato)
    icon.convert("RGB").save(IMAGES / "icon.png")

    splash = render_grid(TOMATO_GRID, TOMATO_COLORS, 32)
    splash.save(IMAGES / "splash-icon.png")

    favicon = icon.resize((64, 64), Image.Resampling.LANCZOS)
    favicon.convert("RGB").save(IMAGES / "favicon.png")

    # Android adaptive icon layers (foreground must sit inside the safe circle).
    foreground = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    paste_centered(foreground, render_grid(TOMATO_GRID, TOMATO_COLORS, 32))
    foreground.save(IMAGES / "android-icon-foreground.png")

    background = Image.new("RGBA", (1024, 1024), CREAM)
    background.convert("RGB").save(IMAGES / "android-icon-background.png")

    mono_colors = {"o": "#FFFFFF", "r": "#FFFFFF", "d": "#FFFFFF", "w": "#FFFFFF",
                   "g": "#FFFFFF", "l": "#FFFFFF", ".": (0, 0, 0, 0)}
    mono = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    paste_centered(mono, render_grid(TOMATO_GRID, mono_colors, 32))
    mono.save(IMAGES / "android-icon-monochrome.png")

    notification = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    paste_centered(notification, render_grid(TOMATO_GRID, mono_colors, 6))
    notification.save(IMAGES / "notification-icon.png")


if __name__ == "__main__":
    render_tab_icons()
    render_app_icons()
    print("pixel assets generated")
