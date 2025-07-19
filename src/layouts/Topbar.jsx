import React from 'react'
import {
  CHeader,
  CHeaderToggler,
  CHeaderBrand,
  CHeaderNav,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CAvatar,
  CButton,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu, cilBell } from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNotifications } from '../hooks/useNotifications.js'
import { useNavigate } from 'react-router-dom'

export default function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const { notifications } = useNotifications()
  const navigate = useNavigate()
  const unread = notifications.filter(n => !n.read).length

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <CHeader className="d-flex justify-content-between align-items-center px-3">
      <div className="d-flex align-items-center">
        <CHeaderToggler onClick={onToggleSidebar} className="me-3">
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderBrand>Fitness Pro</CHeaderBrand>
      </div>

      <CHeaderNav className="d-flex align-items-center">
        <CButton color="light" className="position-relative me-3">
          <CIcon icon={cilBell} size="lg" />
          {unread > 0 && (
            <CBadge
              color="danger"
              shape="pill"
              className="position-absolute top-0 start-100 translate-middle"
            >
              {unread}
            </CBadge>
          )}
        </CButton>
        <CDropdown>
          <CDropdownToggle className="text-decoration-none">
            <CAvatar status="success">
              {user?.email?.[0].toUpperCase() || 'U'}
            </CAvatar>
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem header>{user?.email}</CDropdownItem>
            <CDropdownItem onClick={handleLogout}>Logout</CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </CHeaderNav>
    </CHeader>
  )
}
