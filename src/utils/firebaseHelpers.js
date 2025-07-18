// src/utils/firebaseHelpers.js

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Busca o documento `users/{uid}` e devolve os dados
 * @param {string} uid 
 * @returns {Promise<object|null>}
 */
export async function fetchUserProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error('fetchUserProfile error:', err);
    return null;
  }
}
