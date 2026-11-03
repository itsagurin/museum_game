"""
Find each reproduction on Wikimedia Commons and record its page and licence.

    cd tools/pixel-engine
    .venv/bin/python -m src.content_sources --root ../.. --cache /tmp/commons-cache [--write]

A candidate counts only when its image matches ours (difference hash of a
small thumbnail); a matching title alone is not enough. Unmatched artworks are
listed for manual research. With --write the `source` of matched entries in
content/artworks.json is filled in; entries that already have a source are kept.
"""

import argparse
import datetime
import hashlib
import html
import io
import json
import re
import time
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np
import requests
from PIL import Image

API = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "DziedzictwoContent/0.2 (educational game; content tooling)"}
MAX_DISTANCE = 10  # of 64 bits; unrelated paintings land well above 20


def difference_hash(image: Image.Image) -> np.ndarray:
    small = np.asarray(image.convert("L").resize((9, 8), Image.Resampling.BOX), dtype=np.int16)
    return (small[:, 1:] > small[:, :-1]).flatten()


def plain(text: Optional[str]) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", text or "")).strip()


class Commons:
    def __init__(self, cache: Path):
        self.cache = cache
        self.cache.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def _get(self, params: Dict[str, str]) -> dict:
        key = hashlib.sha1(json.dumps(params, sort_keys=True).encode()).hexdigest()
        path = self.cache / f"{key}.json"
        if path.exists():
            return json.loads(path.read_text())
        response = self._request(API, params={**params, "format": "json", "formatversion": "2"})
        response.raise_for_status()
        path.write_text(response.text)
        return response.json()

    def _request(self, url: str, params: Optional[Dict[str, str]] = None) -> requests.Response:
        """Polite request: a pause between calls and backing off when Commons asks to slow down."""
        for attempt in range(6):
            time.sleep(1.0)
            response = self.session.get(url, params=params, timeout=30)
            if response.status_code != 429:
                return response
            time.sleep(float(response.headers.get("Retry-After", 0)) or 5 * 2 ** attempt)
        return response

    def search(self, query: str, limit: int = 8) -> List[str]:
        data = self._get({"action": "query", "list": "search", "srnamespace": "6", "srsearch": query, "srlimit": str(limit)})
        return [hit["title"] for hit in data.get("query", {}).get("search", []) if re.search(r"\.(jpe?g|png|tiff?)$", hit["title"], re.I)]

    def details(self, titles: List[str]) -> List[dict]:
        if not titles:
            return []
        data = self._get({"action": "query", "titles": "|".join(titles), "prop": "imageinfo",
                          "iiprop": "url|size|extmetadata", "iiurlwidth": "64"})
        return [page for page in data.get("query", {}).get("pages", []) if page.get("imageinfo")]

    def thumbnail(self, url: str) -> Optional[Image.Image]:
        path = self.cache / (hashlib.sha1(url.encode()).hexdigest() + ".img")
        if not path.exists():
            response = self._request(url)
            if response.status_code != 200:
                return None
            path.write_bytes(response.content)
        try:
            return Image.open(io.BytesIO(path.read_bytes())).convert("RGB")
        except OSError:
            return None


def queries(entry: dict) -> List[str]:
    artist = re.sub(r"\(.*?\)", "", entry["artist"]).strip()
    surname = artist.split()[-1]
    title = re.sub(r"\(.*?\)", "", entry["title"]["pl"]).strip()
    return [f"{surname} {title}", f"{artist} {title}", f"{surname} {' '.join(title.split()[:3])}"]


def find_source(commons: Commons, entry: dict, ours: np.ndarray, aspect: float) -> Optional[dict]:
    best = None
    seen = set()
    for query in queries(entry):
        titles = [title for title in commons.search(query) if title not in seen]
        seen.update(titles)
        for page in commons.details(titles):
            info = page["imageinfo"][0]
            if abs(info["width"] / info["height"] - aspect) > 0.25 * aspect:
                continue
            thumb = commons.thumbnail(info.get("thumburl") or info["url"])
            if thumb is None:
                continue
            distance = int(np.count_nonzero(difference_hash(thumb) != ours))
            if best is None or distance < best[0]:
                best = (distance, page, info)
        if best and best[0] <= MAX_DISTANCE // 2:
            break  # a near-identical match; no need for broader queries
    if not best or best[0] > MAX_DISTANCE:
        return None
    distance, page, info = best
    meta = info.get("extmetadata", {})
    # Licences such as CC BY-SA require naming whoever photographed the reproduction.
    needs_attribution = plain(meta.get("AttributionRequired", {}).get("value")).lower() == "true"
    author = re.sub(r"^Own work\s*", "", plain(meta.get("Credit", {}).get("value"))) if needs_attribution else ""
    return {
        "url": info["descriptionurl"],
        "title": page["title"],
        "institution": "Wikimedia Commons",
        "license": plain(meta.get("LicenseShortName", {}).get("value")) or "unknown",
        "licenseUrl": plain(meta.get("LicenseUrl", {}).get("value")) or None,
        "author": author or None,
        "match": "image",
        "retrieved": datetime.date.today().isoformat(),
        "_distance": distance,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--root", default="../..")
    parser.add_argument("--cache", required=True, help="Directory for API responses and thumbnails")
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    manifest_path = root / "content" / "artworks.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    commons = Commons(Path(args.cache))
    unmatched = []
    for entry in manifest:
        if entry.get("source"):
            continue
        with Image.open(root / "img" / entry["image"]) as image:
            ours = difference_hash(image)
            aspect = image.width / image.height
        source = find_source(commons, entry, ours, aspect)
        if source:
            distance = source.pop("_distance")
            for optional in ("licenseUrl", "author"):
                if source[optional] is None:
                    source.pop(optional)
            entry["source"] = source
            print(f"OK   {entry['id']}: {source['title']} ({source['license']}, distance {distance})")
        else:
            unmatched.append(entry["id"])
            print(f"MISS {entry['id']}")
    print(f"\nMatched {len(manifest) - len(unmatched)} of {len(manifest)}; unmatched: {', '.join(unmatched) or 'none'}")
    if args.write:
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
