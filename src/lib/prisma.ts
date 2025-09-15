// src/lib/prisma.ts
/**
 * Prisma SHIM (desativado).
 * Evita que código legado com "prisma" compile silenciosamente.
 * Se alguma chamada a "prisma" for feita em runtime, lança um erro claro.
 */

type AnyFn = (...args: any[]) => any;

function boom(method: string): never {
  throw new Error(
    `[prisma-shim] Prisma está desativado. Chamaste "${method}".` +
      `\n➡️ Migra para Supabase (createServerClient/supabaseBrowser).`
  );
}

const prisma = new Proxy<Record<string, any>>(Object.create(null), {
  get(_target, prop) {
    // devolve um "callable" que rebenta em qualquer operação
    return new Proxy(function () {} as AnyFn, {
      get()        { return boom(String(prop)); },
      apply()      { return boom(String(prop)); },
      construct()  { return boom(String(prop)); },
    });
  },
  apply() { return boom('call'); },
}) as unknown as Record<string, any>;

export { prisma };
export default prisma;