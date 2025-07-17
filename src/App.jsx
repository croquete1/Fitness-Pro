// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from './Theme';  // ajusta o caminho se necessário

// … as tuas páginas e lógica de auth …

function App() {
  // … login, estado do utilizador e renderDashboard …

  return (
    <ChakraProvider theme={theme}>
      {/* Injetar o script para modo claro/escuro */}
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      
      <Router>
        <Routes>
          {/* as tuas rotas: Login, Register, Home, Dashboard */}
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
