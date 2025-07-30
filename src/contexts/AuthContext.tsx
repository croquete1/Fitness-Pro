// src/contexts/AuthContext.tsx
'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

type Role = 'client' | 'trainer' | 'admin' | null

interface AuthContextType {
  user: { email: string; role: Role } | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string; role: Role } | null>(null)

  const login = async (email: string, password: string) => {
    // TODO: substitua pela sua lógica real de autenticação
    // por enquanto, simulamos:
    const simulatedRole: Role = email.includes('admin')
      ? 'admin'
      : email.includes('trainer')
      ? 'trainer'
      : 'client'
    setUser({ email, role: simulatedRole })
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
