// src/lib/db.ts
/**
 * Compat layer para "db".
 * Prisma foi desativado; este ficheiro apenas reexporta o shim de '@/lib/prisma'.
 */

import prisma from './prisma';
export { prisma };
export default prisma;