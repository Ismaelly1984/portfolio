// build.mjs (Node ESM)
import { promises as fs } from 'fs';
import path from 'path';
import { minify as minifyHtml } from 'html-minifier-terser';

const SRC = process.cwd();
const DIST = path.join(SRC, 'dist');

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function copyDir(src, dest) {
  await ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.DS_Store')) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}

function rewriteProdRefs(html) {
  // CSS principal
  html = html.replace(/href="css\/styles\.css"/g, 'href="css/styles.min.css"');

  // Pré-carregamento CSS (se houver)
  html = html.replace(/href="css\/styles\.css" as="style"/g, 'href="css/styles.min.css" as="style"');

  // JS principal (garante que só a versão minificada seja referenciada)
  html = html
    .replace(/src="js\/script\.js"/g, 'src="js/script.min.js"')
    // Remove duplicatas acidentais do script min no HTML
    .replace(/(<script[^>]+src="js\/script\.min\.js"[^>]*><\/script>)([\s\S]*?)\1/g, '$1');

  return html;
}

async function buildHTML() {
  const srcFile = path.join(SRC, 'index.html');
  const distFile = path.join(DIST, 'index.html');
  let html = await fs.readFile(srcFile, 'utf8');

  html = rewriteProdRefs(html);

  const minified = await minifyHtml(html, {
    collapseWhitespace: true,
    conservativeCollapse: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true,
    keepClosingSlash: true
  });

  await fs.writeFile(distFile, minified, 'utf8');
}

async function main() {
  // limpa e recria dist
  await fs.rm(DIST, { recursive: true, force: true });
  await ensureDir(DIST);

  // copia assets (se existirem)
  const folders = ['images', 'cv', 'css', 'js'];
  for (const f of folders) {
    const src = path.join(SRC, f);
    try {
      const stat = await fs.stat(src);
      if (stat.isDirectory()) await copyDir(src, path.join(DIST, f));
    } catch { /* ignore */ }
  }

  // copia .htaccess (se existir)
  const ht = path.join(SRC, '.htaccess');
  try {
    await fs.copyFile(ht, path.join(DIST, '.htaccess'));
  } catch { /* ignore */ }

  // minifica HTML e reescreve refs
  await buildHTML();

  console.log('✓ Build HTML/CSS/JS finalizado em dist/');
}

main().catch((e) => {
  console.error('Build falhou:', e);
  process.exit(1);
});
