"""
Batch processor: converts images from a directory into N x N pixel coloring books
and outputs canonical JSON and visual preview images.
"""

import argparse
from pathlib import Path
import json

from src.core.pixel_engine import PixelColoringEngine, to_canonical_json
from src.core.visualizer import render_pixel_art, render_color_by_number


def process_directory(
    input_dir: str,
    output_dir: str = "outputs",
    n: int = 32,
    num_colors: int = 5,
):
    """Processes all images in input_dir and writes JSON and preview images."""
    in_path = Path(input_dir)
    out_path = Path(output_dir)
    json_dir = out_path / "json"
    prev_dir = out_path / "previews"

    json_dir.mkdir(parents=True, exist_ok=True)
    prev_dir.mkdir(parents=True, exist_ok=True)

    engine = PixelColoringEngine(default_n=n, num_colors=num_colors)

    image_extensions = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
    image_files = [f for f in in_path.iterdir() if f.suffix.lower() in image_extensions]

    if not image_files:
        print(f"No images found in {input_dir}")
        return []

    print(f"Processing {len(image_files)} images with grid size {n}x{n} and {num_colors} colors...")

    results = []
    for img_file in sorted(image_files):
        print(f"  -> Converting: {img_file.name}...")
        result = engine.process_image(
            image_input=img_file,
            n=n,
            title=img_file.stem.replace("-", " ").replace("_", " ").title(),
        )

        # 1. Save canonical JSON
        json_file = json_dir / f"{img_file.stem}_grid{n}.json"
        with open(json_file, "w", encoding="utf-8") as f:
            f.write(to_canonical_json(result))

        # 2. Render pixel art preview
        pixel_preview = render_pixel_art(result, scale=max(8, 512 // n))
        pixel_preview.save(prev_dir / f"{img_file.stem}_grid{n}_art.png")

        # 3. Render color-by-number diagram
        number_preview = render_color_by_number(result, cell_size=max(16, 640 // n))
        number_preview.save(prev_dir / f"{img_file.stem}_grid{n}_numbered.png")

        results.append(result)
        print(f"     Saved JSON: {json_file.name}")

    print(f"Done! Processed {len(results)} images. Output written to {output_dir}")
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process images into N x N pixel coloring books.")
    parser.add_argument("--input_dir", "-i", default="assets", help="Input directory containing images")
    parser.add_argument("--output_dir", "-o", default="outputs", help="Output directory for results")
    parser.add_argument("-n", "--grid_size", type=int, default=32, help="Grid dimension N (for N x N grid)")
    parser.add_argument("--colors", "-c", type=int, default=5, help="Number of palette colors (default: 5)")

    args = parser.parse_args()
    process_directory(
        input_dir=args.input_dir,
        output_dir=args.output_dir,
        n=args.grid_size,
        num_colors=args.colors,
    )
