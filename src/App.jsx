import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { ColorModeScript } from '@chakra-ui/color-mode';
import theme from './Theme';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Lazy-loaded pages
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
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const snap = await getDoc(doc(db, 'users', currentUser.uid));
          setRole(snap.exists() ? snap.data().role : null);
        } catch (err) {
          console.error('Erro ao buscar role:', err);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  const renderDashboard = () => {
    if (!user) return <Navigate to="/" />;
    switch (role) {
      case 'cliente':
        return <DashboardCliente user={user} />;
      case 'trainer':
        return <DashboardTrainer user={user} />;
      case 'admin':
        return <DashboardAdmin user={user} />;
      default:
        return <Navigate to="/" />;
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Router>
        <Suspense fallback={<div>Carregando...</div>}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="/dashboard"
              element={user ? renderDashboard() : <Navigate to="/" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Router>
    </ChakraProvider>
  );
}
