// scripts/create-admin.mjs
// Uso: node scripts/create-admin.mjs "admin@dominio.com" "UmaPasswordForte123!" "Nome Opcional"

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function hasColumn(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    `
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
    LIMIT 1
    `,
    table,
    column
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function main() {
  const [email, password, name = "Admin"] = process.argv.slice(2);
  if (!email || !password) {
    console.error("Uso: node scripts/create-admin.mjs <email> <password> [name]");
    process.exit(1);
  }

  const lower = email.toLowerCase();

  // Verifica se já existe (seleciona só o id para não depender de colunas em falta)
  const exists = await prisma.user.findUnique({
    where: { email: lower },
    select: { id: true },
  });
  if (exists) {
    console.error(
      `Já existe um utilizador com o email ${lower}. ` +
      `Use scripts/promote-admin.mjs para promover ou scripts/reset-password.mjs para mudar a password.`
    );
    process.exit(1);
  }

  const passwordHash = await hash(password, 12);

  // Deteta se a coluna "name" existe
  const hasName = await hasColumn("users", "name");

  const data = {
    email: lower,
    passwordHash,
    role: "admin",
    ...(hasName ? { name } : {}),
  };

  const user = await prisma.user.create({
    data,
    select: { id: true, email: true, role: true, name: true },
  });

  console.log("OK: criado admin:", user);
}

main()
  .catch((e) => {
    console.error("Erro:", e?.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
