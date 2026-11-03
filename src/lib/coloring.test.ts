import { describe, expect, it } from 'vitest';
import { parseColoringArtwork, paintResult } from './coloring';
const payload = { id:'demo', title:'Obraz', artist:'Artysta', year:'1862', original_image_url:'/artworks/demo.webp', grid:{width:3,height:2,data:[[1,1,2],[2,1,2]]}, palette:[{id:1,hex:'#7A141A',name:'Czerwień'},{id:2,hex:'#1F1A24',name:'Cień'}], cultural_data:{trivia:'Fakt',historical_context:'Kontekst'} };
describe('coloring JSON contract and painting rules', () => {
  it('accepts the supplied contract without changing numeric palette ids', () => { expect(parseColoringArtwork(payload)).toBe(payload); });
  it('rejects malformed dimensions, unknown colors, duplicates and unsafe URLs', () => {
    for (const invalid of [{...payload,grid:{...payload.grid,width:32}}, {...payload,grid:{...payload.grid,data:[[1,1,99],[2,1,2]]}}, {...payload,palette:[payload.palette[0],payload.palette[0]]}, {...payload,original_image_url:'javascript:alert(1)'}, {...payload,cultural_data:null}]) expect(() => parseColoringArtwork(invalid)).toThrow();
  });
  it('only accepts the selected matching paint, and ignores already painted fields', () => {
    expect(paintResult(3,null,false)).toBe('wrong');
    expect(paintResult(3,2,false)).toBe('wrong');
    expect(paintResult(3,3,false)).toBe('correct');
    expect(paintResult(3,2,true)).toBe('ignored');
  });
});
