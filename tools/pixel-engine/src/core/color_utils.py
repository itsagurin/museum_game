"""
Color utility functions for color space conversions, hex formatting,
and naming colors in Polish based on CIELAB perceptual distance.
"""

from typing import List, Tuple
import numpy as np


# Standard D65 reference white point
XN = 0.95047
YN = 1.00000
ZN = 1.08883


def rgb_to_hex(r: int, g: int, b: int) -> str:
    """Convert RGB integers (0-255) to hex string uppercase (#RRGGBB)."""
    return f"#{int(np.clip(r, 0, 255)):02X}{int(np.clip(g, 0, 255)):02X}{int(np.clip(b, 0, 255)):02X}"


def hex_to_rgb(hex_str: str) -> Tuple[int, int, int]:
    """Convert hex string (#RRGGBB) to (r, g, b) tuple."""
    hex_str = hex_str.lstrip("#")
    if len(hex_str) != 6:
        raise ValueError(f"Invalid hex string: {hex_str}")
    return int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16)


def rgb_to_lab(rgb_array: np.ndarray, max_value: float = 255.0) -> np.ndarray:
    """
    Convert RGB image or array to CIELAB.
    Input shape: (..., 3) with channels in 0..max_value (255 for 8-bit images).
    Output shape: (..., 3) where L in [0, 100], a in [-128, 127], b in [-128, 127]

    The scale is explicit: guessing it from the maximum value turned very dark
    8-bit images such as (1, 1, 1) into white.
    """
    rgb = np.asarray(rgb_array, dtype=np.float64) / max_value

    # sRGB to linear RGB
    linear_mask = rgb > 0.04045
    linear_rgb = np.empty_like(rgb)
    linear_rgb[linear_mask] = np.power((rgb[linear_mask] + 0.055) / 1.055, 2.4)
    linear_rgb[~linear_mask] = rgb[~linear_mask] / 12.92

    # Linear RGB to XYZ (D65)
    r = linear_rgb[..., 0]
    g = linear_rgb[..., 1]
    b = linear_rgb[..., 2]

    x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / XN
    y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) / YN
    z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / ZN

    def f(t: np.ndarray) -> np.ndarray:
        delta = 6.0 / 29.0
        mask = t > (delta ** 3)
        res = np.empty_like(t)
        res[mask] = np.cbrt(t[mask])
        res[~mask] = t[~mask] / (3.0 * (delta ** 2)) + (4.0 / 29.0)
        return res

    fx = f(x)
    fy = f(y)
    fz = f(z)

    l_star = 116.0 * fy - 16.0
    a_star = 500.0 * (fx - fy)
    b_star = 200.0 * (fy - fz)

    return np.stack([l_star, a_star, b_star], axis=-1)


def lab_to_rgb(lab_array: np.ndarray) -> np.ndarray:
    """
    Convert CIELAB array to RGB (0-255).
    Input shape: (..., 3)
    """
    lab = np.asarray(lab_array, dtype=np.float64)
    l_star = lab[..., 0]
    a_star = lab[..., 1]
    b_star = lab[..., 2]

    fy = (l_star + 16.0) / 116.0
    fx = fy + (a_star / 500.0)
    fz = fy - (b_star / 200.0)

    delta = 6.0 / 29.0

    def f_inv(t: np.ndarray) -> np.ndarray:
        mask = t > delta
        res = np.empty_like(t)
        res[mask] = np.power(t[mask], 3)
        res[~mask] = 3.0 * (delta ** 2) * (t[~mask] - 4.0 / 29.0)
        return res

    x = f_inv(fx) * XN
    y = f_inv(fy) * YN
    z = f_inv(fz) * ZN

    # XYZ to linear RGB
    r_lin = x * 3.2404542 - y * 1.5371385 - z * 0.4985314
    g_lin = -x * 0.9692660 + y * 1.8760108 + z * 0.0415560
    b_lin = x * 0.0556434 - y * 0.2040259 + z * 1.0572252

    lin_rgb = np.stack([r_lin, g_lin, b_lin], axis=-1)
    lin_rgb = np.clip(lin_rgb, 0.0, 1.0)

    # Linear to sRGB
    srgb_mask = lin_rgb > 0.0031308
    srgb = np.empty_like(lin_rgb)
    srgb[srgb_mask] = 1.055 * np.power(lin_rgb[srgb_mask], 1.0 / 2.4) - 0.055
    srgb[~srgb_mask] = 12.92 * lin_rgb[~srgb_mask]

    rgb_255 = np.clip(np.round(srgb * 255.0), 0, 255).astype(np.uint8)
    return rgb_255


# Rich Polish artistic and cultural color reference palette
POLISH_ART_COLOR_REFERENCE = [
    ("#7A141A", "Czerwień szkarłatna", "Scarlet red"),
    ("#8B0000", "Głęboki karmin", "Deep carmine"),
    ("#B22222", "Ceglasta czerwień", "Brick red"),
    ("#CD5C5C", "Rdzawy koral", "Rusty coral"),
    ("#1F1A24", "Czerń nocy", "Night black"),
    ("#121212", "Czerń węglowa", "Charcoal black"),
    ("#2F4F4F", "Grafit bazaltowy", "Basalt graphite"),
    ("#3B3B3B", "Ciemny antracyt", "Dark anthracite"),
    ("#5A5A5A", "Szary stalowy", "Steel grey"),
    ("#808080", "Średni popiel", "Ash grey"),
    ("#C0C0C0", "Srebrzysty szary", "Silver grey"),
    ("#E3D5C5", "Kremowy pergamin", "Cream parchment"),
    ("#F5F5DC", "Kość słoniowa", "Ivory"),
    ("#FFF8DC", "Jasny alabaster", "Light alabaster"),
    ("#FFFFFF", "Biel antyczna", "Antique white"),
    ("#C69C55", "Złoto wawelskie", "Wawel gold"),
    ("#DAA520", "Złoty ugier", "Golden ochre"),
    ("#B8860B", "Stare złoto", "Old gold"),
    ("#D4AF37", "Czyste złoto", "Pure gold"),
    ("#F4A460", "Ciepły piaskowiec", "Warm sandstone"),
    ("#D2B48C", "Jasna terakota", "Light terracotta"),
    ("#8B4513", "Mahoń królewski", "Royal mahogany"),
    ("#4B2E1E", "Ciemny brąz ziemisty", "Dark earth brown"),
    ("#654321", "Ciemna sepia", "Dark sepia"),
    ("#A0522D", "Brunatny orzech", "Walnut brown"),
    ("#002366", "Błękit pruski", "Prussian blue"),
    ("#191970", "Granat wawelski", "Wawel navy"),
    ("#4682B4", "Stalowy błękit", "Steel blue"),
    ("#5F9EA0", "Morski lazur", "Sea azure"),
    ("#87CEEB", "Błękit nieba", "Sky blue"),
    ("#B0E0E6", "Jasny kobalt", "Light cobalt"),
    ("#1B4D3E", "Zieleń butelkowa", "Bottle green"),
    ("#2E8B57", "Zieleń mchowa", "Moss green"),
    ("#556B2F", "Oliwka leśna", "Forest olive"),
    ("#6B8E23", "Zieleń polna", "Field green"),
    ("#8FBC8F", "Jasna szałwia", "Light sage"),
    ("#4A0E4E", "Biskupia purpura", "Bishop purple"),
    ("#800080", "Ciemny fiolet", "Dark violet"),
    ("#DDA0DD", "Liliowy pastel", "Pastel lilac"),
    ("#FF8C00", "Ciemny bursztyn", "Dark amber"),
    ("#FFA500", "Ciepły bursztyn", "Warm amber"),
    ("#FFD700", "Słoneczna żółć", "Sunshine yellow"),
]

# Precompute LAB for the reference palette for fast lookup
_REF_RGB = np.array([hex_to_rgb(h) for h, _, _ in POLISH_ART_COLOR_REFERENCE], dtype=np.float64)
_REF_LAB = rgb_to_lab(_REF_RGB)


def get_polish_color_name(r: int, g: int, b: int) -> str:
    """
    Find the closest aesthetic Polish color name using Delta E in CIELAB space.
    """
    target_lab = rgb_to_lab(np.array([[r, g, b]], dtype=np.float64))[0]
    # Euclidean distance in LAB is Delta E 1976 (perceptual color difference)
    distances = np.linalg.norm(_REF_LAB - target_lab, axis=1)
    closest_idx = int(np.argmin(distances))
    return POLISH_ART_COLOR_REFERENCE[closest_idx][1]


def name_palette(palette: list, grid: dict) -> list:
    """Assign bilingual names, reserving the closest unused name for dominant colours first."""
    counts = {color["id"]: 0 for color in palette}
    for row in grid["data"]:
        for value in row:
            counts[value] += 1
    unused = set(range(len(POLISH_ART_COLOR_REFERENCE)))
    names = {}
    for color in sorted(palette, key=lambda color: (-counts[color["id"]], color["id"])):
        target = rgb_to_lab(np.array([hex_to_rgb(color["hex"])], dtype=np.float64))[0]
        index = min(unused, key=lambda index: (float(np.linalg.norm(_REF_LAB[index] - target)), index))
        unused.remove(index)
        _, name, name_en = POLISH_ART_COLOR_REFERENCE[index]
        names[color["id"]] = {**color, "name": name, "nameEn": name_en}
    return [names[color["id"]] for color in palette]
