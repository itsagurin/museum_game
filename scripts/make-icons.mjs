import sharp from "sharp";
import { mkdir } from "node:fs/promises";
await mkdir("public/icons", { recursive: true });
for (const size of [180, 192, 512]) await sharp("img/house4.jpg").resize(size,size,{fit:"cover",position:"centre"}).png({palette:true,quality:90}).toFile(`public/icons/icon-${size}.png`);
const centre = await sharp("img/house4.jpg").resize(400,400,{fit:"cover"}).png({palette:true,quality:90}).toBuffer();
await sharp({create:{width:512,height:512,channels:3,background:"#e8e4d8"}}).composite([{input:centre,left:56,top:56}]).png({palette:true,quality:90}).toFile("public/icons/maskable-512.png");
