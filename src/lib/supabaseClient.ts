// src/lib/supabaseClient.ts

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Evita que o módulo falhe no build quando as env vars não estiverem presentes
// (ex: Vercel preview antes de re–deploy após as var serem adicionadas)
let supabase: SupabaseClient<any, "public", any> | undefined = undefined

if (!url || !key) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Supabase公共环境变量未定义。NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY 是必须的。')
  }
  console.warn('[supabase] Variáveis ausentes — supabase não está inicializado.')
} else {
  supabase = createClient(url, key)
}

export { supabase }
export type { SupabaseClient }
