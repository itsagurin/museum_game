"""
Generate the game's boards from its content manifest.

    cd tools/pixel-engine
    .venv/bin/python -m src.build_puzzles --root ../.. [--only ID ...] [--report outputs/puzzle-report.html]

Reads <root>/content/artworks.json, the reproductions in <root>/img and writes
each entry's `puzzle` (JSON) and `preview` (PNG) paths under <root>/img.
"""

import argparse
import html
import json
import os
from pathlib import Path

from PIL import Image

from src.core.puzzle_builder import build_board, render_preview


def to_json(board: dict) -> str:
    """Readable JSON with one grid row per line."""
    rows = ",\n      ".join(json.dumps(row) for row in board["grid"]["data"])
    header = {key: value for key, value in board.items() if key != "grid"}
    grid = f'{{\n    "width": {board["grid"]["width"]},\n    "height": {board["grid"]["height"]},\n    "data": [\n      {rows}\n    ]\n  }}'
    body = json.dumps(header, ensure_ascii=False, indent=2)[:-2]
    return f'{body},\n  "grid": {grid}\n}}\n'


def write_report(path: Path, root: Path, results: list) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    cards = []
    for entry, board in results:
        rel = lambda target: html.escape(os.path.relpath(root / "img" / target, path.parent))
        swatches = "".join(f'<i style="background:{c["hex"]}" title="{c["id"]} · {html.escape(c["name"])}"></i>' for c in board["palette"])
        cards.append(
            f'<figure><div><img src="{rel(entry["image"])}" alt=""><img class="px" src="{rel(entry["preview"])}" alt=""></div>'
            f'<figcaption><b>{html.escape(entry["title"]["pl"])}</b> · {html.escape(entry["artist"])}<br>'
            f'{board["grid"]["width"]}×{board["grid"]["height"]} · {len(board["palette"])} kolorów <span>{swatches}</span></figcaption></figure>'
        )
    path.write_text(
        '<!doctype html><meta charset="utf-8"><title>Plansze v2</title><style>'
        "body{font:14px system-ui;margin:24px;background:#f4f1e8;color:#2d2a22}"
        "main{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:18px}"
        "figure{margin:0;background:#fff;border-radius:12px;padding:12px}figure div{display:grid;grid-template-columns:1fr 1fr;gap:8px}"
        "img{width:100%;height:220px;object-fit:contain;background:#eee}.px{image-rendering:pixelated}"
        "span i{display:inline-block;width:14px;height:14px;margin-left:3px;border-radius:3px;vertical-align:middle}"
        f"</style><h1>Plansze v2 · {len(results)} obrazów</h1><main>{''.join(cards)}</main>",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--root", default="../..", help="Game repository root")
    parser.add_argument("--only", nargs="*", help="Artwork IDs to rebuild")
    parser.add_argument("--report", help="Optional HTML comparison report")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    manifest = json.loads((root / "content" / "artworks.json").read_text(encoding="utf-8"))
    selected = [entry for entry in manifest if not args.only or entry["id"] in args.only]
    results = []
    for entry in selected:
        with Image.open(root / "img" / entry["image"]) as image:
            board = build_board(image, entry["id"])
        puzzle = root / "img" / entry["puzzle"]
        puzzle.parent.mkdir(parents=True, exist_ok=True)
        puzzle.write_text(to_json(board), encoding="utf-8")
        render_preview(board).save(root / "img" / entry["preview"], optimize=True)
        results.append((entry, board))
        print(f'{entry["id"]}: {board["grid"]["width"]}x{board["grid"]["height"]}, {len(board["palette"])} colors')
    if args.report:
        write_report(Path(args.report).resolve(), root, results)
        print(f"Report: {Path(args.report).resolve()}")


if __name__ == "__main__":
    main()
