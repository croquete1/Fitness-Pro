// src/lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!; // ⚠️ não expor no client

export const supabaseAdmin = createClient(url, service, {
  auth: { persistSession: false },
});
