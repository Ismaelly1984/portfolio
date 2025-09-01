// scripts/build-images.mjs
import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES = join(__dirname, '..', 'images');

const files = [
  { in: 'meufinanceiro.jpg', outBase: 'meufinanceiro' },
  { in: 'flask-ecommerce.jpg', outBase: 'premiumstore' }
];

const widths = [400, 600, 800];
const aspect = 16/9;

async function run(){
  if(!existsSync(IMAGES)) mkdirSync(IMAGES, { recursive:true });

  for(const f of files){
    const input = join(IMAGES, f.in);
    for(const w of widths){
      const h = Math.round(w / aspect);

      // AVIF
      await sharp(input).resize(w, h, { fit:'cover', position:'center' })
        .avif({ quality:50, effort:4 })
        .toFile(join(IMAGES, `${f.outBase}-${w}.avif`));

      // WebP
      await sharp(input).resize(w, h, { fit:'cover', position:'center' })
        .webp({ quality:68 })
        .toFile(join(IMAGES, `${f.outBase}-${w}.webp`));

      // JPG fallback (progressivo)
      await sharp(input).resize(w, h, { fit:'cover', position:'center' })
        .jpeg({ quality:78, progressive:true, mozjpeg:true })
        .toFile(join(IMAGES, `${f.outBase}-${w}.jpg`));
    }
  }
  console.log('✅ Imagens geradas (AVIF/WebP/JPG) em 400/600/800, crop 16:9');
}

run().catch(err=>{ console.error(err); process.exit(1); });
