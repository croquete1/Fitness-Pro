// Shim: permite compilar enquanto migras tudo para Supabase.
// Se algum código ainda tentar USAR .user/.session etc, lança erro claro a runtime.
export const prisma = new Proxy(
  {},
  {
    get() {
      throw new Error(
        'Prisma foi descontinuado neste projeto. Usa Supabase (createServerClient/createBrowserClient).'
      );
    },
  }
) as unknown as Record<string, never>;
export default prisma;
