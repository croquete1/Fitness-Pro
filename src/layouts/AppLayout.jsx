import React, { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import Footer from './Footer.jsx'

export default function AppLayout({ children }) {
  // controla se o sidebar está montado (visible) em mobile/desktop
  const [sidebarShow, setSidebarShow]     = useState(false)
  // controla compactação (unfoldable) no desktop
  const [sidebarUnfoldable, setUnfoldable] = useState(false)

  return (
    <div className="c-app c-default-layout">
      <Sidebar
        unfoldable={sidebarUnfoldable}
        visible={sidebarShow}
        onVisibleChange={setSidebarShow}
      />
      <div
        className={`wrapper d-flex flex-column min-vh-100 ${
          sidebarShow ? 'sidebar-show' : ''
        }`}
      >
        <Topbar onToggleSidebar={() => setSidebarShow(!sidebarShow)} />
        <div className="body flex-grow-1 px-3">{children}</div>
        <Footer />
      </div>
    </div>
  )
}
