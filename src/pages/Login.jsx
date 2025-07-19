import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CForm,
  CFormInput,
  CSpinner,
} from '@coreui/react'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <CCard style={{ width: '24rem' }}>
        <CCardBody>
          <h3 className="mb-4">Login</h3>
          {error && <div className="text-danger mb-3">{error}</div>}
          <CForm onSubmit={handleSubmit}>
            <CFormInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mb-3"
            />
            <CFormInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mb-3"
            />
            <CButton
              type="submit"
              color="primary"
              className="w-100"
              disabled={loading}
            >
              {loading ? <CSpinner size="sm" /> : 'Entrar'}
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}
