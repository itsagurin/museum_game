import { describe, expect, it } from "vitest";
import { getColoringAssets } from "./coloring-assets";

describe("coloring exports", () => {
  it("matches the era and exact source filename even when names repeat", () => {
    const files = [
      "era2_romantyzm_kolorowanie/json/01_01_grid32.json",
      "era4_mloda_polska_kolorowanie/json/01_01_grid32.json",
      "era4_mloda_polska_kolorowanie/previews/01_01_grid32_art.png",
    ];
    expect(getColoringAssets("era4_mloda_polska/01_01.jpg", files)).toEqual({
      jsonFile: files[1], previewFile: files[2],
    });
  });

  it("keeps the distinct file containing spaces separate from its original", () => {
    const file = "era2_romantyzm_kolorowanie/json/01_01 copy_grid32.json";
    expect(getColoringAssets("era2_romantyzm/01_01 copy.jpg", [file])?.jsonFile).toBe(file);
    expect(getColoringAssets("era2_romantyzm/01_01.jpg", [file])).toBeUndefined();
  });

  it("supports a supplied grid size without assuming the earlier 20x20 target", () => {
    const file = "era1_oswiecenie_kolorowanie/json/artwork_grid20.json";
    expect(getColoringAssets("era1_oswiecenie/artwork.webp", [file])?.jsonFile).toBe(file);
  });

  it("leaves missing or ambiguous exports unconnected", () => {
    expect(getColoringAssets("era1_oswiecenie/artwork.jpg", [])).toBeUndefined();
    expect(getColoringAssets("era1_oswiecenie/artwork.jpg", [
      "era1_oswiecenie_kolorowanie/json/artwork_grid20.json",
      "era1_oswiecenie_kolorowanie/json/artwork_grid32.json",
    ])).toBeUndefined();
  });
});
