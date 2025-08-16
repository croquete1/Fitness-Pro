// scripts/find-invalid-catchall.cjs
const fs = require("fs");
const path = require("path");

const ROOT = path.join(process.cwd(), "src", "app");

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) acc.push(p), walk(p, acc);
  }
  return acc;
}

function isCatchAll(seg) {
  return seg.startsWith("[...") || seg.startsWith("[[...");
}

function check() {
  if (!fs.existsSync(ROOT)) return;
  const dirs = walk(ROOT);
  const offenders = [];

  for (const d of dirs) {
    const parts = d.split(path.sep);
    const idx = parts.findIndex((p) => isCatchAll(p));
    if (idx !== -1) {
      // se existir algo depois do catch-all → inválido
      if (idx < parts.length - 1) offenders.push(d);
    }
  }

  if (offenders.length) {
    console.error("❌ Pastas catch-all com filhos (não permitido):");
    offenders.forEach((o) => console.error(" -", path.relative(process.cwd(), o)));
    process.exit(1);
  } else {
    console.log("✅ Sem catch-all inválidos.");
  }
}
check();
