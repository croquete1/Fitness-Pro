// src/firebase/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getMessaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyAcGGE37ZiTFcz8mo1pSECvDCDOXdzbSHY",
  authDomain: "fitness-pro-12345.firebaseapp.com",
  projectId: "fitness-pro-12345",
  storageBucket: "fitness-pro-12345.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
  measurementId: "G-1234567890"
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const messaging = getMessaging(app)
