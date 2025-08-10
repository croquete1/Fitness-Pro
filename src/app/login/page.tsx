import { Suspense } from 'react'
import LoginClient from './LoginClient'

// Garante que a página não tenta ser pré-renderizada estaticamente
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-sm text-gray-500">A carregar…</div>}>
        <LoginClient />
      </Suspense>
    </main>
  )
}
