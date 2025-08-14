// scripts/verify-sidebar.cjs
/* Verifica se as páginas-chave da sidebar existem (evita 404 por ficheiros movidos) */
const fs = require("fs");
const path = require("path");

const mustExist = [
  "src/app/(app)/dashboard/page.tsx",
  "src/app/(app)/dashboard/sessions/page.tsx",
  "src/app/(app)/dashboard/messages/page.tsx",
  "src/app/(app)/dashboard/profile/page.tsx",
  "src/app/(app)/dashboard/billing/page.tsx",

  "src/app/(app)/dashboard/trainer/page.tsx",
  "src/app/(app)/dashboard/pt/clients/page.tsx",
  "src/app/(app)/dashboard/pt/plans/page.tsx",
  "src/app/(app)/dashboard/pt/library/page.tsx",

  "src/app/(app)/dashboard/admin/page.tsx",
  "src/app/(app)/dashboard/admin/approvals/page.tsx",
  "src/app/(app)/dashboard/admin/users/page.tsx",
  "src/app/(app)/dashboard/admin/roster/page.tsx",
  "src/app/(app)/dashboard/admin/exercises/page.tsx",
  "src/app/(app)/dashboard/admin/plans/page.tsx",
  "src/app/(app)/dashboard/reports/page.tsx",
  "src/app/(app)/dashboard/system/page.tsx",
  "src/app/(app)/dashboard/system/logs/page.tsx",
];

const missing = mustExist.filter(p => !fs.existsSync(path.resolve(p)));
if (missing.length) {
  console.error("❌ Páginas em falta (sidebar lock):");
  missing.forEach(m => console.error(" - " + m));
  process.exit(1);
} else {
  console.log("✅ Sidebar verificada (todas as páginas necessárias existem).");
}
