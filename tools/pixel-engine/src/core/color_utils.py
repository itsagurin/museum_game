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


def rgb_to_lab(rgb_array: np.ndarray) -> np.ndarray:
    """
    Convert RGB image or array (values 0-255 or 0-1) to CIELAB.
    Input shape: (..., 3)
    Output shape: (..., 3) where L in [0, 100], a in [-128, 127], b in [-128, 127]
    """
    rgb = np.asarray(rgb_array, dtype=np.float64)
    if rgb.max() > 1.0:
        rgb = rgb / 255.0

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
    ("#7A141A", "Czerwień szkarłatna"),
    ("#8B0000", "Głęboki karmin"),
    ("#B22222", "Ceglasta czerwień"),
    ("#CD5C5C", "Rdzawy koral"),
    ("#1F1A24", "Czerń nocy"),
    ("#121212", "Czerń węglowa"),
    ("#2F4F4F", "Grafit bazaltowy"),
    ("#3B3B3B", "Ciemny antracyt"),
    ("#5A5A5A", "Szary stalowy"),
    ("#808080", "Średni popiel"),
    ("#C0C0C0", "Srebrzysty szary"),
    ("#E3D5C5", "Kremowy pergamin"),
    ("#F5F5DC", "Kość słoniowa"),
    ("#FFF8DC", "Jasny alabaster"),
    ("#FFFFFF", "Biel antyczna"),
    ("#C69C55", "Złoto wawelskie"),
    ("#DAA520", "Złoty ugier"),
    ("#B8860B", "Stare złoto"),
    ("#D4AF37", "Czyste złoto"),
    ("#F4A460", "Ciepły piaskowiec"),
    ("#D2B48C", "Jasna terakota"),
    ("#8B4513", "Mahoń królewski"),
    ("#4B2E1E", "Ciemny brąz ziemisty"),
    ("#654321", "Ciemna sepia"),
    ("#A0522D", "Brunatny orzech"),
    ("#002366", "Błękit pruski"),
    ("#191970", "Granat wawelski"),
    ("#4682B4", "Stalowy błękit"),
    ("#5F9EA0", "Morski lazur"),
    ("#87CEEB", "Błękit nieba"),
    ("#B0E0E6", "Jasny kobalt"),
    ("#1B4D3E", "Zieleń butelkowa"),
    ("#2E8B57", "Zieleń mchowa"),
    ("#556B2F", "Oliwka leśna"),
    ("#6B8E23", "Zieleń polna"),
    ("#8FBC8F", "Jasna szałwia"),
    ("#4A0E4E", "Biskupia purpura"),
    ("#800080", "Ciemny fiolet"),
    ("#DDA0DD", "Liliowy pastel"),
    ("#FF8C00", "Ciemny bursztyn"),
    ("#FFA500", "Ciepły bursztyn"),
    ("#FFD700", "Słoneczna żółć"),
]

# Precompute LAB for the reference palette for fast lookup
_REF_RGB = np.array([hex_to_rgb(h) for h, _ in POLISH_ART_COLOR_REFERENCE], dtype=np.float64)
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
