
// src/services/notificationService.js
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const saveNotificationToken = async (uid, token) => {
  if (!uid || !token) return;
  try {
    await setDoc(doc(db, "notificationTokens", uid), {
      token,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao guardar token de notificação:", error);
  }
};
