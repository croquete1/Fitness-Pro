
// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAcGGE37ZiTFcz8mo1pSECvDCDOXdzbSHY",
  authDomain: "fitnesspro-36d8b.firebaseapp.com",
  projectId: "fitnesspro-36d8b",
  storageBucket: "fitnesspro-36d8b.appspot.com",
  messagingSenderId: "881881913799",
  appId: "1:881881913799:web:08399068acd96e83f0e1e2",
  measurementId: "G-G3XJ0741CW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

export { auth, db, messaging, getToken, onMessage };
