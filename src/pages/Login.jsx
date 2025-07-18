// src/pages/Login.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth, db } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CFormLabel,
  CFormInput,
  CAlert,
  CButton,
  CSpinner,
} from '@coreui/react'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('🔥 handleSubmit triggered')
    setError('')
    setLoading(true)

    try {
      console.log('– attempt login:', { email, password })
      const { user } = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      )

      console.log('✅ login success:', user.uid)
      // busca a role no Firestore
      const snap = await getDoc(doc(db, 'users', user.uid))
      const role = snap.exists() ? snap.data().role : null
      console.log('🔎 user role:', role)

      // condicional de navegação
      if (role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      console.error('❌ login error:', err.code, err.message)
      setError(
        err.code === 'auth/user-not-found'
          ? 'Utilizador não registado'
          : err.code === 'auth/wrong-password'
          ? 'Password incorreta'
          : 'Erro no início de sessão'
      )
    } finally {
      console.log('🏁 handleSubmit end')
      setLoading(false)
    }
  }

  return (
    <CContainer className="vh-100 d-flex justify-content-center align-items-center">
      <CRow className="w-100 justify-content-center">
        <CCol xs={12} sm={8} md={6} lg={4}>
          <CCard className="p-4">
            <CCardBody>
              <h2 className="text-center mb-4">Entrar</h2>

              {error && <CAlert color="danger">{error}</CAlert>}

              <form onSubmit={handleSubmit}>
                <CFormLabel htmlFor="login-email">Email</CFormLabel>
                <CFormInput
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <CFormLabel htmlFor="login-password" className="mt-3">
                  Password
                </CFormLabel>
                <CFormInput
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <CButton
                  type="submit"
                  color="primary"
                  className="w-100 mt-4"
                  disabled={loading}
                >
                  {loading ? <CSpinner size="sm" /> : 'Entrar'}
                </CButton>
              </form>

              <div className="text-center mt-3">
                <Link to="/register">Ainda não tens conta? Regista-te</Link>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}
