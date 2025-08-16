// Falha a build se o enum Status no schema não tiver ACTIVE
const fs = require("fs");
const s = fs.readFileSync("prisma/schema.prisma", "utf8");
const block = s.match(/enum\s+Status\s*\{([\s\S]*?)\}/);
if (!block) {
  console.error("❌ enum Status não encontrado no prisma/schema.prisma");
  process.exit(1);
}
const body = block[1];
const must = ["PENDING", "ACTIVE", "SUSPENDED"];
const missing = must.filter(v => !new RegExp(`\\b${v}\\b`).test(body));
if (missing.length) {
  console.error("❌ enum Status inválido. Faltam:", missing.join(", "));
  process.exit(1);
}
console.log("✅ enum Status OK (PENDING, ACTIVE, SUSPENDED)");
