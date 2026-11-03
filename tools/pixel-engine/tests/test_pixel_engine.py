"""
Test suite for PixelColoringEngine and color utilities.
Verifies dynamic N x N grid sizing, ADR-003 schema compliance,
palette quantization, and image processing edge cases.
"""

import pytest
import numpy as np
from PIL import Image
from pathlib import Path

from src.core.color_utils import rgb_to_hex, hex_to_rgb, rgb_to_lab, lab_to_rgb, get_polish_color_name
from src.core.pixel_engine import PixelColoringEngine, to_canonical_json


def test_color_utils_hex_roundtrip():
    hex_str = "#7A141A"
    rgb = hex_to_rgb(hex_str)
    assert rgb == (122, 20, 26)
    assert rgb_to_hex(*rgb) == hex_str


def test_color_utils_lab_roundtrip():
    # Test RGB -> LAB -> RGB consistency
    orig_rgb = np.array([[[120, 30, 40], [255, 255, 255], [0, 0, 0]]], dtype=np.uint8)
    lab = rgb_to_lab(orig_rgb)
    reconstructed = lab_to_rgb(lab)
    # Differences should be minimal (< 2 in uint8 due to rounding)
    diff = np.abs(orig_rgb.astype(int) - reconstructed.astype(int))
    assert np.max(diff) <= 2


def test_polish_color_naming():
    # Crimson red should match a red tone name
    name_red = get_polish_color_name(122, 20, 26)
    assert any(w in name_red.lower() for w in ["czerwień", "karmin", "szkarłat", "rdzawy"])

    # Deep black should match black/charcoal
    name_black = get_polish_color_name(10, 10, 10)
    assert any(w in name_black.lower() for w in ["czerń", "antracyt", "grafit"])


@pytest.mark.parametrize("n", [8, 16, 24, 32, 48, 64])
def test_dynamic_grid_size(n):
    # Create synthetic test image
    img = Image.new("RGB", (200, 300), color=(100, 150, 200))
    # Draw some stripes
    for x in range(50, 150):
        for y in range(50, 150):
            img.putpixel((x, y), (220, 50, 50))

    engine = PixelColoringEngine(default_n=n, num_colors=5)
    result = engine.process_image(img, n=n)

    # 1. Grid width & height
    assert result["grid"]["width"] == n
    assert result["grid"]["height"] == n

    # 2. Matrix dimensions
    data = result["grid"]["data"]
    assert len(data) == n
    for row in data:
        assert len(row) == n
        # Every pixel must be in {1, 2, 3, 4, 5}
        for val in row:
            assert val in {1, 2, 3, 4, 5}

    # 3. Palette must have exactly 5 elements
    palette = result["palette"]
    assert len(palette) == 5
    ids = [p["id"] for p in palette]
    assert ids == [1, 2, 3, 4, 5]
    for p in palette:
        assert p["hex"].startswith("#") and len(p["hex"]) == 7
        assert isinstance(p["name"], str) and len(p["name"]) > 0

    # 4. Canonical schema fields
    for required_field in ["id", "title", "artist", "year", "original_image_url", "grid", "palette", "cultural_data"]:
        assert required_field in result

    assert "trivia" in result["cultural_data"]
    assert "historical_context" in result["cultural_data"]


def test_process_assets_images():
    """Verify processing on real user images in assets directory."""
    assets_dir = Path("assets")
    if not assets_dir.exists():
        pytest.skip("assets directory not found")

    image_files = list(assets_dir.glob("*.jpg"))
    if not image_files:
        pytest.skip("No jpg files in assets")

    engine = PixelColoringEngine()
    for img_path in image_files:
        for test_n in [16, 32]:
            result = engine.process_image(img_path, n=test_n)
            assert result["grid"]["width"] == test_n
            assert result["grid"]["height"] == test_n
            assert len(result["grid"]["data"]) == test_n
            assert len(result["palette"]) == 5


def test_canonical_json_serializer():
    data = {
        "id": "test",
        "title": "Test Title",
        "artist": "Test Artist",
        "year": "2026",
        "original_image_url": "https://example.com/test.jpg",
        "grid": {
            "width": 4,
            "height": 4,
            "data": [[1, 2, 3, 4], [5, 1, 2, 3], [4, 5, 1, 2], [3, 4, 5, 1]],
        },
        "palette": [
            {"id": 1, "hex": "#111111", "name": "Czerń"},
            {"id": 2, "hex": "#222222", "name": "Szary"},
            {"id": 3, "hex": "#333333", "name": "Biel"},
            {"id": 4, "hex": "#444444", "name": "Czerwień"},
            {"id": 5, "hex": "#555555", "name": "Złoto"},
        ],
        "cultural_data": {
            "trivia": "Ciekawostka",
            "historical_context": "Kontekst",
        },
    }
    json_str = to_canonical_json(data)
    import json
    parsed = json.loads(json_str)
    assert parsed["grid"]["width"] == 4
    assert parsed["grid"]["data"] == data["grid"]["data"]
    assert parsed["palette"] == data["palette"]


def test_monochrome_and_low_color_image():
    """Verify that images with < 5 unique colors still yield exactly 5 palette items."""
    solid_img = Image.new("RGB", (32, 32), color=(255, 0, 0))
    engine = PixelColoringEngine(default_n=16)
    result = engine.process_image(solid_img, n=16)

    assert result["grid"]["width"] == 16
    assert result["grid"]["height"] == 16
    assert len(result["palette"]) == 5
    ids = [p["id"] for p in result["palette"]]
    assert ids == [1, 2, 3, 4, 5]

