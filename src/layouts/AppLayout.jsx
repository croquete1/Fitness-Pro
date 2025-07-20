import React, { useState, useEffect } from 'react'
import {
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarFooter,
  CHeader,
  CHeaderToggler,
  CContainer,
  CHeaderNav,
  CButton,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CAvatar,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu, cilBell, cilLockLocked, cilLockUnlocked } from '@coreui/icons'
import Sidebar from './Sidebar.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useAdminNotifications } from '../hooks/useAdminNotifications.jsx'
import { NavLink, useNavigate } from 'react-router-dom'

export default function AppLayout({ children }) {
  const { user, logout, role } = useAuth()
  const { requests } = useAdminNotifications()
  const navigate = useNavigate()

  // carregar estado de “pinned” do localStorage
  const [pinned, setPinned] = useState(() => localStorage.getItem('sidebarPinned') === 'true')
  const [hovered, setHovered] = useState(false)
  const visible = pinned || hovered

  // sempre que mudar pinned, guarda no localStorage
  useEffect(() => {
    localStorage.setItem('sidebarPinned', pinned)
  }, [pinned])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleTogglePin = () => {
    if (pinned) {
      setPinned(false)
      setHovered(false) // fecha imediatamente
    } else {
      setPinned(true)
    }
  }

  return (
    <div className="c-app c-default-layout">
      <CSidebar
        visible={visible}
        breakPoint="lg"
        className={`sidebar sidebar-light sidebar-fixed ${visible ? 'sidebar-show' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <CSidebarBrand className="d-flex justify-content-center border-bottom p-3">
          Fitness Pro
        </CSidebarBrand>

        <CSidebarNav>
          <Sidebar />
        </CSidebarNav>

        <CSidebarFooter className="border-top d-flex justify-content-center p-2">
          <CButton size="sm" variant="outline" onClick={handleTogglePin}>
            <CIcon icon={pinned ? cilLockLocked : cilLockUnlocked} />
          </CButton>
        </CSidebarFooter>
      </CSidebar>

      <div className={`wrapper ${pinned ? 'sidebar-pinned' : ''}`}>
        <CHeader className="header header-sticky mb-4">
          <CContainer fluid className="d-flex justify-content-between align-items-center">
            <CHeaderToggler onClick={() => setHovered(prev => !prev)}>
              <CIcon icon={cilMenu} />
            </CHeaderToggler>
            <CHeaderNav className="d-flex align-items-center">
              {role === 'admin' && (
                <NavLink to="/admin/requests">
                  <CButton color="light" className="position-relative me-3">
                    <CIcon icon={cilBell} />
                    {requests.length > 0 && (
                      <CBadge
                        color="danger"
                        shape="pill"
                        className="position-absolute top-0 start-100 translate-middle"
                      >
                        {requests.length}
                      </CBadge>
                    )}
                  </CButton>
                </NavLink>
              )}
              <CDropdown variant="nav-item">
                <CDropdownToggle variant="nav-link">
                  <CAvatar status="success">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </CAvatar>
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={handleLogout}>Logout</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CHeaderNav>
          </CContainer>
        </CHeader>
        <div className="body flex-grow-1 px-3">{children}</div>
      </div>
    </div>
  )
}
