import { readFile } from "node:fs/promises";
import { afterEach, describe, expect, it, vi } from "vitest";
import { artworks } from "./eras";
import { loadColoringArtwork } from "./coloring-library";
import metadata from "./artworks_qa.json";
import curiosities from "./artworks_curiosities.json";

afterEach(() => vi.unstubAllGlobals());

describe("uploaded coloring collection", () => {
  it("connects all 83 reproductions to their exact grids without cross-era ID collisions", async () => {
    expect(artworks).toHaveLength(83);
    expect(curiosities).toHaveLength(artworks.length);
    expect(new Set(curiosities.map((entry) => entry.filename)).size).toBe(artworks.length);
    expect(new Set(artworks.map((artwork) => artwork.coloringArtworkId)).size).toBe(83);
    for (const artwork of artworks) {
      const entry = metadata.find((item) => item.filename === `assets/artworks/${artwork.sourceFile}`)!;
      expect(entry, artwork.sourceFile).toBeDefined();
      const curiosity = curiosities.find((item) => item.filename === `assets/artworks/${artwork.sourceFile}`)!;
      expect(curiosity, artwork.sourceFile).toBeDefined();
      expect(curiosity.curiosity.trim()).not.toBe("");
      const raw = JSON.parse(await readFile(`img/${artwork.coloringArtworkId}`, "utf8"));
      const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(raw)));
      vi.stubGlobal("fetch", fetchMock);
      const parsed = await loadColoringArtwork(artwork);
      expect(fetchMock).toHaveBeenCalledWith(artwork.coloringSource, { signal: undefined });
      expect(parsed.grid).toEqual(raw.grid);
      expect(parsed.palette).toEqual(raw.palette);
      expect(parsed.id).toBe(artwork.coloringArtworkId);
      expect(parsed.original_image_url).toBe(artwork.originalImage);
      expect(parsed.title).toBe(artwork.title.pl);
      expect(parsed.title).toBe(entry.title);
      expect(parsed.artist).toBe(entry.artist);
      expect(parsed.year).toBe(entry.year);
      expect(parsed.cultural_data).toEqual({ trivia: curiosity.curiosity, historical_context: entry.style_description });
      expect(artwork.funFact).toEqual({ pl: curiosity.curiosity, en: curiosity.curiosity });
      expect(artwork.title.en).toBe(entry.title);
      expect(artwork.coloredPreview).toBeTruthy();
    }
  });

  it("keeps titles for repeated filenames in separate eras and distinguishes the copy", () => {
    const titleFor = (sourceFile: string) => artworks.find((artwork) => artwork.sourceFile === sourceFile)?.title.pl;
    expect(titleFor("era2_romantyzm/02_02.jpg")).toBe("Szarża w wąwozie Somosierra");
    expect(titleFor("era4_mloda_polska/02_02.jpg")).toBe("Dziewczynka z chryzantemami");
    expect(titleFor("era2_romantyzm/01_01 copy.jpg")).toBe("Pożegnanie powstańca (z cyklu Polonia)");
    expect(titleFor("era2_romantyzm/01_01.jpg")).toBe("Portret Adama Mickiewicza na Judahu skale");
  });

  it("rejects broken data and failed responses before opening a canvas", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("missing", { status: 404 })));
    await expect(loadColoringArtwork(artworks[0])).rejects.toThrow();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"grid": {"width": 32}}')));
    await expect(loadColoringArtwork(artworks[0])).rejects.toThrow();
  });

  it("passes cancellation to the request and never loads an unconnected entry", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new DOMException("Aborted", "AbortError"));
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    controller.abort();
    await expect(loadColoringArtwork(artworks[0], controller.signal)).rejects.toThrow("Aborted");
    expect(fetchMock).toHaveBeenCalledWith(artworks[0].coloringSource, { signal: controller.signal });
    fetchMock.mockClear();
    await expect(loadColoringArtwork({ ...artworks[0], coloringSource: undefined })).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
