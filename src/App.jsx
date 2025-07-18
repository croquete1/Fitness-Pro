import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const DashboardCliente = lazy(() => import('./pages/DashboardCliente'));
const DashboardTrainer = lazy(() => import('./pages/DashboardTrainer'));
const DashboardAdmin = lazy(() => import('./pages/DashboardAdmin'));

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, 'users', u.uid));
        setRole(snap.exists() ? snap.data().role : '');
      } else {
        setUser(null);
        setRole('');
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
    <Suspense fallback={<div>Carregando...</div>}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={renderDashboard()} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}
