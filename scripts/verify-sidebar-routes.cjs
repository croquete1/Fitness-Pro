/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SIDEBARS = [
  'src/components/layout/SidebarAdmin.tsx',
  'src/components/layout/SidebarPT.tsx',
  'src/components/layout/SidebarClient.tsx',
];

function extractHrefs(code) {
  const hrefs = new Set();
  // padrões básicos: href: '/...'
  const reObj = /href:\s*['"]([^'"]+)['"]/g;
  const reProp = /href=\{?['"]([^'"]+)['"]\}?/g;
  let m;
  while ((m = reObj.exec(code))) hrefs.add(m[1]);
  while ((m = reProp.exec(code))) hrefs.add(m[1]);
  return [...hrefs].filter((h) => h.startsWith('/')); // apenas internos
}

function pageExistsFor(href) {
  // Normaliza: '/dashboard/admin/pts-schedule' -> 'src/app/(app)/dashboard/admin/pts-schedule/page.tsx'
  const rel = href.replace(/^\/+/, ''); // remove leading slash
  const candidates = [
    path.join(ROOT, 'src', 'app', '(app)', rel, 'page.tsx'),
    path.join(ROOT, 'src', 'app', '(app)', rel, 'page.jsx'),
    path.join(ROOT, 'src', 'app', rel, 'page.tsx'),
    path.join(ROOT, 'src', 'app', rel, 'page.jsx'),
  ];
  return candidates.some((p) => fs.existsSync(p));
}

function main() {
  const missing = [];
  for (const file of SIDEBARS) {
    const abs = path.join(ROOT, file);
    if (!fs.existsSync(abs)) {
      console.warn(`[verify-sidebar] Ignorado: ${file} (não existe)`);
      continue;
    }
    const code = fs.readFileSync(abs, 'utf8');
    const hrefs = extractHrefs(code);

    for (const href of hrefs) {
      // ignorar âncoras, externos, API, e páginas especiais
      if (href.startsWith('http') || href.startsWith('/api') || href === '/' ) continue;

      if (!pageExistsFor(href)) {
        missing.push({ href, from: file });
      }
    }
  }

  if (missing.length) {
    console.error('\n[verify-sidebar] Rotas sem página correspondente:');
    for (const m of missing) {
      console.error(`  - ${m.href}  (referenciada em ${m.from})`);
    }
    console.error('\nCria as páginas acima ou corrige os href no sidebar.');
    process.exit(1);
  } else {
    console.log('[verify-sidebar] OK — todas as rotas têm página.');
  }
}

main();
