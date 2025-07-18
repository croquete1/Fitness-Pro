// src/hooks/useAdminStats.js
import { useState, useEffect } from 'react'
import { db } from '../firebase'
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'

export function useAdminStats() {
  const [stats, setStats]       = useState(null)
  const [monthly, setMonthly]   = useState({ labels: [], data: [] })
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    async function load() {
      try {
        // 1. Total de users, trainers, sessões
        const usersSnap    = await getDocs(collection(db, 'users'))
        const trainersSnap = await getDocs(
          query(collection(db, 'users'), where('role', '==', 'trainer'))
        )
        const sessionsSnap = await getDocs(collection(db, 'sessions'))

        // 2. Estatísticas gerais
        setStats({
          usersCount:    usersSnap.size,
          trainersCount: trainersSnap.size,
          sessionsCount: sessionsSnap.size,
        })

        // 3. Dados de gráfico (exemplo: últimas 6 sessões mensais)
        const now    = new Date()
        const labels = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now)
          d.setMonth(now.getMonth() - (5 - i))
          return d.toLocaleString('default', { month: 'short' })
        })
        // Substituir por query real se tiveres collection de stats
        const data = labels.map(() => Math.floor(Math.random() * 50) + 10)
        setMonthly({ labels, data })
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { stats, monthly, loading, error }
}
