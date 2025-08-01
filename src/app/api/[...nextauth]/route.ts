// src/app/api/[...nextauth]/route.ts
import NextAuth from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Cria o handler único do NextAuth
const handler = NextAuth(authOptions)

// Exporta apenas os métodos HTTP válidos
export { handler as GET, handler as POST }
