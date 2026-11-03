"""
Downloader for iconic Polish cultural heritage artworks from public domain sources (Wikimedia Commons).
"""

from pathlib import Path
from typing import List, Dict
import requests

POLISH_MASTERPIECES: List[Dict[str, str]] = [
    {
        "id": "stanczyk-matejko",
        "title": "Stańczyk",
        "artist": "Jan Matejko",
        "year": "1862",
        "filename": "stanczyk_matejko.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/7/78/Jan_Matejko%2C_Sta%C5%84czyk.jpg",
        "trivia": "Stańczyk na balu u królowej Bony jako jedyny przeżywa utratę Smoleńska, podczas gdy polski dwór beztrosko bawi się w sąsiedniej sali.",
        "historical_context": "Symbol narodowej refleksji i odpowiedzialności za losy ojczyzny. Jan Matejko nadał błaznowi własne rysy twarzy.",
    },
    {
        "id": "babie-lato-chelmonski",
        "title": "Babie lato",
        "artist": "Józef Chełmoński",
        "year": "1875",
        "filename": "babie_lato_chelmonski.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/5/58/J%C3%B3zef_Che%C5%82mo%C5%84ski_-_Indian_summer_-_Google_Art_Project.jpg",
        "trivia": "Obraz wywołał skandal w warszawskim Towarzystwie Zachęty Sztuk Pięknych – krytycy oburzali się, że artysta ukazał brudne, bose stopy wiejskiej dziewczyny.",
        "historical_context": "Arcydzieło polskiego realizmu, ukazujące harmonię człowieka z przyrodą i sielskie piękno nizin.",
    },
    {
        "id": "bociany-chelmonski",
        "title": "Bociany",
        "artist": "Józef Chełmoński",
        "year": "1900",
        "filename": "bociany_chelmonski.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/d/d6/J%C3%B3zef_Che%C5%82mo%C5%84ski_-_Bociany_-_01_%28MP_561_MNW%29.jpg",
        "trivia": "Bociany były malowane w majątku artysty w Kuklówce. Przelatujące ptaki symbolizowały nadejście wiosny i nadzieję na odrodzenie narodu pod zaborami.",
        "historical_context": "Ikoniczny motyw polskiego pejzażu wiejskiego, utrwalający etos pracy na roli i więź z ojczystą ziemią.",
    },
    {
        "id": "zydowka-z-pomaranczami-gierymski",
        "title": "Żydówka z pomarańczami",
        "artist": "Aleksander Gierymski",
        "year": "1881",
        "filename": "zydowka_z_pomaranczami_gierymski.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/7/72/Aleksander_Gierymski%2C_%C5%BByd%C3%B3wka_z_pomara%C5%84czami.jpg",
        "trivia": "Obraz został zrabowany przez Niemców w czasie II wojny światowej i uznany za zaginiony na niemal 70 lat, po czym odnaleziony na aukcji w Buxtehude w 2010 roku.",
        "historical_context": "Jeden z najważniejszych obrazów polskiego luminizmu i realizmu miejskiego, dokumentujący XIX-wieczną wielokulturową Warszawę.",
    },
    {
        "id": "szal-uniesien-podkowinski",
        "title": "Szał uniesień",
        "artist": "Władysław Podkowiński",
        "year": "1894",
        "filename": "szal_uniesien_podkowinski.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/b/bb/W%C5%82adys%C5%82aw_Podkowi%C5%84ski_-_Sza%C5%82_uniesie%C5%84.jpg",
        "trivia": "W 36. dniu wystawy sam artysta wszedł do galerii i pociął dzieło nożem. Motywy tego dramatycznego aktu do dziś pozostają tajemnicą miłosną.",
        "historical_context": "Uznawany za manifest polskiego symbolizmu i Młodej Polski, łączący motyw namiętności z destrukcyjną siłą natury.",
    },
]


def download_heritage_artworks(target_dir: str = "data/heritage") -> List[Dict[str, str]]:
    """Downloads heritage artworks and returns list of metadata dicts with local file paths."""
    out_path = Path(target_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    headers = {
        "User-Agent": "CodeForCulturePixelArt/1.0 (https://github.com/wojgww/image_generation; contact: wojgww@gmail.com)"
    }

    downloaded = []
    print(f"Downloading {len(POLISH_MASTERPIECES)} Polish masterpieces to {target_dir}...")

    for item in POLISH_MASTERPIECES:
        file_path = out_path / item["filename"]
        if file_path.exists() and file_path.stat().st_size > 10000:
            print(f"  [Cached] {item['title']} -> {file_path.name}")
        else:
            print(f"  [Download] {item['title']} from {item['url']}...")
            try:
                resp = requests.get(item["url"], headers=headers, timeout=30)
                resp.raise_for_status()
                with open(file_path, "wb") as f:
                    f.write(resp.content)
                print(f"    Saved: {file_path.name} ({len(resp.content) // 1024} KB)")
            except Exception as e:
                print(f"    Error downloading {item['title']}: {e}")
                continue

        item_with_local = dict(item)
        item_with_local["local_path"] = str(file_path)
        downloaded.append(item_with_local)

    return downloaded


if __name__ == "__main__":
    download_heritage_artworks()
