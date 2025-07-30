// src/app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import Sidebar from '@/components/Sidebar'

export const metadata = {
  title: 'Fitness Pro',
  description: 'Gestão de treinos e administração',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt">
      <body className="flex h-screen bg-gray-100">
        <AuthProvider>
          <Sidebar />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
