// src/lib/supabaseAdmin.ts
// Compatibilidade: reexporta o cliente server do Supabase sem inicialização eagler.
export { supabaseAdmin } from '@/lib/supabaseServer';
export { createServerClient, getSupabaseServer, MissingSupabaseEnvError } from '@/lib/supabaseServer';
