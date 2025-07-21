import React from 'react'
import {
  CHeaderToggler,
  CHeaderBrand,
  CHeaderNav,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CAvatar,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu, cilBell } from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useAdminNotifications } from '../hooks/useAdminNotifications.jsx'
import { useNavigate, Link } from 'react-router-dom'

export default function Topbar({ onToggleSidebar }) {
  const { user, logout, role } = useAuth()
  const { requests } = useAdminNotifications()
  const unread = requests.length
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="d-flex justify-content-between align-items-center w-100 px-3">
      <div className="d-flex align-items-center">
        <CHeaderToggler onClick={onToggleSidebar} className="me-3">
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderBrand>Fitness Pro</CHeaderBrand>
      </div>

      <CHeaderNav className="d-flex align-items-center">
        {role === 'admin' && (
          <Link to="/admin/requests">
            <CButton color="light" className="position-relative me-3">
              <CIcon icon={cilBell} size="lg" />
              {unread > 0 && (
                <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
                  {unread}
                </span>
              )}
            </CButton>
          </Link>
        )}
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
    </div>
  )
}
