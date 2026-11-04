import { expect, it } from "vitest";
import sharp from "sharp";
import { coloringPaths } from "./coloring-paths";

it("rasterizes grouped cell backgrounds into the exact original colours and positions", async () => {
  const colors = new Map([[3, "#ff0000"], [7, "#00ff00"], [9, "#0000ff"]]);
  const paths = coloringPaths({ width: 3, height: 2, data: [[3, 7, 3], [9, 7, 9]] });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3" height="2">${paths.map(path => `<path d="${path.d}" fill="${colors.get(path.id)}"/>`).join("")}</svg>`;
  const pixels = await sharp(Buffer.from(svg)).removeAlpha().raw().toBuffer();
  expect([...pixels]).toEqual([255,0,0, 0,255,0, 255,0,0, 0,0,255, 0,255,0, 0,0,255]);
  expect(paths).toHaveLength(3);
});
