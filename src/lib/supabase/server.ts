// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * getSBC() — Supabase Server Client com suporte a cookies (SSR)
 * - Usa as variáveis públicas (anon) + cookies para sessão do utilizador
 * - Funciona em rotas App Router (Node/Edge) e mantém o login do NextAuth/Supabase
 */
export function getSBC() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase env vars em falta: NEXT_PUBLIC_SUPABASE_URL/ANON_KEY");
  }

  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Em rotas serverless, o Next pode não permitir set() em certas fases — fazemos try/catch
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            /* noop */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            /* noop */
          }
        },
      },
    }
  );
}
