import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Footer from './Footer'

export default function AppLayout({ children }) {
  const [sidebarVisible, setSidebarVisible] = useState(true)

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  return (
    <div className="c-app">
      <Sidebar visible={sidebarVisible} />
      <div className={`c-wrapper ${sidebarVisible ? 'c-sidebar-show' : ''}`}>
        <Topbar onToggleSidebar={toggleSidebar} />
        <div className="c-body">
          <main>{children}</main>
        </div>
        <Footer />
      </div>
    </div>
  )
}
