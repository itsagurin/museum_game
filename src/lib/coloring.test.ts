import { describe, expect, it } from 'vitest';
import { parseColoringBoard, paintResult } from './coloring';
const payload = { schemaVersion:2, id:'demo', grid:{width:3,height:2,data:[[1,1,2],[2,1,2]]}, palette:[{id:1,hex:'#7A141A',name:'Czerwień'},{id:2,hex:'#1F1A24',name:'Cień'}] };
describe('coloring JSON contract and painting rules', () => {
  it('accepts a generated board without changing numeric palette ids', () => { expect(parseColoringBoard(payload)).toEqual({ grid: payload.grid, palette: payload.palette }); });
  it('accepts boards that keep the artwork proportions', () => {
    const wide = { ...payload, grid: { width: 4, height: 2, data: [[1, 1, 2, 2], [2, 1, 2, 1]] } };
    expect(parseColoringBoard(wide).grid.width).toBe(4);
  });
  it('rejects malformed dimensions, unknown colors, duplicates and invalid hex', () => {
    for (const invalid of [{...payload,grid:{...payload.grid,width:32}}, {...payload,grid:{...payload.grid,data:[[1,1,99],[2,1,2]]}}, {...payload,palette:[payload.palette[0],payload.palette[0]]}, {...payload,palette:[{id:1,hex:'red',name:'x'},payload.palette[1]]}, {...payload,grid:null}]) expect(() => parseColoringBoard(invalid)).toThrow();
  });
  it('only accepts the selected matching paint, and ignores already painted fields', () => {
    expect(paintResult(3,null,false)).toBe('wrong');
    expect(paintResult(3,2,false)).toBe('wrong');
    expect(paintResult(3,3,false)).toBe('correct');
    expect(paintResult(3,2,true)).toBe('ignored');
  });
});
