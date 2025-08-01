// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

/**
 * This supabase client is used both by your NextAuth adapter
 * and (if you ever need it) by other server-side code.
 *
 * - NEXT_PUBLIC_SUPABASE_URL is safe to expose in the browser.
 * - SUPABASE_SERVICE_ROLE_KEY must be kept secret (use in server/runtime env only).
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)
