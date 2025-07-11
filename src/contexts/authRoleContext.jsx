import { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const AuthRoleContext = createContext();

export const AuthRoleProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (usr) => {
      setUser(usr);
      if (usr) {
        const ref = doc(db, 'users', usr.uid);
        const snap = await getDoc(ref);
        setRole(snap.exists() ? snap.data().role : 'pending');
      } else {
        setRole(null);
      }
    });
    return () => unsub();
  }, []);

  return (
    <AuthRoleContext.Provider value={{ user, role }}>
      {children}
    </AuthRoleContext.Provider>
  );
};