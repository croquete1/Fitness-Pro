// src/main.jsx
// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

import { AuthRoleProvider } from './contexts/authRoleContext'
import { onMessageListener, requestPermission } from './services/chatService'
import { messaging } from './firebase/firebase'

const root = document.getElementById('root')

requestPermission(messaging)
onMessageListener()

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthRoleProvider>
        <App />
      </AuthRoleProvider>
    </BrowserRouter>
  </React.StrictMode>
)
