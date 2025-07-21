import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase.js'

export function useAdminSecurity() {
  const [alerts, setAlerts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function fetchSecurityLogs() {
      try {
        const q = query(
          collection(db, 'securityLogs'),
          orderBy('timestamp', 'desc'),
          limit(20),
        )
        const snap = await getDocs(q)
        setAlerts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSecurityLogs()
  }, [])

  return { alerts, loading, error }
}
