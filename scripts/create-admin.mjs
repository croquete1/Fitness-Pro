#!/usr/bin/env node
import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const [,, email, password] = process.argv;
if (!email || !password) {
  console.error("Uso: node scripts/create-admin.mjs <email> <password>");
  process.exit(1);
}

const pwdHash = await hash(password, 10);

await prisma.user.upsert({
  where: { email: email.toLowerCase() },
  update: { role: Role.ADMIN, passwordHash: pwdHash },
  create: { email: email.toLowerCase(), role: Role.ADMIN, passwordHash: pwdHash },
});

console.log("Admin criado/atualizado:", email);
await prisma.$disconnect();
