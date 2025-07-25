// src/layouts/AppLayout.jsx
import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarFooter,
  CSidebarToggler,
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
import {
  cilMenu,
  cilBell,
  cilLockLocked,
  cilLockUnlocked,
} from '@coreui/icons'
import Sidebar from './Sidebar.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useAdminNotifications } from '../hooks/useAdminNotifications.jsx'

export default function AppLayout() {
  const { user, logout, role } = useAuth()
  const { requests } = useAdminNotifications()
  const navigate = useNavigate()

  // 👇 Hooks obrigatórios e definição de visible
  const [pinned, setPinned] = useState(
    () => localStorage.getItem('sidebarPinned') === 'true',
  )
  const [hovered, setHovered] = useState(false)
  const visible = pinned || hovered

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
      setHovered(false)
    } else {
      setPinned(true)
    }
  }

  const handleHamburger = () => {
    if (pinned) {
      setPinned(false)
      setHovered(false)
    } else {
      setHovered(prev => !prev)
    }
  }

  return (
    <div className="c-app c-default-layout">
      <CSidebar
        visible={visible}
        breakpoint="lg"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <CSidebarBrand className="d-flex justify-content-center border-bottom p-3">
          Fitness Pro
        </CSidebarBrand>

        {/* 🔧 Essencial: data-coreui para ativar comportamento */}
        <CSidebarNav data-coreui="navigation">
          <Sidebar />
        </CSidebarNav>

        <CSidebarFooter className="border-top d-flex justify-content-center p-2">
          {/* Uso correto do toggler */}
          <CSidebarToggler onClick={handleTogglePin} />
        </CSidebarFooter>
      </CSidebar>

      <div className={`c-wrapper ${pinned ? 'sidebar-show' : ''}`}>
        <CHeader className="header header-sticky mb-4">
          <CContainer fluid className="d-flex justify-content-between align-items-center">
            <CHeaderToggler onClick={handleHamburger}>
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
              <CDropdown variant="nav-item" alignment="end">
                <CDropdownToggle color="light">
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

        <div className="c-body flex-grow-1 px-3">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
