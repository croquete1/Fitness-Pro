const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const manifestPath = path.join(ROOT, "project.manifest.json");

if (!fs.existsSync(manifestPath)) {
  console.error("❌ project.manifest.json não encontrado na raiz do projeto.");
  process.exit(1);
}

/** @type {{required: string[]; optional: string[]; forbiddenDuplicates: string[][]}} */
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

function exists(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p);
}

let hasError = false;

console.log("\n🔎 Verificação de ficheiros segundo project.manifest.json\n");

// 1) Required
console.log("1) Obrigatórios:");
for (const rel of manifest.required) {
  if (exists(rel)) console.log("   ✅", rel);
  else {
    console.error("   ❌ FALTA:", rel);
    hasError = true;
  }
}

// 2) Optional
console.log("\n2) Opcionais (informativo):");
for (const rel of manifest.optional) {
  if (exists(rel)) console.log("   ☑︎ existe:", rel);
  else console.log("   ☐ em falta (opcional):", rel);
}

// 3) Duplicados proibidos
console.log("\n3) Duplicados proibidos:");
for (const pair of manifest.forbiddenDuplicates) {
  const [a, b] = pair;
  const aExists = exists(a);
  const bExists = exists(b);
  if (aExists && bExists) {
    console.error("   ❌ Duplicado:", a, "<->", b);
    hasError = true;
  } else {
    console.log("   ✅ OK:", a, "<->", b);
  }
}

// 4) Validação específica do NextAuth: nome da pasta deve ser `[...nextauth]`
console.log("\n4) NextAuth route:");
const authApiDir = path.join(ROOT, "src", "app", "api", "auth");
if (!fs.existsSync(authApiDir)) {
  console.error("   ❌ Pasta src/app/api/auth não encontrada.");
  hasError = true;
} else {
  const entries = fs.readdirSync(authApiDir, { withFileTypes: true });
  const brackets = entries.filter((e) => e.isDirectory() && e.name.startsWith("[") && e.name.endsWith("]"));
  const hasCorrect = brackets.some((e) => e.name === "[...nextauth]");
  if (!hasCorrect) {
    console.error("   ❌ Pasta de rota do NextAuth incorreta. Esperado: src/app/api/auth/[...nextauth]/route.ts");
    if (brackets.length) console.error("      Encontradas:", brackets.map((e) => e.name).join(", "));
    hasError = true;
  } else {
    console.log("   ✅ Encontrado: src/app/api/auth/[...nextauth]/route.ts");
  }
}

// Saída final
if (hasError) {
  console.error("\n❌ Verificação falhou. Corrija os pontos acima.");
  process.exit(1);
}

console.log("\n✅ Verificação concluída sem erros.\n");