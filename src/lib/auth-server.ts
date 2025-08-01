// src/lib/auth-server.ts
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * Supabase client pre-configured for Server Components
 * (so you can call .auth.getSession() etc. on the server).
 */
export const supabaseServer = createServerComponentClient({ cookies });
