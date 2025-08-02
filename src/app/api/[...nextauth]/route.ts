// src/app/api/auth/[...nextauth]/route.ts

//----------------------------------------
// 🧩 Rota do NextAuth para o App Router
// Importa o NextAuth do sub módulo correto para evitar conflitos de tipagem
import NextAuth from "next-auth/next"

// Importa as opções de autenticação definidas por ti
import { authOptions } from "@/lib/authOptions"

// Cria o handler com base nas opções fornecidas
const handler = NextAuth(authOptions)

// Exporta GET e POST para permitir que o Next.js
// utilize esta rota como entry point autenticado.
// Isto é o padrão oficial para integração com App Router 👇
// export { handler as GET, handler as POST }
export { handler as GET, handler as POST }
