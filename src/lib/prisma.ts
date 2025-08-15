import { PrismaClient } from "@prisma/client";

declare global {
  // evita múltiplas instâncias em dev (hot reload)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClient = global.prisma ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prismaClient;
}

// podes usar de duas formas:
// import { prisma } from "@/lib/prisma"
// import prisma from "@/lib/prisma"
export const prisma = prismaClient;
export default prismaClient;
