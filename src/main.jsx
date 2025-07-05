// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { AuthRoleProvider } from './contexts/authRoleContext'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthRoleProvider>
        <App />
      </AuthRoleProvider>
    </BrowserRouter>
  </React.StrictMode>
)
