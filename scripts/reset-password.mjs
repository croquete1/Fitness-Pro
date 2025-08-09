#!/usr/bin/env node
// scripts/reset-password.mjs
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.argv[2] || "").toLowerCase().trim();
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error("Uso: node scripts/reset-password.mjs <email> <nova-password>");
    process.exit(1);
  }
  if (newPassword.length < 8 || newPassword.length > 72) {
    console.error("A password deve ter entre 8 e 72 caracteres.");
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) {
      console.error(`Não existe utilizador com o email ${email}.`);
      process.exit(2);
    }

    const rounds = process.env.NODE_ENV === "development" ? 8 : 12; // ← 8 em dev
    const passwordHash = await hash(newPassword, rounds);

    await prisma.user.update({ where: { email }, data: { passwordHash } });
    console.log(`OK: password atualizada para ${email}.`);
    process.exit(0);
  } catch (err) {
    console.error("Erro ao alterar password:", err?.message || err);
    process.exit(3);
  } finally {
    await prisma.$disconnect();
  }
}
main();
