// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next"
import { authOptions } from "@/lib/authOptions"

// Note: we only export the HTTP methods—no named export for authOptions here
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
