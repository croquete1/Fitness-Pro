// src/hooks/useAdminNotifications.jsx
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase.js'

export function useAdminNotifications() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNotifications() {
      setLoading(true)
      try {
        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('type', '==', 'registration'),
          where('read', '==', false)
        )
        const querySnapshot = await getDocs(notificationsQuery)
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        setRequests(docs)
      } catch (error) {
        console.error('Failed to load admin notifications:', error)
      } finally {
        setLoading(false)
      }
    }
    loadNotifications()
  }, [])

  return { requests, loading }
}
