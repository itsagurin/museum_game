"""Compare extreme artwork proportions without replacing any shipped board."""
import argparse, base64, html, io, json
from pathlib import Path
from PIL import Image
from src.core.puzzle_builder import BoardSettings, build_board, render_preview
from src.build_puzzles import grid_signature

def data_url(image):
    stream=io.BytesIO(); image.save(stream,format="PNG"); return 'data:image/png;base64,'+base64.b64encode(stream.getvalue()).decode()

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',default='../..');parser.add_argument('--report',required=True)
    args=parser.parse_args();root=Path(args.root).resolve(); entries=json.loads((root/'content/artworks.json').read_text());rows=[]; summary=[]
    for entry in entries:
        with Image.open(root/'img'/entry['image']) as image:
            ratio=max(image.width/image.height,image.height/image.width)
            if ratio<=2:continue
            source=image.copy();source.thumbnail((360,220))
            cards=[f'<figure><img src="{data_url(source)}" alt="Reprodukcja"><figcaption>Oryginał {image.width}×{image.height}</figcaption></figure>'];variants=[]
            for label,settings in [('Obecnie: bok 32, minimum 12',BoardSettings()),('Bok 32, minimum 16',BoardSettings(min_short_edge=16)),('Bok 40, minimum 12',BoardSettings(long_edge=40))]:
                board=build_board(image,entry['id'],settings);g=board['grid'];signature=grid_signature(board);variants.append({'label':label,'width':g['width'],'height':g['height'],'cells':g['width']*g['height'],'signature':signature})
                cards.append(f'<figure><img class="pixel" src="{data_url(render_preview(board))}" alt="Plansza"><figcaption>{label}<br>{g["width"]}×{g["height"]} · {g["width"]*g["height"]} pól · {len(board["palette"])} kolorów</figcaption></figure>')
            source_entry=entry.get('source') or {};credit=f'<a href="{html.escape(source_entry.get("url",""))}">Źródło</a> · {html.escape(source_entry.get("license","brak dopasowania"))}'
            rows.append(f'<section><h2>{html.escape(entry["title"]["pl"])}</h2><p>{html.escape(entry["artist"])} · {entry["id"]} · proporcja {ratio:.2f}:1 · {credit}</p><div>{"".join(cards)}</div></section>');summary.append({'id':entry['id'],'ratio':round(ratio,3),'variants':variants})
    report=Path(args.report);report.parent.mkdir(parents=True,exist_ok=True)
    report.write_text('<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Porównanie proporcji plansz</title><style>body{font:16px system-ui;background:#f2f0e6;color:#34382c;margin:24px}section{margin:30px 0}section>div{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}figure{margin:0;padding:12px;background:#fff;border-radius:12px}img{width:100%;height:220px;object-fit:contain}.pixel{image-rendering:pixelated}a{color:#713c2e}</style><h1>A10 · Skrajne proporcje plansz</h1><p>Raport porównuje trzy warianty. Plansze gry nie zostały zmienione. Inne wymiary lub paleta zmieniają sygnaturę: rozpoczęte obrazy objęte zmianą tracą pomalowane pola, ukończenia i ściany pozostają.</p>'+''.join(rows)+'</html>')
    report.with_suffix('.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n');print(json.dumps(summary,ensure_ascii=False))
if __name__=='__main__':main()
