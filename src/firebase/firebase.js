// src/firebase/firebase.js

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)
const messaging = getMessaging(app)

const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
      const token = await getToken(messaging, { vapidKey })
      console.log('Token gerado:', token)
    } else {
      console.log('Permissão negada para notificações.')
    }
  } catch (err) {
    console.error('Erro ao solicitar permissão:', err)
  }
}

onMessage(messaging, (payload) => {
  console.log('Mensagem recebida em foreground:', payload)
})

export { db, storage, requestPermission }
