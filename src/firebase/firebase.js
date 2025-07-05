// src/firebase/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getMessaging, getToken } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_BUCKET',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const messaging = getMessaging(app)

export const requestPermission = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: 'BEuqb32wN3ejoAhAQ16k-wVzGUDBXifRD3pZ_n0-jhzS-22_Kyncspp2LxvWs-oayDr7neNEhXJN7w58RJti0b0'
    })
    console.log('🔐 Token FCM:', token)
    return token
  } catch (err) {
    console.error('🔒 Falha ao obter token de notificação:', err)
    return null
  }
}
