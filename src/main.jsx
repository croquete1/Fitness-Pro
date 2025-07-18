import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider as ReduxProvider } from 'react-redux'
import { AuthProvider } from './contexts/AuthContext'
import store from './store'
import App from './App.jsx'
import '@coreui/coreui/dist/css/coreui.min.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ReduxProvider store={store}>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </ReduxProvider>,
)
