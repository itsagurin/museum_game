"""
Test suite for FastAPI endpoints of Pixel Coloring Engine.
Verifies OpenAPI compliance, dynamic 'n' parameter, and ADR-003 schema validation.
"""

import io
import base64
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from src.api.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "artworks_count" in data


def test_get_artworks_default():
    response = client.get("/api/artworks")
    assert response.status_code == 200
    artworks = response.json()
    assert isinstance(artworks, list)
    assert len(artworks) >= 5

    # Check ADR-003 schema on first item
    first = artworks[0]
    assert first["id"] == "stanczyk-matejko"
    assert first["grid"]["width"] == first["grid"]["height"]
    assert first["grid"]["width"] >= 4
    assert len(first["grid"]["data"]) == first["grid"]["height"]
    assert len(first["palette"]) == 5
    assert "trivia" in first["cultural_data"]
    assert "historical_context" in first["cultural_data"]


def test_get_artworks_dynamic_n():
    """Verify that requesting ?n=16 dynamically recalculates grid to 16x16!"""
    response = client.get("/api/artworks?n=16")
    assert response.status_code == 200
    artworks = response.json()
    assert len(artworks) >= 1
    for art in artworks:
        assert art["grid"]["width"] == 16
        assert art["grid"]["height"] == 16
        assert len(art["grid"]["data"]) == 16
        assert len(art["grid"]["data"][0]) == 16
        assert len(art["palette"]) == 5


def test_get_artwork_by_id():
    response = client.get("/api/artworks/stanczyk-matejko")
    assert response.status_code == 200
    art = response.json()
    assert art["title"] == "Stańczyk"
    assert art["artist"] == "Jan Matejko"
    assert len(art["palette"]) == 5


def test_get_artwork_by_id_dynamic_n():
    response = client.get("/api/artworks/stanczyk-matejko?n=48")
    assert response.status_code == 200
    art = response.json()
    assert art["grid"]["width"] == 48
    assert art["grid"]["height"] == 48
    assert len(art["grid"]["data"]) == 48


def test_convert_endpoint_base64():
    # Create simple synthetic image and encode to base64
    img = Image.new("RGB", (64, 64), color=(200, 40, 40))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64_str = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

    payload = {
        "image_base64": b64_str,
        "n": 20,
        "title": "Czerwony Kwadrat",
    }
    response = client.post("/api/convert", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["grid"]["width"] == 20
    assert res["grid"]["height"] == 20
    assert len(res["grid"]["data"]) == 20
    assert len(res["palette"]) == 5
    assert res["title"] == "Czerwony Kwadrat"


def test_convert_upload_file():
    img = Image.new("RGB", (100, 100), color=(50, 120, 200))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    files = {"file": ("test_sky.jpg", buf, "image/jpeg")}
    response = client.post("/api/convert/upload?n=24&title=Błękitne+Niebo", files=files)
    assert response.status_code == 200
    res = response.json()
    assert res["grid"]["width"] == 24
    assert res["grid"]["height"] == 24
    assert len(res["palette"]) == 5


def test_gallery_endpoint():
    response = client.get("/gallery")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")
    assert "Code for Culture" in response.text

