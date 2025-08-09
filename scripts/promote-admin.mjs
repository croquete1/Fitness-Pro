#!/usr/bin/env node
// scripts/promote-admin.mjs
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = (process.argv[2] || "").toLowerCase().trim();
  if (!email) {
    console.error("Uso: node scripts/promote-admin.mjs <email>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user) {
      console.error(`Não existe utilizador com o email ${email}.`);
      process.exit(2);
    }

    if (user.role === "admin") {
      console.log(`Utilizador ${email} já é admin.`);
      process.exit(0);
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { role: "admin" }, // Prisma faz o cast para o enum "Role"
      select: { id: true, email: true, role: true },
    });

    console.log(`OK: ${updated.email} promovido(a) para ${updated.role}.`);
    process.exit(0);
  } catch (err) {
    console.error("Erro ao promover admin:", err?.message || err);
    process.exit(3);
  } finally {
    await prisma.$disconnect();
  }
}

main();
