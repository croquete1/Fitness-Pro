// src/App.jsx
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react'; // sem ColorModeScript aqui
import theme from './Theme';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// lazy-loaded pages
const Login = lazy(() => import('./pages/Login'));
// ... resto das pages

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, 'users', u.uid));
        setRole(snap.exists() ? snap.data().role : null);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null;

  const renderDashboard = () => {
    if (!user) return <Navigate to="/" />;
    if (role === 'cliente') return <DashboardCliente user={user} />;
    if (role === 'trainer') return <DashboardTrainer user={user} />;
    if (role === 'admin')   return <DashboardAdmin user={user} />;
    return <Navigate to="/" />;
  };

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Suspense fallback={<div>Carregando…</div>}>
          <Routes>
            <Route path="/" element={<Login />} />
            {/* ... outras rotas */}
            <Route path="/dashboard" element={user ? renderDashboard() : <Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Router>
    </ChakraProvider>
  );
}
