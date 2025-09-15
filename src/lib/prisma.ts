// src/lib/prisma.ts
/**
 * Prisma removido do projeto.
 * Este shim existe só para manter compatibilidade com imports antigos:
 *   import prisma from '@/lib/prisma'
 *   import { prisma } from '@/lib/prisma'
 *
 * Qualquer uso em runtime vai lançar um erro claro avisando para migrar para Supabase.
 * Recomenda-se correr: pnpm run find:prisma
 */

function boom(path: string): never {
  throw new Error(
    `[prisma-shim] Prisma está desativado. Encontrada tentativa de uso em "${path}".` +
      `\n➡️ Migra para Supabase (createServerClient/supabaseBrowser).`
  );
}

const prisma = new Proxy(
  {},
  {
    get(_t, prop) {
      // Aceder a qualquer propriedade (ex.: prisma.user) vai rebentar
      return new Proxy(() => undefined, {
        get() {
          return boom(String(prop));
        },
        apply() {
          return boom(String(prop));
        },
      });
    },
    apply() {
      return boom('call');
    },
  }
) as unknown as Record<string, any>;

export { prisma };
export default prisma;