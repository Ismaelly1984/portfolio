// scripts/minify.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';
import { transform as cssTransform } from 'lightningcss';

const __dirname = dirname(fileURLToPath(import.meta.url));

/* CSS */
{
  const cssSourcePath = join(__dirname,'..','css','styles.css');
  const cssOutPath = join(__dirname,'..','css','styles.min.css');
  const css = readFileSync(cssSourcePath);
  const { code } = cssTransform({
    filename: 'styles.css',
    code: css,
    minify: true
  });
  writeFileSync(cssOutPath, Buffer.from(code));
  console.log('✅ CSS minificado em styles.min.css');
}

/* JS */
{
  const jsSourcePath = join(__dirname,'..','js','script.js');
  const jsOutPath = join(__dirname,'..','js','script.min.js');
  const js = readFileSync(jsSourcePath, 'utf8');
  const out = await transform(js, { minify: true, target: 'es2020' });
  writeFileSync(jsOutPath, out.code, 'utf8');
  console.log('✅ JS minificado em script.min.js');
}
