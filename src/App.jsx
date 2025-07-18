// src/App.jsx

import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Flex, Spinner } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged }     from 'firebase/auth';
import { doc, getDoc }           from 'firebase/firestore';
import { auth, db }              from './firebase';

const Login            = lazy(() => import('./pages/Login'));
const Register         = lazy(() => import('./pages/Register'));
const DashboardCliente = lazy(() => import('./pages/DashboardCliente'));
const DashboardTrainer = lazy(() => import('./pages/DashboardTrainer'));
const DashboardAdmin   = lazy(() => import('./pages/DashboardAdmin'));

export default function App() {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      // Sempre que auth mudar, bloqueia a UI até o perfil ser lido
      setLoading(true);
      setUser(u);

      if (u) {
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          setProfile(snap.exists() ? snap.data() : null);
        } catch (err) {
          console.error('❌ Firestore getDoc error:', err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <Flex align="center" justify="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  const DashboardRouter = () => {
    if (!user) return <Navigate to="/" replace />;
    const role = profile?.role;
    if (role === 'admin')   return <DashboardAdmin user={user} profile={profile} />;
    if (role === 'trainer') return <DashboardTrainer user={user} profile={profile} />;
    if (role === 'cliente') return <DashboardCliente user={user} profile={profile} />;
    return <Navigate to="/" replace />;
  };

  return (
    <Suspense
      fallback={
        <Flex align="center" justify="center" minH="100vh">
          <Spinner size="lg" />
        </Flex>
      }
    >
      <Routes>
        <Route path="/"         element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
