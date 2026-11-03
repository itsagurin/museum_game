import { readFile } from "node:fs/promises";
import { afterEach, describe, expect, it, vi } from "vitest";
import { artworks, content, legacyArtworkIds } from "./eras";
import { loadColoringArtwork } from "./coloring-library";

afterEach(() => vi.unstubAllGlobals());

describe("coloring collection", () => {
  it("connects every artwork to its own board and its catalogue texts", async () => {
    expect(artworks).toHaveLength(content.length);
    for (const artwork of artworks) {
      const entry = content.find((item) => item.id === artwork.id)!;
      const raw = JSON.parse(await readFile(`img/${entry.puzzle}`, "utf8"));
      const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(raw)));
      vi.stubGlobal("fetch", fetchMock);
      const parsed = await loadColoringArtwork(artwork);
      expect(fetchMock).toHaveBeenCalledWith(artwork.coloringSource, { signal: undefined });
      expect(parsed.grid).toEqual(raw.grid);
      expect(parsed.palette).toEqual(raw.palette);
      expect(parsed.id).toBe(entry.puzzle);
      expect(parsed.original_image_url).toBe(artwork.originalImage);
      expect(parsed).toMatchObject({ title: entry.title.pl, artist: entry.artist, year: entry.year });
      expect(parsed.cultural_data).toEqual({ trivia: entry.curiosity.pl, historical_context: entry.story.pl });
      expect(artwork.coloredPreview).toContain(entry.preview);
    }
  });

  it("maps every earlier save identity to exactly one artwork", () => {
    const legacy = content.flatMap((entry) => entry.legacyIds);
    expect(new Set(legacy).size).toBe(legacy.length);
    expect(legacyArtworkIds.size).toBe(legacy.length);
    // Repeated numeric file names and the "copy" were separate artworks before and still are.
    expect(legacyArtworkIds.get("era-2-catalog-01_01%20copy.jpg")).toBe("grottger-pozegnanie-powstanca");
    expect(legacyArtworkIds.get("era-2-catalog-01_01.jpg")).toBe("wankowicz-portret-adama-mickiewicza-judahu");
    expect(legacyArtworkIds.get("era-4-catalog-01_01.jpg")).toBe("boznanska-pracowni");
    expect(legacyArtworkIds.get("era-3-art-1")).toBe("matejko-stanczyk-czasie-balu-dworze");
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
