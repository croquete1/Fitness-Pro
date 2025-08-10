// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Mantemos Node (Prisma) e pedimos DCs europeus:
export const runtime = "nodejs";
export const preferredRegion = ["fra1", "cdg1", "arn1"]; // Frankfurt, Paris, Estocolmo

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
