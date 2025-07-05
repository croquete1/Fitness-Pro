// src/firebase/index.js

import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAcGGE37ZiTFcz8mo1pSECvDCDOXdzbSHY",
  authDomain: "fitness-pro-12345.firebaseapp.com",
  projectId: "fitness-pro-12345",
  storageBucket: "fitness-pro-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnopqrstuvwxyz"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
