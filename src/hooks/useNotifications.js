// src/hooks/useNotifications.js
import { useState, useEffect } from 'react'
import { db } from '../firebase.js'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext.jsx'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!user) return
    async function load() {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid)
      )
      const snap = await getDocs(q)
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }
    load()
  }, [user])

  return { notifications }
}
