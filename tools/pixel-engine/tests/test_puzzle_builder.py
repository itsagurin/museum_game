"""Board builder v2: proportions, distinct palette, complete coverage and the dark-colour fix."""

import numpy as np
import pytest
from PIL import Image

from src.core.color_utils import rgb_to_lab
from src.core.puzzle_builder import BoardSettings, build_board, grid_size, render_preview


def striped(width: int, height: int, colors) -> Image.Image:
    data = np.zeros((height, width, 3), dtype=np.uint8)
    band = max(1, width // len(colors))
    for index, color in enumerate(colors):
        data[:, index * band:(index + 1) * band] = color
    data[:, len(colors) * band:] = colors[-1]
    return Image.fromarray(data, "RGB")


PAINTERLY = [(20, 18, 16), (120, 40, 30), (200, 160, 60), (40, 90, 140), (220, 220, 210), (60, 120, 50),
             (150, 100, 160), (240, 120, 40), (90, 60, 40), (180, 200, 230), (30, 50, 30), (250, 240, 120)]


@pytest.mark.parametrize("size, expected", [((1280, 843), (32, 21)), ((843, 1280), (21, 32)), ((1000, 1000), (32, 32)), ((3000, 400), (32, 12))])
def test_grid_follows_the_artwork_proportions(size, expected):
    assert grid_size(*size) == expected


def test_board_keeps_proportions_and_uses_every_palette_colour():
    board = build_board(striped(1200, 800, PAINTERLY), "wide")
    grid = np.array(board["grid"]["data"])
    assert board["schemaVersion"] == 2 and board["id"] == "wide"
    assert (board["grid"]["width"], board["grid"]["height"]) == (32, 21)
    assert grid.shape == (21, 32)
    ids = [color["id"] for color in board["palette"]]
    assert ids == list(range(1, len(ids) + 1))
    assert set(np.unique(grid)) == set(ids)


def test_palette_has_six_to_ten_clearly_different_colours():
    settings = BoardSettings()
    board = build_board(striped(1600, 1600, PAINTERLY), "varied", settings)
    palette = board["palette"]
    assert settings.min_colors <= len(palette) <= settings.max_colors
    rgb = np.array([[int(c["hex"][i:i + 2], 16) for i in (1, 3, 5)] for c in palette], dtype=np.float64)
    lab = rgb_to_lab(rgb)
    distances = np.linalg.norm(lab[:, None] - lab[None, :], axis=2)
    np.fill_diagonal(distances, np.inf)
    if len(palette) > settings.min_colors:
        # Rounding to 8-bit hex moves centres slightly, hence the small tolerance.
        assert distances.min() >= settings.min_delta_e - 1.0


def test_near_identical_shades_are_merged():
    browns = [(100, 70, 40), (102, 71, 41), (104, 72, 42), (30, 30, 30), (230, 225, 210), (60, 110, 160), (180, 60, 50), (90, 140, 70)]
    board = build_board(striped(800, 800, browns), "browns")
    assert len(board["palette"]) <= 6


def test_board_is_deterministic():
    image = striped(900, 600, PAINTERLY)
    assert build_board(image, "same") == build_board(image, "same")


def test_very_dark_pixels_are_not_read_as_white():
    black = rgb_to_lab(np.array([[1.0, 1.0, 1.0]]))[0]
    assert black[0] < 1.0


def test_preview_matches_the_board():
    board = build_board(striped(640, 480, PAINTERLY), "preview")
    preview = render_preview(board, cell=4)
    assert preview.size == (board["grid"]["width"] * 4, board["grid"]["height"] * 4)
