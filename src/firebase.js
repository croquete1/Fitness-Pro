// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAcGGE37ZiTFcz8mo1pSECvDCDOXdzbSHY",
  authDomain: "fitnesspro-36d8b.firebaseapp.com",
  projectId: "fitnesspro-36d8b",
  storageBucket: "fitnesspro-36d8b.firebasestorage.app",
  messagingSenderId: "881881913799",
  appId: "1:881881913799:web:08399068acd96e83f0e1e2",
  measurementId: "G-G3XJ0741CW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
