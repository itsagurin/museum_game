"""
Generates a complete Before / After comparison catalog:
- Individual comparison directories for each image (before.jpg, after_pixel_art.png, after_numbered.png, comparison.png, data.json)
- Side-by-side composite comparison images
- Interactive standalone HTML web gallery (outputs/before_after/index.html)
"""

import json
from pathlib import Path
from typing import List, Dict, Any
from PIL import Image, ImageDraw, ImageFont

from src.core.pixel_engine import PixelColoringEngine, to_canonical_json
from src.core.visualizer import render_pixel_art, render_color_by_number
from src.data.download_heritage import POLISH_MASTERPIECES


def create_composite_image(
    original_img: Image.Image,
    pixel_art_img: Image.Image,
    numbered_img: Image.Image,
    title: str,
    artist: str,
    palette: List[Dict[str, Any]],
    target_dim: int = 512,
) -> Image.Image:
    """
    Creates a high-quality 3-panel composite image:
    [ Panel 1: Original HD ] | [ Panel 2: Pixel Art 5-Colors ] | [ Panel 3: Color-by-Number ]
    with headers, badges, and metadata banner.
    """
    # 1. Square crop original to match pixel art perspective
    w, h = original_img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    orig_square = original_img.crop((left, top, left + min_dim, top + min_dim))
    orig_panel = orig_square.resize((target_dim, target_dim), Image.Resampling.LANCZOS)

    # 2. Resize pixel art
    art_panel = pixel_art_img.resize((target_dim, target_dim), Image.Resampling.NEAREST)

    # 3. Fit numbered diagram
    num_w, num_h = numbered_img.size
    scale_factor = target_dim / max(num_w, num_h)
    new_nw = int(num_w * scale_factor)
    new_nh = int(num_h * scale_factor)
    num_resized = numbered_img.resize((new_nw, new_nh), Image.Resampling.LANCZOS)
    num_panel = Image.new("RGB", (target_dim, target_dim), (255, 255, 255))
    num_panel.paste(num_resized, ((target_dim - new_nw) // 2, (target_dim - new_nh) // 2))

    # Canvas dimensions
    padding = 24
    header_height = 80
    panel_width = target_dim
    total_width = 3 * panel_width + 4 * padding
    total_height = header_height + target_dim + padding + 60

    canvas = Image.new("RGB", (total_width, total_height), (24, 24, 27))
    draw = ImageDraw.Draw(canvas)
    
    font_bold_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    font_reg_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    try:
        font_title = ImageFont.truetype(font_bold_path, size=20)
        font_sub = ImageFont.truetype(font_reg_path, size=13)
        font_badge = ImageFont.truetype(font_bold_path, size=14)
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = font_title
        font_badge = font_title

    # Header title
    header_text = f"{title}  —  {artist}"
    draw.text((padding, 18), header_text, fill=(255, 255, 255), font=font_title)
    sub_text = "Code for Culture  |  Transformacja: Oryginał HD -> 5-Kolorowa Kolorowanka Pikselowa"
    draw.text((padding, 46), sub_text, fill=(160, 160, 160), font=font_sub)

    # Paste panels
    x_offset = padding
    y_offset = header_height

    panels_info = [
        (orig_panel, "1. PRZED: Oryginał HD", (59, 130, 246)),
        (art_panel, "2. PO: Pixel Art (5 barw)", (16, 185, 129)),
        (num_panel, "3. PO: Kolorowanka z numerkami", (245, 158, 11)),
    ]

    for panel, label, badge_color in panels_info:
        # Border
        draw.rectangle(
            [x_offset - 2, y_offset - 2, x_offset + panel_width + 1, y_offset + target_dim + 1],
            outline=(60, 60, 65),
            width=2,
        )
        canvas.paste(panel, (x_offset, y_offset))

        # Badge banner below
        draw.rectangle(
            [x_offset, y_offset + target_dim + 8, x_offset + panel_width, y_offset + target_dim + 36],
            fill=(39, 39, 42),
            outline=badge_color,
            width=1,
        )
        bbox = draw.textbbox((0, 0), label, font=font_badge)
        lw = bbox[2] - bbox[0]
        draw.text((x_offset + (panel_width - lw) // 2, y_offset + target_dim + 14), label, fill=badge_color, font=font_badge)

        x_offset += panel_width + padding

    return canvas


def build_html_gallery(items: List[Dict[str, Any]], output_file: Path):
    """Generates an interactive responsive HTML gallery comparing before and after."""
    html_content = """<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code for Culture — Katalog Przed / Po (Pixel Art Coloring)</title>
  <style>
    :root {
      --bg: #09090b;
      --card-bg: #18181b;
      --card-border: #27272a;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
      --accent: #e11d48;
      --blue: #3b82f6;
      --green: #10b981;
      --amber: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 32px 16px 80px;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    header { text-align: center; margin-bottom: 40px; }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: 9999px;
      background: rgba(225, 29, 72, 0.15);
      color: var(--accent);
      border: 1px solid rgba(225, 29, 72, 0.3);
      margin-bottom: 12px;
    }
    h1 { font-size: 2.4rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; }
    p.lead { color: var(--text-muted); font-size: 1.1rem; max-width: 700px; margin: 0 auto; }
    
    .filter-tabs {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin: 32px 0 40px;
      flex-wrap: wrap;
    }
    .tab-btn {
      background: #27272a;
      border: 1px solid #3f3f46;
      color: #d4d4d8;
      padding: 8px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn.active, .tab-btn:hover {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }

    .gallery-grid {
      display: flex;
      flex-direction: column;
      gap: 48px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 24px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .card-title h2 { font-size: 1.6rem; font-weight: 700; color: #fff; }
    .card-title span.artist { color: var(--text-muted); font-size: 1rem; }
    .meta-pills { display: flex; gap: 8px; flex-wrap: wrap; }
    .pill {
      background: #27272a;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #d4d4d8;
    }

    .visual-comparison {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .panel-box {
      background: #111113;
      border: 1px solid #27272a;
      border-radius: 12px;
      padding: 12px;
      display: flex;
      flex-direction: column;
    }
    .panel-title {
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .panel-title.before { color: var(--blue); }
    .panel-title.pixel { color: var(--green); }
    .panel-title.numbered { color: var(--amber); }

    .img-wrap {
      width: 100%;
      aspect-ratio: 1 / 1;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      image-rendering: auto;
    }
    .img-wrap.pixel-art img {
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
    }

    /* Palette bar */
    .palette-section {
      background: #111113;
      border: 1px solid #27272a;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 20px;
    }
    .palette-title { font-size: 0.85rem; font-weight: 700; color: #a1a1aa; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
    .palette-chips {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .chip {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #18181b;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid #27272a;
    }
    .chip-swatch {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid rgba(255,255,255,0.2);
      font-weight: 800;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .chip-info { display: flex; flex-direction: column; }
    .chip-name { font-size: 0.8rem; font-weight: 600; color: #fff; }
    .chip-hex { font-size: 0.7rem; font-family: monospace; color: #71717a; }

    /* Cultural Context Banner */
    .cultural-box {
      background: rgba(225, 29, 72, 0.08);
      border-left: 4px solid var(--accent);
      padding: 14px 18px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 16px;
    }
    .cultural-trivia { font-size: 0.95rem; font-weight: 500; color: #f43f5e; margin-bottom: 6px; }
    .cultural-context { font-size: 0.9rem; color: #d4d4d8; }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #27272a;
      padding-top: 16px;
      font-size: 0.85rem;
      color: var(--text-muted);
      flex-wrap: wrap;
      gap: 10px;
    }
    .card-footer a {
      color: var(--blue);
      text-decoration: none;
      font-weight: 600;
    }
    .card-footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="badge">Code for Culture — Hackathon 2026</div>
      <h1>Katalog Wizualny: Przed i Po</h1>
      <p class="lead">
        Zestawienie oryginalnych dzieł HD z interaktywnymi kolorowankami pikselowymi (5 kolorów)
        dla aplikacji mobilnej TikTok-style.
      </p>
      
      <div class="filter-tabs">
        <button class="tab-btn active" onclick="filterCategory('all')">Wszystkie (10)</button>
        <button class="tab-btn" onclick="filterCategory('heritage')">Arcydzieła Kultury Polskiej (5)</button>
        <button class="tab-btn" onclick="filterCategory('assets')">Zdjęcia i Krajobrazy (5)</button>
      </div>
    </header>

    <div class="gallery-grid">
"""

    for item in items:
        cat = item["category"]
        title = item["title"]
        artist = item["artist"]
        year = item.get("year", "")
        slug = item["slug"]
        grid_dim = item["grid"]["width"]
        palette = item["palette"]
        cultural = item.get("cultural_data", {})
        rel_dir = item["relative_dir"]

        html_content += f"""
      <div class="card" data-category="{cat}">
        <div class="card-header">
          <div class="card-title">
            <h2>{title}</h2>
            <span class="artist">{artist} &bull; {year}</span>
          </div>
          <div class="meta-pills">
            <span class="pill">Siatka {grid_dim}x{grid_dim}</span>
            <span class="pill">5 Kolorów</span>
            <span class="pill">{cat.upper()}</span>
          </div>
        </div>

        <div class="visual-comparison">
          <!-- PANEL 1: BEFORE -->
          <div class="panel-box">
            <div class="panel-title before">
              <span>●</span> 1. PRZED: Oryginał HD
            </div>
            <div class="img-wrap">
              <img src="{rel_dir}/before.jpg" alt="{title} - oryginał" loading="lazy">
            </div>
          </div>

          <!-- PANEL 2: PIXEL ART -->
          <div class="panel-box">
            <div class="panel-title pixel">
              <span>●</span> 2. PO: Pixel Art (5 barw)
            </div>
            <div class="img-wrap pixel-art">
              <img src="{rel_dir}/after_pixel_art.png" alt="{title} - pixel art" loading="lazy">
            </div>
          </div>

          <!-- PANEL 3: NUMBERED -->
          <div class="panel-box">
            <div class="panel-title numbered">
              <span>●</span> 3. PO: Kolorowanka z numerkami
            </div>
            <div class="img-wrap">
              <img src="{rel_dir}/after_numbered.png" alt="{title} - kolorowanka numeryczna" loading="lazy">
            </div>
          </div>
        </div>

        <!-- PALETTE BAR -->
        <div class="palette-section">
          <div class="palette-title">Wyekstrahowana Paleta 5 Barw (K-Means CIELAB)</div>
          <div class="palette-chips">
"""
        for p in palette:
            hex_code = p["hex"]
            p_id = p["id"]
            p_name = p.get("name", hex_code)
            # Contrast color for number in chip swatch
            r, g, b = int(hex_code[1:3], 16), int(hex_code[3:5], 16), int(hex_code[5:7], 16)
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            text_col = "#ffffff" if lum < 130 else "#000000"

            html_content += f"""
            <div class="chip">
              <div class="chip-swatch" style="background-color: {hex_code}; color: {text_col};">#{p_id}</div>
              <div class="chip-info">
                <span class="chip-name">{p_name}</span>
                <span class="chip-hex">{hex_code}</span>
              </div>
            </div>
"""

        html_content += """
          </div>
        </div>
"""

        if cultural.get("trivia") or cultural.get("historical_context"):
            html_content += f"""
        <!-- CULTURAL DATA -->
        <div class="cultural-box">
          <div class="cultural-trivia">💡 Ciekawostka: {cultural.get('trivia', '')}</div>
          <div class="cultural-context">📜 Kontekst: {cultural.get('historical_context', '')}</div>
        </div>
"""

        html_content += f"""
        <div class="card-footer">
          <span>Katalog lokalny: <code>outputs/before_after/{slug}/</code></span>
          <div>
            <a href="{rel_dir}/comparison.png" target="_blank">Otwórz pełny plakat Before/After &rarr;</a> &bull;
            <a href="{rel_dir}/data.json" target="_blank">Pobierz JSON &rarr;</a>
          </div>
        </div>
      </div>
"""

    html_content += """
    </div>
  </div>

  <script>
    function filterCategory(cat) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');

      document.querySelectorAll('.card').forEach(card => {
        if (cat === 'all' || card.dataset.category === cat) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>
"""

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(html_content)


def generate_full_catalog(
    grid_size: int = 32,
    base_output_dir: str = "outputs/before_after",
):
    """
    Processes all 10 images (5 Polish masterpieces + 5 user assets),
    creates clean subdirectories, composite images, and the HTML catalog.
    """
    out_dir = Path(base_output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    engine = PixelColoringEngine(default_n=grid_size, num_colors=5)
    catalog_items = []

    # 1. Process Heritage Artworks
    heritage_dir = Path("data/heritage")
    print(f"Generating Before/After catalog for Polish Masterpieces (N={grid_size})...")

    for art in POLISH_MASTERPIECES:
        src_path = heritage_dir / art["filename"]
        if not src_path.exists():
            continue

        slug = f"01_heritage_{art['id']}"
        item_dir = out_dir / slug
        item_dir.mkdir(parents=True, exist_ok=True)

        print(f"  -> {art['title']}...")
        result = engine.process_image(
            image_input=src_path,
            n=grid_size,
            artwork_id=art["id"],
            title=art["title"],
            artist=art["artist"],
            year=art["year"],
            original_image_url=art["url"],
            trivia=art["trivia"],
            historical_context=art["historical_context"],
        )

        # Load original image
        orig_img = Image.open(src_path).convert("RGB")
        # Save before.jpg (compressed HD preview for fast web loading)
        orig_img.save(item_dir / "before.jpg", quality=88)

        # Generate Pixel Art and Numbered diagrams
        pixel_art_img = render_pixel_art(result, scale=max(8, 512 // grid_size))
        pixel_art_img.save(item_dir / "after_pixel_art.png")

        numbered_img = render_color_by_number(result, cell_size=max(16, 640 // grid_size))
        numbered_img.save(item_dir / "after_numbered.png")

        # Composite comparison image
        comp_img = create_composite_image(
            original_img=orig_img,
            pixel_art_img=pixel_art_img,
            numbered_img=numbered_img,
            title=art["title"],
            artist=art["artist"],
            palette=result["palette"],
        )
        comp_img.save(item_dir / "comparison.png")

        # Save JSON
        with open(item_dir / "data.json", "w", encoding="utf-8") as f:
            f.write(to_canonical_json(result))

        catalog_entry = dict(result)
        catalog_entry["category"] = "heritage"
        catalog_entry["slug"] = slug
        catalog_entry["relative_dir"] = slug
        catalog_items.append(catalog_entry)

    # 2. Process User Assets Images
    assets_dir = Path("assets")
    print(f"\nGenerating Before/After catalog for User Assets (N={grid_size})...")

    if assets_dir.exists():
        for asset_file in sorted(assets_dir.glob("*.jpg")):
            slug = f"02_asset_{asset_file.stem}"
            item_dir = out_dir / slug
            item_dir.mkdir(parents=True, exist_ok=True)

            title = asset_file.stem.replace("-", " ").replace("_", " ").title()
            print(f"  -> {title}...")

            result = engine.process_image(
                image_input=asset_file,
                n=grid_size,
                title=title,
                artist="Fotografia / Krajobraz",
                year="Współczesne",
                trivia="Fotografia z kolekcji użytkownika w katalogu assets.",
                historical_context="Przykładowe zdjęcie testowe poddane kwantyzacji do 5 barw.",
            )

            orig_img = Image.open(asset_file).convert("RGB")
            orig_img.save(item_dir / "before.jpg", quality=88)

            pixel_art_img = render_pixel_art(result, scale=max(8, 512 // grid_size))
            pixel_art_img.save(item_dir / "after_pixel_art.png")

            numbered_img = render_color_by_number(result, cell_size=max(16, 640 // grid_size))
            numbered_img.save(item_dir / "after_numbered.png")

            comp_img = create_composite_image(
                original_img=orig_img,
                pixel_art_img=pixel_art_img,
                numbered_img=numbered_img,
                title=title,
                artist="Fotografia użytkownika",
                palette=result["palette"],
            )
            comp_img.save(item_dir / "comparison.png")

            with open(item_dir / "data.json", "w", encoding="utf-8") as f:
                f.write(to_canonical_json(result))

            catalog_entry = dict(result)
            catalog_entry["category"] = "assets"
            catalog_entry["slug"] = slug
            catalog_entry["relative_dir"] = slug
            catalog_items.append(catalog_entry)

    # 3. Build HTML Gallery
    html_file = out_dir / "index.html"
    build_html_gallery(catalog_items, html_file)
    print(f"\nCompleted! Generated Before/After catalog with {len(catalog_items)} items.")
    print(f"HTML Gallery created at: {html_file}")
    return catalog_items


if __name__ == "__main__":
    generate_full_catalog(grid_size=32)
