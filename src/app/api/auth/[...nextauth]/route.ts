// src/app/api/auth/[...nextauth]/route.ts — App Router
// Mantém apenas exports permitidos: GET/POST e opções suportadas
// Requer: src/lib/auth.ts a exportar `authOptions`

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Garantir ambiente Node (bcryptjs) e evitar cache/otimização estática
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
