#!/usr/bin/env node
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const [,, email] = process.argv;
if (!email) {
  console.error("Uso: node scripts/promote-admin.mjs <email>");
  process.exit(1);
}

await prisma.user.update({
  where: { email: email.toLowerCase() },
  data: { role: Role.ADMIN },
});

console.log("Utilizador promovido a ADMIN:", email);
await prisma.$disconnect();
