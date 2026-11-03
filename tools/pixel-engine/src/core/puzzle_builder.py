"""
Board builder v2 for the game: keeps the artwork's proportions and picks
6-10 clearly different colours instead of a fixed five.

Output schema (version 2) holds only what the board needs; titles, stories
and sources live in the game's content manifest.
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Tuple

import numpy as np
from PIL import Image
from sklearn.cluster import KMeans

from src.core.color_utils import get_polish_color_name, name_palette, lab_to_rgb, rgb_to_hex, rgb_to_lab

SCHEMA_VERSION = 2


@dataclass(frozen=True)
class BoardSettings:
    long_edge: int = 32
    min_short_edge: int = 12
    min_colors: int = 6
    max_colors: int = 10
    # CIE76 distance below which two paints are hard to tell apart on a phone.
    min_delta_e: float = 12.0
    # Colours covering less of the board are folded into their nearest neighbour.
    min_share: float = 0.012
    random_state: int = 42


def grid_size(width: int, height: int, settings: BoardSettings = BoardSettings()) -> Tuple[int, int]:
    """Board columns and rows: the longer side gets long_edge cells, the other follows the artwork."""
    if width >= height:
        return settings.long_edge, max(settings.min_short_edge, round(settings.long_edge * height / width))
    return max(settings.min_short_edge, round(settings.long_edge * width / height)), settings.long_edge


def _merge_palette(labels: np.ndarray, centers: np.ndarray, settings: BoardSettings) -> Tuple[np.ndarray, np.ndarray]:
    """Fold tiny and near-identical clusters together until the palette is distinct or minimal."""
    labels = labels.copy()
    centers = centers.copy()
    while len(centers) > settings.min_colors:
        counts = np.bincount(labels, minlength=len(centers)).astype(np.float64)
        distances = np.linalg.norm(centers[:, None, :] - centers[None, :, :], axis=2)
        np.fill_diagonal(distances, np.inf)
        shares = counts / labels.size
        small = np.flatnonzero(shares < settings.min_share)
        if small.size:
            keep = small[np.argmin(shares[small])]
            other = int(np.argmin(distances[keep]))
        else:
            keep, other = np.unravel_index(np.argmin(distances), distances.shape)
            if distances[keep, other] >= settings.min_delta_e:
                break
        total = counts[keep] + counts[other]
        merged = (centers[keep] * counts[keep] + centers[other] * counts[other]) / max(total, 1.0)
        target, removed = (keep, other) if keep < other else (other, keep)
        centers[target] = merged
        labels[labels == removed] = target
        labels[labels > removed] -= 1
        centers = np.delete(centers, removed, axis=0)
    return labels, centers


def _clean_isolated_cells(grid: np.ndarray) -> np.ndarray:
    """Replace cells that match none of their 8 neighbours with the most common neighbour."""
    cleaned = grid.copy()
    height, width = grid.shape
    for y in range(height):
        for x in range(width):
            patch = grid[max(0, y - 1):y + 2, max(0, x - 1):x + 2]
            value = grid[y, x]
            if np.sum(patch == value) <= 1:
                values, counts = np.unique(patch[patch != value], return_counts=True)
                cleaned[y, x] = values[np.argmax(counts)]
    return cleaned


def build_board(image: Image.Image, artwork_id: str, settings: BoardSettings = BoardSettings()) -> Dict[str, Any]:
    """Turn a reproduction into a color-by-number board (schema version 2)."""
    rgb = image.convert("RGB")
    width, height = grid_size(*rgb.size, settings)
    # Area averaging gives each cell the mean colour of its part of the painting.
    small = rgb.resize((width, height), Image.Resampling.BOX)
    lab = rgb_to_lab(np.asarray(small, dtype=np.float64)).reshape(-1, 3)

    distinct = len(np.unique(np.round(lab, 2), axis=0))
    clusters = max(1, min(settings.max_colors, distinct))
    kmeans = KMeans(n_clusters=clusters, random_state=settings.random_state, n_init=10).fit(lab)
    labels, centers = _merge_palette(kmeans.labels_.astype(np.int64), kmeans.cluster_centers_, settings)

    grid = _clean_isolated_cells(labels.reshape(height, width))
    # Cleaning can empty a colour; only colours that remain on the board are offered.
    used = np.unique(grid)
    centers = centers[used]
    grid = np.searchsorted(used, grid)

    order = np.argsort(centers[:, 0])  # dark to light, as in the first engine
    rank = np.empty_like(order)
    rank[order] = np.arange(len(order))
    colors_rgb = np.clip(np.round(lab_to_rgb(centers)), 0, 255).astype(int)

    palette: List[Dict[str, Any]] = []
    for position, index in enumerate(order, start=1):
        r, g, b = (int(value) for value in colors_rgb[index])
        palette.append({"id": position, "hex": rgb_to_hex(r, g, b), "name": get_polish_color_name(r, g, b)})

    result = {
        "schemaVersion": SCHEMA_VERSION,
        "id": artwork_id,
        "grid": {"width": width, "height": height, "data": (rank[grid] + 1).tolist()},
        "palette": palette,
    }

    result["palette"] = name_palette(result["palette"], result["grid"])
    return result


def render_preview(board: Dict[str, Any], cell: int = 8) -> Image.Image:
    """Finished board as an image, used on the wall when the reproduction is unavailable."""
    colors = {color["id"]: tuple(int(color["hex"][i:i + 2], 16) for i in (1, 3, 5)) for color in board["palette"]}
    data = np.array([[colors[value] for value in row] for row in board["grid"]["data"]], dtype=np.uint8)
    image = Image.fromarray(data, "RGB")
    return image.resize((image.width * cell, image.height * cell), Image.Resampling.NEAREST)
