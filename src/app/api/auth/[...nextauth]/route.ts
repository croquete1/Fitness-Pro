// src/app/api/auth/[...nextauth]/route.ts — App Router
// Mantém apenas exports permitidos: GET/POST + opções suportadas
// Usa import DEFAULT de src/lib/auth para evitar qualquer re‑export acidental

import NextAuth from "next-auth";
import authOptions from "@/lib/auth"; // <- default import

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
