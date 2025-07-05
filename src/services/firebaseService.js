// src/services/firebaseService.js

import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { app } from '../firebase/firebase'

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

const listenToForegroundMessages = () => {
  onMessage(messaging, (payload) => {
    console.log('Mensagem recebida em foreground:', payload)
  })
}

export { requestPermission, listenToForegroundMessages }
