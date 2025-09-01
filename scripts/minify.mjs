// scripts/minify.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';
import { transform as cssTransform } from 'lightningcss';

const __dirname = dirname(fileURLToPath(import.meta.url));

/* CSS */
{
  const cssPath = join(__dirname,'..','css','styles.css');
  const css = readFileSync(cssPath);
  const { code } = cssTransform({
    filename: 'styles.css',
    code: css,
    minify: true
  });
  writeFileSync(cssPath, Buffer.from(code));
  console.log('✅ CSS minificado');
}

/* JS */
{
  const jsPath = join(__dirname,'..','js','script.js');
  const js = readFileSync(jsPath, 'utf8');
  const out = await transform(js, { minify: true, target: 'es2020' });
  writeFileSync(jsPath, out.code, 'utf8');
  console.log('✅ JS minificado');
}
