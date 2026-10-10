import { describe, expect, it } from 'vitest';
import { buildRegions, parseColoringArtwork, paintResult } from './coloring';
import { readFileSync } from 'node:fs';
const payload = { id:'demo', title:'Obraz', artist:'Artysta', year:'1862', original_image_url:'/artworks/demo.webp', grid:{width:3,height:2,data:[[1,1,2],[2,1,2]]}, palette:[{id:1,hex:'#7A141A',name:'Czerwień'},{id:2,hex:'#1F1A24',name:'Cień'}], cultural_data:{trivia:'Fakt',historical_context:'Kontekst'} };
describe('coloring JSON and connected regions', () => {
  it('accepts the supplied contract without changing numeric palette ids', () => { expect(parseColoringArtwork(payload)).toBe(payload); });
  it('rejects malformed dimensions, unknown colors, duplicates and unsafe URLs', () => {
    for (const invalid of [{...payload,grid:{...payload.grid,width:32}}, {...payload,grid:{...payload.grid,data:[[1,1,99],[2,1,2]]}}, {...payload,palette:[payload.palette[0],payload.palette[0]]}, {...payload,original_image_url:'javascript:alert(1)'}, {...payload,cultural_data:null}]) expect(() => parseColoringArtwork(invalid)).toThrow();
  });
  it('merges adjacent cells while keeping separated patches of the same color independent', () => {
    const regions=buildRegions(payload.grid);
    expect(regions.map(region=>[region.colorId,region.cells])).toEqual([[1,3],[2,2],[2,1]]);
    expect(regions.reduce((sum,region)=>sum+region.cells,0)).toBe(6);
    for (const region of regions) expect(payload.grid.data[Math.floor(region.center.y)][Math.floor(region.center.x)]).toBe(region.colorId);
  });
  it('does not connect diagonal cells and excludes internal borders', () => {
    expect(buildRegions({width:2,height:2,data:[[1,2],[2,1]]})).toHaveLength(4);
    const [region]=buildRegions({width:2,height:1,data:[[1,1]]});
    expect(region.outline).not.toContain('M1,0v1');
  });
  it('only accepts the selected matching paint, and ignores already painted fields', () => {
    expect(paintResult(3,null,false)).toBe('wrong');
    expect(paintResult(3,2,false)).toBe('wrong');
    expect(paintResult(3,3,false)).toBe('correct');
    expect(paintResult(3,2,true)).toBe('ignored');
  });
  it('every demo has five paints and at least five connected fields per paint', () => {
    for (const name of ['stanczyk','bociany','konstytucja']) {
      const art=parseColoringArtwork(JSON.parse(readFileSync(`public/artworks/${name}.json`,'utf8')));
      const regions=buildRegions(art.grid,5);
      expect(art.palette).toHaveLength(5);
      const cells=regions.flatMap(region=>region.cellIndices);
      expect(new Set(cells).size).toBe(art.grid.width*art.grid.height);
      expect(cells.length).toBe(art.grid.width*art.grid.height);
      for(const color of art.palette) expect(regions.filter(region=>region.colorId===color.id).length).toBeGreaterThanOrEqual(5);
      for(const region of regions) {
        const remaining=new Set(region.cellIndices), queue=[region.cellIndices[0]];
        remaining.delete(queue[0]);
        for(let i=0;i<queue.length;i++) {
          const cell=queue[i], x=cell%art.grid.width, y=Math.floor(cell/art.grid.width);
          expect(art.grid.data[y][x]).toBe(region.colorId);
          for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
            if(nx<0||nx>=art.grid.width||ny<0||ny>=art.grid.height) continue;
            const next=ny*art.grid.width+nx;
            if(remaining.delete(next)) queue.push(next);
          }
        }
        expect(remaining.size).toBe(0);
      }
      expect(art.original_image_url).toBe(`/artworks/${name}.webp`);
      expect(art.cultural_data.trivia.length).toBeGreaterThan(10);
      expect(art.cultural_data.historical_context.length).toBeGreaterThan(10);
      const webpPath = `public${art.original_image_url}`;
      expect(readFileSync(webpPath).length).toBeGreaterThan(1000);
    }
  });
});
