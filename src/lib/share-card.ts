import { track } from "./analytics";
import { copy } from "@/data/copy";
import { getEra } from "@/data/eras";
import { loadColoringArtwork } from "@/data/coloring-library";
import type { Artwork,Language } from "@/types/game";

/** Fit titles to a bounded block, including words wider than one line. */
export function wrapText(text: string, measure: (text:string)=>number, width: number, maxLines=3): string[] {
  const chars=Array.from(text.trim().replace(/\s+/g," "));
  const lines:string[]=[];
  while(chars.length && lines.length<maxLines) {
    let count=0;
    while(count<chars.length && measure(chars.slice(0,count+1).join(""))<=width) count++;
    if(count===chars.length){lines.push(chars.join(""));break;}
    if(lines.length===maxLines-1){
      while(count>0 && measure(chars.slice(0,count).join("").trimEnd()+"…")>width) count--;
      lines.push(chars.slice(0,count).join("").trimEnd()+"…");break;
    }
    const space=chars.slice(0,count+1).lastIndexOf(" ");
    const end=space>0 ? space : Math.max(count,1);
    lines.push(chars.splice(0,end).join("").trim());
    while(chars[0]===" ")chars.shift();
  }
  return lines;
}
async function fonts(text: string) {
  await document.fonts.ready;
  const sample = `ĄĆĘŁŃÓŚŹŻ ąćęłńóśźż ${text}`;
  await Promise.all([document.fonts.load('500 48px "Cormorant Garamond"', sample),document.fonts.load('400 26px "DM Sans"', sample)]);
}
function canvas(width:number,height:number) {
  const element=document.createElement("canvas");element.width=width;element.height=height;
  const ctx=element.getContext("2d");if(!ctx)throw new Error("Canvas unavailable");
  ctx.fillStyle="#e8e4d8";ctx.fillRect(0,0,width,height);
  ctx.strokeStyle="#859078";ctx.lineWidth=2;ctx.strokeRect(30,30,width-60,height-60);
  ctx.fillStyle="#34382c";
  return {element,ctx};
}
const png=(element:HTMLCanvasElement)=>new Promise<Blob>((resolve,reject)=>element.toBlob(blob=>blob ? resolve(blob):reject(new Error("PNG unavailable")),"image/png"));
function loadLocalImage(src:string):Promise<HTMLImageElement> {
  const url=new URL(src,location.href);if(url.origin!==location.origin)throw new Error("Image must be local");
  return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error("Image unavailable"));image.src=url.href;});
}
function contain(ctx:CanvasRenderingContext2D,image:CanvasImageSource,width:number,height:number,x:number,y:number,boxWidth:number,boxHeight:number) {
  const scale=Math.min(boxWidth/width,boxHeight/height);
  ctx.drawImage(image,x+(boxWidth-width*scale)/2,y+(boxHeight-height*scale)/2,width*scale,height*scale);
}
export async function renderShareCard(artwork:Artwork,language:Language):Promise<Blob> {
  artwork=(await import("@/data/artwork-details")).getArtworkDetails(artwork);
  await fonts(JSON.stringify(artwork));
  const board=await loadColoringArtwork(artwork).catch(error=>artwork.introPuzzle ? loadColoringArtwork({...artwork,coloringSource:artwork.introPuzzle}) : Promise.reject(error));
  const image=await loadLocalImage(artwork.thumbnailImage ?? artwork.originalImage!);
  const pixels=document.createElement("canvas");pixels.width=board.grid.width;pixels.height=board.grid.height;
  const paint=pixels.getContext("2d")!;const colors=new Map(board.palette.map(c=>[c.id,c.hex]));
  board.grid.data.forEach((row,y)=>row.forEach((id,x)=>{paint.fillStyle=colors.get(id)!;paint.fillRect(x,y,1,1);}));
  const {element,ctx}=canvas(1080,1350),t=copy[language];
  ctx.font='500 76px "Cormorant Garamond"';ctx.fillText("Dziedzictwo",64,125);
  ctx.font='400 26px "DM Sans"';ctx.fillText(t.shareRestored,64,178);
  ctx.font='400 22px "DM Sans"';ctx.fillText(t.sharePixels,64,236);ctx.fillText(t.shareOriginal,552,236);
  ctx.fillStyle="#f6f2e8";ctx.fillRect(64,260,464,560);ctx.fillRect(552,260,464,560);
  ctx.imageSmoothingEnabled=false;contain(ctx,pixels,pixels.width,pixels.height,64,260,464,560);
  ctx.imageSmoothingEnabled=true;contain(ctx,image,image.naturalWidth,image.naturalHeight,552,260,464,560);
  ctx.fillStyle="#34382c";ctx.font='500 50px "Cormorant Garamond"';
  const lines=wrapText(artwork.title[language],s=>ctx.measureText(s).width,952,3);
  lines.forEach((line,i)=>ctx.fillText(line,64,920+i*58));
  ctx.font='400 25px "DM Sans"';ctx.fillText([artwork.artist,artwork.year].filter(Boolean).join(" · "),64,1145);
  ctx.fillText(getEra(artwork.eraId).name[language],64,1190);
  ctx.font='400 22px "DM Sans"';ctx.fillText(location.origin+(process.env.NEXT_PUBLIC_BASE_PATH || ""),64,1235);
  if(artwork.source) {
    ctx.font='400 12px "DM Sans"';
    const credit=[artwork.source.author,artwork.source.license,artwork.source.licenseUrl,artwork.source.url,t.shareSourceChanges].filter(Boolean).join(" · ");
    wrapText(credit,s=>ctx.measureText(s).width,952,3).forEach((line,i)=>ctx.fillText(line,64,1270+i*16));
  }
  return png(element);
}
export async function renderCertificate(count:number,language:Language,name="",date=new Date()):Promise<Blob> {
  await fonts(name);const {element,ctx}=canvas(1754,1240),t=copy[language];
  ctx.textAlign="center";ctx.font='400 30px "DM Sans"';ctx.fillText("Dziedzictwo",877,150);
  ctx.font='500 100px "Cormorant Garamond"';ctx.fillText(t.certificateTitle,877,340);
  ctx.font='500 68px "Cormorant Garamond"';wrapText(name.trim(),s=>ctx.measureText(s).width,1500,2).forEach((line,i)=>ctx.fillText(line,877,505+i*82));
  ctx.font='400 38px "DM Sans"';ctx.fillText(t.certificateCount(count),877,800);
  ctx.fillText(date.toLocaleDateString(language==="pl" ? "pl-PL" : "en-GB"),877,885);
  ctx.font='400 26px "DM Sans"';ctx.fillText(t.shareRestored,877,1000);
  ctx.fillText(location.origin+(process.env.NEXT_PUBLIC_BASE_PATH || ""),877,1080);
  return png(element);
}
export async function deliverPng(blob:Blob,filename:string):Promise<"share"|"download"|null> {
  const file=new File([blob],filename,{type:"image/png"});
  if(navigator.share && navigator.canShare?.({files:[file]})) {
    try {await navigator.share({files:[file]});void track("share",{kind:filename==="dziedzictwo-certificate.png" ? "certificate" : "card",method:"share"});return "share";} catch(error) {if(error instanceof DOMException && error.name==="AbortError")return null;}
  }
  const url=URL.createObjectURL(file),link=document.createElement("a");link.href=url;link.download=filename;
  document.body.append(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  void track("share",{kind:filename==="dziedzictwo-certificate.png" ? "certificate" : "card",method:"download"});
  return "download";
}
