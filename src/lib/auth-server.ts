// src/lib/auth-server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Retorna instância do supabase no contexto do SSR
export function supabaseServer() {
  return createServerComponentClient({ cookies })
}
