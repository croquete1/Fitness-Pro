// src/app/dashboard/client/page.tsx
'use client'

import { supabase } from '@/lib/supabaseClient'
import React, { useEffect, useState } from 'react'

type Client = {
  id: string
  nome: string
  // acrescenta os campos da tua tabela
}

export default function ClientDashboardPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!supabase) {
      setError('Supabase não configurado (env vars ausentes?)')
      return
    }

    supabase.from('clients')
      .select('*')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else if (data) setClients(data)
      })
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard Cliente</h1>
      {error && <p className="text-red-600">{error}</p>}
      {!error && clients.length === 0 && <p>Nenhum cliente registado.</p>}
      <ul>
        {clients.map(c => (
          <li key={c.id} className="py-1 border-b">{c.nome}</li>
        ))}
      </ul>
    </main>
  )
}
