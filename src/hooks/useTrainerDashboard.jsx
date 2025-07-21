// src/hooks/useTrainerDashboard.jsx
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../contexts/AuthContext.jsx'

export function useTrainerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    clientsCount: 0,
    upcomingSessions: 0,
    revenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!user) return
    async function fetchStats() {
      try {
        const clientsQ = query(
          collection(db, 'users'),
          where('role', '==', 'client'),
          where('trainerId', '==', user.uid),
        )
        const clientsSnap = await getDocs(clientsQ)

        const sessionsQ = query(
          collection(db, 'sessions'),
          where('trainerId', '==', user.uid),
        )
        const sessionsSnap = await getDocs(sessionsQ)
        const allSessions = sessionsSnap.docs.map((d) => d.data())
        const upcoming = allSessions.filter((s) => s.date.toDate() > new Date()).length
        const revenue  = allSessions.reduce((sum, s) => sum + (s.fee || 0), 0)

        setStats({
          clientsCount: clientsSnap.size,
          upcomingSessions: upcoming,
          revenue,
        })
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [user])

  return { stats, loading, error }
}
