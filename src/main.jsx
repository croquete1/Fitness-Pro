""// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

import { AuthRoleProvider } from './contexts/authRoleContext'
import { onMessageListener, requestPermission } from './services/chatService'
import { messaging } from './firebase/firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from './firebase/firebase'

const root = document.getElementById('root')

requestPermission(messaging)
  .then((token) => {
    if (!token) return
    const auth = getAuth()
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tokenRef = doc(db, 'users', user.uid)
        const snapshot = await getDoc(tokenRef)
        const existingData = snapshot.exists() ? snapshot.data() : {}

        if (existingData.messagingToken !== token) {
          await setDoc(tokenRef, { messagingToken: token }, { merge: true })
        }
      }
    })
  })
  .catch((err) => console.error('FCM permission error:', err))

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
