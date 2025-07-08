// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

import { AuthRoleProvider } from './contexts/authRoleContext'
import { onMessageListener, requestPermission } from './services/chatService'
import { messaging } from './firebase/firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { db } from './firebase/firebase'

const root = document.getElementById('root')

const syncFCMToken = async () => {
  try {
    const token = await requestPermission(messaging)
    if (!token) return

    const auth = getAuth()
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tokenRef = doc(db, 'users', user.uid)
        await setDoc(tokenRef, { messagingToken: token }, { merge: true })
      }
    })
  } catch (err) {
    console.error('FCM permission error:', err)
  }
}

syncFCMToken()

onMessageListener()

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthRoleProvider>
        <App />
      </AuthRoleProvider>
    </BrowserRouter>
  </React.StrictMode>
)
