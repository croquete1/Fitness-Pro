import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from './Theme';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Firebase Auth
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifica se o utilizador está autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null; // ou um spinner de carregamento

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config?.initialColorMode || 'light'} />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/" />}
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
