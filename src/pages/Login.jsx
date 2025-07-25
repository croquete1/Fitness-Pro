// src/pages/Login.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
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
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} md={10} lg={8}>
            <CRow className="g-0 shadow rounded overflow-hidden">
              {/* Form de Login */}
              <CCol xs={12} md={6} className="bg-white p-5 d-flex">
                <div className="w-100">
                  <h1 className="fs-2 mb-3">Login</h1>
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
                        formControlSize="lg"
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
                        formControlSize="lg"
                      />
                    </CInputGroup>
                    <CRow className="align-items-center">
                      <CCol xs={6}>
                        <CButton
                          color="primary"
                          className="w-100 py-2"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? 'A carregar...' : 'Login'}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-end">
                        <Link className="fw-semibold" to="/register">
                          Registar-se
                        </Link>
                      </CCol>
                    </CRow>
                  </CForm>
                </div>
              </CCol>

              {/* CTA / Ilustração */}
              <CCol
                xs={0}
                md={6}
                className="d-none d-md-flex bg-primary text-white p-5 align-items-center justify-content-center"
                style={{
                  backgroundImage: 'url("/login-illustration.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="text-center">
                  <h2 className="fs-1 mb-3">Bem-vindo!</h2>
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
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}
