// src/app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/[...nextauth]/route'
import Sidebar from '@/components/Sidebar'

export const metadata = {
  title: 'Fitness Pro',
  description: 'Gestão de treinos e administração',
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getServerSession({ cookies }, authOptions)

  return (
    <html lang="pt">
      <body className="flex min-h-screen">
        {session && (
          <aside className="w-64 border-r">
            <Sidebar role={(session.user as any).role} />
          </aside>
        )}
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  )
}
