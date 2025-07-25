// src/pages/Register.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CContainer,
  CRow,
  CCol,
  CCardGroup,
  CCard,
  CCardBody,
  CAlert,
  CForm,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilLockLocked } from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('client')         // default client
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('As passwords não coincidem.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      // Força role a 'client' ou 'trainer' (nunca admin)
      const finalRole = role === 'trainer' ? 'trainer' : 'client'
      await register(email, password, finalRole)
      navigate('/pending', { replace: true })
    } catch (err) {
      console.error(err)
      setError('Falha no registo. Verifique os dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={5}>
            <CCardGroup className="shadow-lg">
              <CCard className="p-4">
                <CCardBody>
                  <h1 className="fs-2 mb-3">Registar</h1>
                  <p className="text-medium-emphasis mb-4">
                    Crie a sua conta
                  </p>
                  {error && <CAlert color="danger">{error}</CAlert>}
                  <CForm onSubmit={handleSubmit}>
                    {/* Email */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </CInputGroup>

                    {/* Password */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </CInputGroup>

                    {/* Confirm Password */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Confirmar Password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </CInputGroup>

                    {/* Seleção de Role */}
                    <div className="mb-4">
                      <label className="form-label">Registar como</label>
                      <CFormSelect
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="client">Cliente</option>
                        <option value="trainer">Personal Trainer</option>
                      </CFormSelect>
                    </div>

                    {/* Botão */}
                    <CRow className="align-items-center">
                      <CCol xs={6}>
                        <CButton
                          color="primary"
                          className="px-4"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? 'A Registar...' : 'Registar'}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-end">
                        <Link to="/login">Já tem conta?</Link>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>

              {/* Lado CTA */}
              <CCard
                className="text-white bg-primary d-none d-md-flex align-items-center justify-content-center"
                style={{ width: '44%' }}
              >
                <CCardBody className="text-center p-4">
                  <h2 className="fs-3 mb-3">Bem-vindo!</h2>
                  <p className="fs-6">
                    Entre na sua conta ou registe-se como cliente/personal trainer.
                  </p>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}
