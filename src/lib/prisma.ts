// src/lib/prisma.ts
function boom(path: string): never {
  throw new Error(
    `[prisma-shim] Prisma está desativado. Uso detectado em "${path}".` +
      `\n➡️ Migra para Supabase (createServerClient/supabaseBrowser).`
  );
}

const prisma = new Proxy(
  {},
  {
    get(_t, prop) =>
      new Proxy(() => undefined, {
        get() { return boom(String(prop)); },
        apply() { return boom(String(prop)); },
      }),
    apply() { return boom('call'); },
  }
) as unknown as Record<string, any>;

export { prisma };
export default prisma;