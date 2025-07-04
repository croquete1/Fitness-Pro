import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase_config";

const AuthRoleContext = createContext();

export const AuthRoleProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), async currentUser => {
      if (currentUser) {
        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);
        const data = snap.exists() ? snap.data() : {};
        setUser(currentUser);
        setRole(data.role || "cliente");
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const isAdmin = role === "admin";
  const isTrainer = role === "trainer";
  const isCliente = role === "cliente";

  return (
    <AuthRoleContext.Provider value={{ user, role, isAdmin, isTrainer, isCliente, loading }}>
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = () => useContext(AuthRoleContext);
