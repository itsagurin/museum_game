"""
Processes downloaded Polish heritage artworks into pixel coloring books
using PixelColoringEngine for any grid dimension N x N, and generates
the consolidated artworks database for the mobile app feed.
"""

from pathlib import Path
import json
from typing import Optional

from src.core.pixel_engine import PixelColoringEngine, to_canonical_json
from src.core.visualizer import render_pixel_art, render_color_by_number
from src.data.download_heritage import POLISH_MASTERPIECES


def process_heritage_artworks(
    heritage_dir: str = "data/heritage",
    output_dir: str = "outputs/heritage",
    db_output_path: str = "src/data/artworks_db.json",
    n: int = 32,
    num_colors: int = 5,
):
    """
    Processes all Polish masterpieces with full cultural metadata
    and produces both individual JSON files and a consolidated database.
    """
    in_path = Path(heritage_dir)
    out_path = Path(output_dir)
    json_dir = out_path / "json"
    prev_dir = out_path / "previews"

    json_dir.mkdir(parents=True, exist_ok=True)
    prev_dir.mkdir(parents=True, exist_ok=True)
    Path(db_output_path).parent.mkdir(parents=True, exist_ok=True)

    engine = PixelColoringEngine(default_n=n, num_colors=num_colors)
    meta_lookup = {item["filename"]: item for item in POLISH_MASTERPIECES}

    print(f"Processing Polish masterpieces (grid {n}x{n}, {num_colors} colors)...")
    artworks_db = []

    for item in POLISH_MASTERPIECES:
        file_path = in_path / item["filename"]
        if not file_path.exists():
            print(f"  Warning: file not found {file_path}")
            continue

        print(f"  -> Converting {item['title']} ({item['artist']})...")
        result = engine.process_image(
            image_input=file_path,
            n=n,
            artwork_id=item["id"],
            title=item["title"],
            artist=item["artist"],
            year=item["year"],
            original_image_url=item["url"],
            trivia=item["trivia"],
            historical_context=item["historical_context"],
        )

        # 1. Save individual canonical JSON
        json_file = json_dir / f"{item['id']}_grid{n}.json"
        with open(json_file, "w", encoding="utf-8") as f:
            f.write(to_canonical_json(result))

        # 2. Render pixel art preview
        pixel_preview = render_pixel_art(result, scale=max(8, 512 // n))
        pixel_preview.save(prev_dir / f"{item['id']}_grid{n}_art.png")

        # 3. Render color-by-number diagram
        number_preview = render_color_by_number(result, cell_size=max(16, 640 // n))
        number_preview.save(prev_dir / f"{item['id']}_grid{n}_numbered.png")

        artworks_db.append(result)

    # Save consolidated feed database
    with open(db_output_path, "w", encoding="utf-8") as f:
        json.dump(artworks_db, f, ensure_ascii=False, indent=2)

    print(f"\nDone! Processed {len(artworks_db)} masterpieces.")
    print(f"Consolidated database saved to: {db_output_path}")
    print(f"Previews saved to: {prev_dir}")
    return artworks_db


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Process heritage artworks into pixel coloring books.")
    parser.add_argument("-n", "--grid_size", type=int, default=32, help="Grid size N (for N x N)")
    parser.add_argument("--heritage_dir", default="data/heritage", help="Heritage images directory")
    parser.add_argument("--output_dir", default="outputs/heritage", help="Output directory")
    args = parser.parse_args()

    process_heritage_artworks(
        heritage_dir=args.heritage_dir,
        output_dir=args.output_dir,
        n=args.grid_size,
    )
