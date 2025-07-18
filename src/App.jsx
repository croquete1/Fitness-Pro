// src/App.jsx

import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const DashboardCliente = lazy(() => import('./pages/DashboardCliente'));
const DashboardTrainer = lazy(() => import('./pages/DashboardTrainer'));
const DashboardAdmin = lazy(() => import('./pages/DashboardAdmin'));

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (cur) => {
      if (cur) {
        setUser(cur);
        const snap = await getDoc(doc(db, 'users', cur.uid));
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
    if (role === 'admin') return <DashboardAdmin user={user} />;
    return <Navigate to="/" />;
  };

  return (
    <Router>
      <Suspense fallback={<div>Carregando...</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={renderDashboard()} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
