// generate-images.js
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const inputDir = "./images-src";
const outputDir = "./images";

const sizes = [400, 600, 800];

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

async function processImage(file) {
  const name = path.parse(file).name;
  const inputPath = path.join(inputDir, file);

  for (const size of sizes) {
    const jpgOutput = path.join(outputDir, `${name}-${size}.jpg`);
    const webpOutput = path.join(outputDir, `${name}-${size}.webp`);

    await sharp(inputPath).resize(size).jpeg({ quality: 80 }).toFile(jpgOutput);
    await sharp(inputPath).resize(size).webp({ quality: 80 }).toFile(webpOutput);

    console.log(`✔ Gerado: ${jpgOutput} e ${webpOutput}`);
  }
}

async function run() {
  const files = fs.readdirSync(inputDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  for (const file of files) {
    await processImage(file);
  }

  console.log("🚀 Todas as imagens foram processadas!");
}

run().catch(err => console.error(err));
