// src/pages/Register.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth, db } from '../firebase'
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CAlert,
  CSpinner,
} from '@coreui/react'

export default function Register() {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [displayName, setDisplay] = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const navigate                  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Cria o utilizador no Authentication
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      )

      // 2. Atualiza o profile do Firebase Auth
      await updateProfile(userCred.user, {
        displayName: displayName.trim(),
      })

      // 3. Cria/atualiza o documento no Firestore
      await setDoc(doc(db, 'users', userCred.user.uid), {
        uid:         userCred.user.uid,
        email:       userCred.user.email,
        displayName: displayName.trim(),
        role:        'client',            // ou 'trainer'/'admin'
        createdAt:   serverTimestamp(),
      })

      // 4. Redireciona para o login
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Register error:', err.code, err.message)
      setError('Não foi possível registar. ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CContainer className="vh-100 d-flex justify-content-center align-items-center">
      <CRow className="w-100 justify-content-center">
        <CCol xs={12} sm={8} md={6} lg={4}>
          <CCard className="p-4">
            <CCardBody>
              <h2 className="text-center mb-4">Registar</h2>

              {error && <CAlert color="danger">{error}</CAlert>}

              <CForm onSubmit={handleSubmit}>
                <CFormLabel htmlFor="register-name">Nome</CFormLabel>
                <CFormInput
                  id="register-name"
                  type="text"
                  value={displayName}
                  onChange={e => setDisplay(e.target.value)}
                  required
                />

                <CFormLabel htmlFor="register-email" className="mt-3">
                  Email
                </CFormLabel>
                <CFormInput
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />

                <CFormLabel htmlFor="register-password" className="mt-3">
                  Password
                </CFormLabel>
                <CFormInput
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />

                <CButton
                  type="submit"
                  color="primary"
                  className="w-100 mt-4"
                  disabled={loading}
                >
                  {loading ? <CSpinner size="sm" /> : 'Registar'}
                </CButton>
              </CForm>

              <div className="text-center mt-3">
                <Link to="/login">Já tens conta? Faz login</Link>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}
