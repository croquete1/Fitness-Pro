// src/hooks/useAdminActivity.jsx
import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase.js'

export function useAdminActivity() {
  const [activity, setActivity] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    async function fetchActivity() {
      try {
        const q = query(
          collection(db, 'activityLogs'),
          orderBy('timestamp', 'desc'),
          limit(20),
        )
        const snap = await getDocs(q)
        setActivity(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchActivity()
  }, [])

  return { activity, loading, error }
}
