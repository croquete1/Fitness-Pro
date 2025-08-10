// scripts/check-duplicate-routes.cjs
// Verifica páginas duplicadas que resolvem para a mesma rota no App Router
// Funciona com "type": "module" graças à extensão .cjs

const fs = require("fs");
const path = require("path");

const APP_DIR = path.join(process.cwd(), "src", "app");

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, files);
    else if (e.isFile() && (e.name === "page.tsx" || e.name === "page.ts")) files.push(full);
  }
  return files;
}

function normalizeRouteFromFile(file) {
  // file: /abs/.../src/app/(group)/dashboard/page.tsx
  // -> rel: (group)/dashboard
  const rel = path.relative(APP_DIR, path.dirname(file)).split(path.sep);
  // Remove route groups: segments entre () não contam
  const cleaned = rel.filter((seg) => !(seg.startsWith("(") && seg.endsWith(")")));
  // Rota raiz se vazio
  const route = "/" + cleaned.join("/");
  return route === "/" ? "/" : route.replace(/\\+/g, "/");
}

function main() {
  if (!fs.existsSync(APP_DIR)) {
    console.log("ℹ️ Pasta src/app não encontrada — a verificação foi ignorada.");
    return;
  }

  const pages = walk(APP_DIR);
  const map = new Map();

  for (const f of pages) {
    const route = normalizeRouteFromFile(f);
    if (!map.has(route)) map.set(route, []);
    map.get(route).push(f);
  }

  let hasError = false;
  for (const [route, files] of map.entries()) {
    if (files.length > 1) {
      console.error(`❌ Rota duplicada: "${route}" é servida por múltiplos ficheiros:`);
      for (const f of files) console.error("   - " + f);
      hasError = true;
    }
  }

  if (hasError) process.exit(1);
  console.log("✅ Nenhuma rota duplicada encontrada.");
}

main();