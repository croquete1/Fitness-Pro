// src/app/layout.tsx
import "./globals.css"
import { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"    // as tuas options de NextAuth
import Sidebar from "@/components/Sidebar"

export const metadata = {
  title: "Fitness Pro",
  description: "Gestão de treinos e administração",
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  // obter sessão no servidor
  const session = await getServerSession(authOptions)
  const isAuthenticated = !!session?.user

  return (
    <html lang="pt">
      <body className="flex min-h-screen">
        {/* somente mostra a sidebar se estiver logado */}
        {isAuthenticated && (
          <aside className="w-64 border-r border-gray-200">
            <Sidebar />
          </aside>
        )}
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  )
}
