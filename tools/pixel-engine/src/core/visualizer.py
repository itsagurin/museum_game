"""
Visualization helpers for pixel coloring outputs:
- Renders pixel art preview
- Renders color-by-number worksheet/diagram with numbers and palette legend
"""

from typing import Dict, Any
import numpy as np
from PIL import Image, ImageDraw, ImageFont

from src.core.color_utils import hex_to_rgb


def render_pixel_art(
    coloring_data: Dict[str, Any],
    scale: int = 16,
) -> Image.Image:
    """
    Renders the N x N grid as an upscaled pixel art image.

    Args:
        coloring_data: Canonical ADR-003 dict.
        scale: Upscale factor per pixel (e.g. 16 means 32x32 -> 512x512).
    """
    grid = coloring_data["grid"]["data"]
    palette_map = {item["id"]: hex_to_rgb(item["hex"]) for item in coloring_data["palette"]}

    height = len(grid)
    width = len(grid[0])

    rgb_array = np.zeros((height, width, 3), dtype=np.uint8)
    for y in range(height):
        for x in range(width):
            val = grid[y][x]
            rgb_array[y, x] = palette_map.get(val, (255, 255, 255))

    img = Image.fromarray(rgb_array)
    # Upscale with NEAREST so pixels are perfectly sharp
    upscaled = img.resize((width * scale, height * scale), resample=Image.Resampling.NEAREST)
    return upscaled


def render_color_by_number(
    coloring_data: Dict[str, Any],
    cell_size: int = 24,
) -> Image.Image:
    """
    Renders a color-by-number diagram:
    - Grid of cells with numbers 1..5
    - Palette legend at the bottom with color swatches, IDs, and hex/name.
    """
    grid = coloring_data["grid"]["data"]
    palette = coloring_data["palette"]
    height = len(grid)
    width = len(grid[0])

    grid_width_px = width * cell_size
    grid_height_px = height * cell_size
    legend_height_px = 70
    margin = 16

    total_width = grid_width_px + 2 * margin
    total_height = grid_height_px + legend_height_px + 2 * margin

    canvas = Image.new("RGB", (total_width, total_height), color=(255, 255, 255))
    draw = ImageDraw.Draw(canvas)

    # Draw grid background and numbers
    grid_origin_x = margin
    grid_origin_y = margin

    font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    try:
        font = ImageFont.truetype(font_path, size=max(10, cell_size // 2))
        font_legend = ImageFont.truetype(font_path, size=11)
        font_swatch = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size=12)
    except Exception:
        font = ImageFont.load_default()
        font_legend = font
        font_swatch = font

    for y in range(height):
        for x in range(width):
            val = grid[y][x]
            x1 = grid_origin_x + x * cell_size
            y1 = grid_origin_y + y * cell_size
            x2 = x1 + cell_size
            y2 = y1 + cell_size

            # Cell border
            draw.rectangle([x1, y1, x2, y2], outline=(220, 220, 220), width=1)

            # Draw number centered
            text = str(val)
            bbox = draw.textbbox((0, 0), text, font=font)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]
            tx = x1 + (cell_size - text_w) // 2
            ty = y1 + (cell_size - text_h) // 2
            draw.text((tx, ty), text, fill=(80, 80, 80), font=font)

    # Outer grid border
    draw.rectangle(
        [grid_origin_x, grid_origin_y, grid_origin_x + grid_width_px, grid_origin_y + grid_height_px],
        outline=(50, 50, 50),
        width=2,
    )

    # Draw palette legend at bottom
    legend_top = grid_origin_y + grid_height_px + 12
    num_items = len(palette)
    swatch_width = (grid_width_px - (num_items - 1) * 8) // num_items
    swatch_height = 28

    for i, p in enumerate(palette):
        sx1 = grid_origin_x + i * (swatch_width + 8)
        sy1 = legend_top
        sx2 = sx1 + swatch_width
        sy2 = sy1 + swatch_height

        rgb = hex_to_rgb(p["hex"])
        draw.rectangle([sx1, sy1, sx2, sy2], fill=rgb, outline=(30, 30, 30), width=1)

        # Draw number on swatch (contrasting color)
        num_str = f"#{p['id']}"
        l = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]
        text_color = (255, 255, 255) if l < 130 else (0, 0, 0)

        n_bbox = draw.textbbox((0, 0), num_str, font=font_swatch)
        nw = n_bbox[2] - n_bbox[0]
        nh = n_bbox[3] - n_bbox[1]
        draw.text((sx1 + (swatch_width - nw) // 2, sy1 + (swatch_height - nh) // 2), num_str, fill=text_color, font=font_swatch)

        # Draw label below swatch with clean truncation
        label = p.get("name", p["hex"])
        max_chars = max(8, swatch_width // 7)
        if len(label) > max_chars:
            label = label[:max_chars - 1] + "…"
        lbl_bbox = draw.textbbox((0, 0), label, font=font_legend)
        lw = lbl_bbox[2] - lbl_bbox[0]
        lx = max(sx1, sx1 + (swatch_width - lw) // 2)
        draw.text((lx, sy2 + 4), label, fill=(50, 50, 50), font=font_legend)

    return canvas
