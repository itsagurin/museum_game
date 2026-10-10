import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

// Reduce the actual artwork to five paints; the renderer subdivides large patches.
const paintSets = {
  stanczyk: [['#7A141A','Czerwień szkarłatna'],['#1F1A24','Głęboki cień'],['#C69C55','Złoto wawelskie'],['#4B2E1E','Ciemny brąz'],['#E3D5C5','Kremowy']],
  bociany: [['#414433','Cień oliwkowy'],['#7A8051','Zieleń łąki'],['#C0A571','Złoto ziemi'],['#E5DCC3','Ciepła biel'],['#AFB8AA','Jasne niebo']],
  konstytucja: [['#773C30','Ceglasta czerwień'],['#242226','Głęboki cień'],['#B58A50','Stare złoto'],['#645343','Ciepły brąz'],['#DED3BB','Światło pergaminu']],
};
const sourceDirectory = process.argv[2];
const entries = [
  { id:'stanczyk-matejko', file:'stanczyk', title:'Stańczyk', artist:'Jan Matejko', year:'1862', trivia:'Wśród bawiącego się dworu Stańczyk siedzi samotnie, pogrążony w myślach.', historical_context:'Matejko zestawia zabawę dworu z refleksją błazna nad losem kraju.' },
  { id:'bociany-chelmonski', file:'bociany', title:'Bociany', artist:'Józef Chełmoński', year:'1900', trivia:'Ojciec i chłopiec przerywają pracę, by wspólnie spojrzeć na bociany.', historical_context:'Codzienność polskiej wsi i bliskość natury stają się tematem wielkiego malarstwa.' },
  { id:'konstytucja-matejko', file:'konstytucja', title:'Konstytucja 3 maja', artist:'Jan Matejko', year:'1891', trivia:'Marszałek Stanisław Małachowski unosi dokument wśród tłumu.', historical_context:'Dzieło powstało sto lat po uchwaleniu Konstytucji 3 maja 1791 roku.' },
];
await mkdir('public/artworks', { recursive:true });
for (const item of entries) {
  const input = sourceDirectory ? `${sourceDirectory}/${item.file}.jpg` : `public/artworks/${item.file}.webp`;
  const metadata = await sharp(input).metadata();
  const gridHeight = Math.round(32 * metadata.height / metadata.width);
  if (sourceDirectory) await sharp(input).resize({width:1440,withoutEnlargement:true}).webp({quality:88}).toFile(`public/artworks/${item.file}.webp`);
  const { data:pixels, info } = await sharp(input).resize(32,gridHeight,{fit:'fill'}).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const palette = paintSets[item.file].map(([hex,name],i) => ({id:i+1,hex,name}));
  const rgb = palette.map(color => [1,3,5].map(offset=>parseInt(color.hex.slice(offset,offset+2),16)));
  let grid = Array.from({length:gridHeight}, (_,y) => Array.from({length:32}, (_,x) => {
    let closest=0, distance=Infinity;
    rgb.forEach((channels,i) => { const d=channels.reduce((sum,n,c)=>sum+(pixels[(y*32+x)*info.channels+c]-n)**2,0); if(d<distance){distance=d;closest=i;} });
    return closest+1;
  }));
  // Remove isolated one-pixel speckles while retaining faces and small highlights.
  grid = grid.map((row,y)=>row.map((id,x)=>{
    const neighbors=[];
    for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]) if(grid[y+dy]?.[x+dx]!==undefined) neighbors.push(grid[y+dy][x+dx]);
    if(neighbors.includes(id)) return id;
    return neighbors.sort((a,b)=>neighbors.filter(n=>n===b).length-neighbors.filter(n=>n===a).length)[0] ?? id;
  }));
  // Reserve enough source-matched cells for every paint, including pale highlights.
  // This keeps five usable numbered fields per brush even in dark reproductions.
  const counts = new Map(palette.map(color=>[color.id,grid.flat().filter(id=>id===color.id).length]));
  for(const color of palette) {
    const candidates = grid.flatMap((row,y)=>row.map((_,x)=>({x,y,d:rgb[color.id-1].reduce((sum,n,c)=>sum+(pixels[(y*32+x)*info.channels+c]-n)**2,0)}))).sort((a,b)=>a.d-b.d);
    for(const {x,y} of candidates) {
      if(counts.get(color.id)>=25) break;
      const old=grid[y][x];
      if(old===color.id || counts.get(old)<=25) continue;
      grid[y][x]=color.id; counts.set(old,counts.get(old)-1); counts.set(color.id,counts.get(color.id)+1);
    }
  }
  const payload = {id:item.id,title:item.title,artist:item.artist,year:item.year,original_image_url:`/artworks/${item.file}.webp`,grid:{width:32,height:gridHeight,data:grid},palette,cultural_data:{trivia:item.trivia,historical_context:item.historical_context}};
  await writeFile(`public/artworks/${item.file}.json`, JSON.stringify(payload,null,2)+'\n');
}
console.log('Prepared three local artwork images and JSON payloads.');
