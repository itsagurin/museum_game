import { describe, expect, it } from "vitest";
import manifest from "../../content/artworks.json" with { type: "json" };
import { artworks, content } from "./eras";
import { getArtworkDetails } from "./artwork-details";

describe("deferred artwork descriptions", () => {
  it("keeps collection identities, boards and save mappings in the initial catalogue", () => {
    expect(content.map(entry => entry.id)).toEqual(manifest.map(entry => entry.id));
    for (const entry of manifest) expect(content.find(summary => summary.id === entry.id)).toMatchObject({ id: entry.id, legacyIds: entry.legacyIds, puzzleVersion: entry.puzzleVersion });
    expect(content.every(entry => !("story" in entry) && !("curiosity" in entry))).toBe(true);
  });
  it("restores every original description and attribution without changing identity", () => {
    for (const artwork of artworks) {
      const entry = manifest.find(entry => entry.id === artwork.id)!;
      const rich = getArtworkDetails(artwork);
      expect(rich).toMatchObject({ id: artwork.id, coloringSource: artwork.coloringSource, story: entry.story, funFact: entry.curiosity, style: entry.style });
      expect(rich.source).toEqual(entry.source ?? undefined);
      expect(artwork.source).toEqual(entry.source ?? undefined);
    }
  });
  it("leaves unknown artworks intact", () => {
    const unknown = { ...artworks[0], id: "unknown" };
    expect(getArtworkDetails(unknown)).toBe(unknown);
  });
});
