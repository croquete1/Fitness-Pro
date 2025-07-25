// src/pages/Login.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CContainer,
  CRow,
  CCol,
  CAlert,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilLockLocked } from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const { login }               = useAuth()
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { role } = await login(email, password)
      if (role === 'admin') navigate('/admin', { replace: true })
      else if (role === 'trainer') navigate('/trainer', { replace: true })
      else navigate('/dashboard', { replace: true })
    } catch {
      setError('Falha no login: verifique as credenciais')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CContainer
      fluid
      className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
    >
      <CRow
        className="g-0 shadow-lg rounded overflow-hidden"
        style={{ maxWidth: '900px', width: '100%' }}
      >
        {/* Login Form */}
        <CCol xs={12} md={6} className="bg-white p-5">
          <h1 className="fs-3 mb-3">Login</h1>
          <p className="text-medium-emphasis mb-4">
            Entre na sua conta
          </p>
          {error && <CAlert color="danger">{error}</CAlert>}
          <CForm onSubmit={handleSubmit}>
            <CInputGroup className="mb-3">
              <CInputGroupText>
                <CIcon icon={cilUser} />
              </CInputGroupText>
              <CFormInput
                type="email"
                placeholder="Email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="lg"
              />
            </CInputGroup>
            <CInputGroup className="mb-4">
              <CInputGroupText>
                <CIcon icon={cilLockLocked} />
              </CInputGroupText>
              <CFormInput
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="lg"
              />
            </CInputGroup>
            <CButton
              color="primary"
              className="w-100 py-2 mb-3"
              type="submit"
              disabled={loading}
            >
              {loading ? 'A carregar...' : 'Login'}
            </CButton>
            <div className="text-center">
              <Link to="/register">Registar-se</Link>
            </div>
          </CForm>
        </CCol>

        {/* CTA / Ilustração */}
        <CCol
          xs={0}
          md={6}
          className="d-none d-md-flex bg-primary text-white p-5 align-items-center justify-content-center"
        >
          <div className="text-center">
            <h2 className="fs-2 mb-3">Bem-vindo!</h2>
            <p className="fs-5 mb-4 px-3">
              Crie a sua conta para aceder a todas as funcionalidades.
            </p>
            <Link to="/register">
              <CButton color="light" className="px-4 py-2">
                Registar
              </CButton>
            </Link>
          </div>
        </CCol>
      </CRow>
    </CContainer>
  )
}
