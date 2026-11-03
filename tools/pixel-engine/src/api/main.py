"""
FastAPI application for the Pixel Coloring Engine.
Provides REST endpoints for the TikTok-style Code for Culture mobile application:
- GET /api/artworks (list of heritage coloring books)
- GET /api/artworks/{id} (single artwork coloring book)
- POST /api/convert (convert uploaded image dynamically to N x N coloring book)
- GET /health (health check)
"""

from pathlib import Path
import json
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.api.schemas import ArtworkResponse, ConvertRequest
from src.core.pixel_engine import PixelColoringEngine

app = FastAPI(
    title="Pixel Coloring Engine — Code for Culture",
    description="REST API delivering interactive 5-color pixel coloring books from Polish cultural heritage artworks.",
    version="1.0.0",
)

# Enable CORS for mobile development (Expo, React Native, Web)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount outputs/heritage/previews and assets as static files if directories exist
previews_dir = Path("outputs/heritage/previews")
if previews_dir.exists():
    app.mount("/static/previews", StaticFiles(directory=str(previews_dir)), name="previews")

assets_dir = Path("assets")
if assets_dir.exists():
    app.mount("/static/assets", StaticFiles(directory=str(assets_dir)), name="assets")

gallery_dir = Path("outputs/before_after")
if gallery_dir.exists():
    app.mount("/static/gallery", StaticFiles(directory=str(gallery_dir)), name="gallery")

DB_PATH = Path("src/data/artworks_db.json")


@app.get("/gallery", response_class=None, tags=["Gallery"], include_in_schema=True)
def get_gallery_html():
    """Serves the interactive Before/After comparison HTML catalog."""
    from fastapi.responses import HTMLResponse
    index_path = Path("outputs/before_after/index.html")
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="Gallery not generated. Run python -m src.core.generate_gallery")
    with open(index_path, "r", encoding="utf-8") as f:
        # Rewrite relative image links to /static/gallery/... when served via API
        html = f.read()
    return HTMLResponse(content=html)


def load_artworks_db() -> List[dict]:
    """Loads consolidated artworks from JSON db, or empty list if not yet generated."""
    if not DB_PATH.exists():
        return []
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "pixel-coloring-engine",
        "artworks_count": len(load_artworks_db()),
    }


@app.get("/api/artworks", response_model=List[ArtworkResponse], tags=["Artworks"])
def get_artworks(
    n: Optional[int] = Query(None, ge=4, le=128, description="Override grid dimension N (N x N)"),
):
    """
    Returns list of curated Polish masterpieces in canonical coloring book format.
    If 'n' is provided, the engine recalculates the grid on-the-fly for the requested dimension!
    """
    artworks = load_artworks_db()
    if not artworks:
        raise HTTPException(
            status_code=503,
            detail="Artworks database is empty. Please run 'python -m src.data.process_artworks' first.",
        )

    # If user specifies a different N than precomputed, recalculate dynamically
    if n is not None:
        from src.data.download_heritage import POLISH_MASTERPIECES
        engine = PixelColoringEngine(default_n=n, num_colors=5)
        recalculated = []
        for item in POLISH_MASTERPIECES:
            local_path = Path("data/heritage") / item["filename"]
            if local_path.exists():
                res = engine.process_image(
                    image_input=local_path,
                    n=n,
                    artwork_id=item["id"],
                    title=item["title"],
                    artist=item["artist"],
                    year=item["year"],
                    original_image_url=item["url"],
                    trivia=item["trivia"],
                    historical_context=item["historical_context"],
                )
                recalculated.append(res)
        return recalculated

    return artworks


@app.get("/api/artworks/{artwork_id}", response_model=ArtworkResponse, tags=["Artworks"])
def get_artwork_by_id(
    artwork_id: str,
    n: Optional[int] = Query(None, ge=4, le=128, description="Override grid dimension N (N x N)"),
):
    """Returns single artwork coloring book by its slug ID."""
    artworks = load_artworks_db()
    matching = [a for a in artworks if a["id"] == artwork_id]
    if not matching:
        raise HTTPException(status_code=404, detail=f"Artwork with id '{artwork_id}' not found.")

    art = matching[0]
    if n is not None and art["grid"]["width"] != n:
        from src.data.download_heritage import POLISH_MASTERPIECES
        meta = next((m for m in POLISH_MASTERPIECES if m["id"] == artwork_id), None)
        if meta:
            local_path = Path("data/heritage") / meta["filename"]
            if local_path.exists():
                engine = PixelColoringEngine(default_n=n, num_colors=5)
                return engine.process_image(
                    image_input=local_path,
                    n=n,
                    artwork_id=meta["id"],
                    title=meta["title"],
                    artist=meta["artist"],
                    year=meta["year"],
                    original_image_url=meta["url"],
                    trivia=meta["trivia"],
                    historical_context=meta["historical_context"],
                )

    return art


@app.post("/api/convert", response_model=ArtworkResponse, tags=["Conversion"])
def convert_image(request: ConvertRequest):
    """
    Dynamically converts any base64 image into an N x N pixel coloring book
    conforming strictly to ADR-003.
    """
    engine = PixelColoringEngine(default_n=request.n, num_colors=5)
    try:
        result = engine.process_image(
            image_input=request.image_base64,
            n=request.n,
            title=request.title,
            artist=request.artist,
            year=request.year,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image conversion error: {str(e)}")


@app.post("/api/convert/upload", response_model=ArtworkResponse, tags=["Conversion"])
async def convert_uploaded_file(
    file: UploadFile = File(...),
    n: int = Query(32, ge=4, le=128, description="Grid dimension N x N"),
    title: Optional[str] = Query(None, description="Title"),
):
    """Upload an image file directly (multipart/form-data) to get an N x N pixel coloring book."""
    content = await file.read()
    engine = PixelColoringEngine(default_n=n, num_colors=5)
    try:
        result = engine.process_image(
            image_input=content,
            n=n,
            title=title or Path(file.filename or "upload").stem.replace("-", " ").title(),
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process image: {str(e)}")
