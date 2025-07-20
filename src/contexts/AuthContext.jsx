// src/contexts/AuthContext.jsx
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../firebase.js'

const AuthContext = createContext()
export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const auth = getAuth()
  const [user, setUser]     = useState(null)
  const [role, setRole]     = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  async function register(email, password, role) {
    const userCred = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', userCred.user.uid), {
      email,
      role,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
    await addDoc(collection(db, 'notifications'), {
      type: 'registration',
      userId: userCred.user.uid,
      email,
      role,
      timestamp: serverTimestamp(),
      read: false,
    })
    await sendEmailVerification(userCred.user)
    setRole(role)
    setStatus('pending')
    return userCred
  }

  // <--- devolve o role diretamente
  async function login(email, password) {
    const userCred = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, 'users', userCred.user.uid))
    const userRole = snap.exists() ? snap.data().role : null
    const userStatus = snap.exists() ? snap.data().status : null
    setRole(userRole)
    setStatus(userStatus)
    return { userCred, role: userRole, status: userStatus }
  }

  async function logout() {
    await signOut(auth)
    setRole(null)
    setStatus(null)
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid))
        if (snap.exists()) {
          setRole(snap.data().role)
          setStatus(snap.data().status)
        }
      }
      setLoading(false)
    })
    return unsub
  }, [auth])

  const value = { user, role, status, register, login, logout }
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
