// src/lib/auth.ts
import { supabaseServer } from "./auth-server";
import type { NextAuthOptions } from "next-auth"
import { authOptions } from "@/app/api/[...nextauth]/route"
/**
 * Fetch the current session on the server.
 * Returns `Session | null`.
 */
export async function getAuthSession() {
  const {
    data: { session },
  } = await supabaseServer.auth.getSession();
  return session;
}
