// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth, db } from '../firebase.js'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  // ...
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log('⚙️ onAuthStateChanged → ', fbUser)
      if (fbUser) {
        const snap = await getDoc(doc(db, 'users', fbUser.uid))
        const data = snap.data() || {}
        console.log('📋 Firestore user data →', data)
        setUser({ uid: fbUser.uid, email: fbUser.email, role: data.role })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    const data = snap.data() || {}
    console.log('🔑 login() fetched role →', data.role)
    // devolve role ao componente que chamou
    return { role: data.role }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
