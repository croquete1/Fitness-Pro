// src/lib/db.ts
/**
 * Legacy entrypoint para "db".
 * Prisma foi desativado no projeto — usamos o shim de '@/lib/prisma'.
 * Mantemos este ficheiro só para compat de imports antigos:
 *   import { prisma } from '@/lib/db'
 *   import prisma from '@/lib/db'
 */

export { prisma } from './prisma';
export default prisma;