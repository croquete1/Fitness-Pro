// src/hooks/useAdminStats.jsx
import { useState, useEffect } from 'react'
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase.js'

export function useAdminStats() {
  const [stats, setStats] = useState({
    usersCount: 0,
    trainersCount: 0,
    sessionsCount: 0,
    pendingCount: 0,
  })
  const [monthly, setMonthly] = useState({ labels: [], data: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Total users & trainers
        const usersSnap = await getDocs(collection(db, 'users'))
        const users = usersSnap.docs.map(d => d.data())
        const trainersCount = users.filter(u => u.role === 'trainer').length

        // Total sessions
        const sessionsSnap = await getDocs(collection(db, 'sessions'))
        const sessionsCount = sessionsSnap.size

        // Pending registrations
        const pendingSnap = await getDocs(
          query(collection(db, 'users'), orderBy('status'), limit(1))
        )
        const pendingCount = users.filter(u => u.status === 'pending').length

        // Monthly sessions (last 6 months)
        const now = new Date()
        const months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          return d.toLocaleString('default', { month: 'short' })
        }).reverse()
        const monthCounts = months.map((m, i) =>
          sessionsSnap.docs.filter(doc => {
            const d = doc.data().date.toDate()
            return d.getMonth() === (now.getMonth() - (5 - i) + 12) % 12
          }).length
        )

        setStats({
          usersCount: users.length,
          trainersCount,
          sessionsCount,
          pendingCount,
        })
        setMonthly({ labels: months, data: monthCounts })
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return { stats, monthly, loading, error }
}
