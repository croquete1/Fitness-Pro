// src/hooks/useAdminUsers.jsx
import { useState, useEffect } from 'react'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { db } from '../firebase.js'

export function useAdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'))
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const createUser = async data => {
    await addDoc(collection(db, 'users'), data)
    await fetchUsers()
  }

  const updateUser = async (id, changes) => {
    await updateDoc(doc(db, 'users', id), changes)
    await fetchUsers()
  }

  const deleteUser = async id => {
    await deleteDoc(doc(db, 'users', id))
    await fetchUsers()
  }

  return { users, loading, error, createUser, updateUser, deleteUser }
}
