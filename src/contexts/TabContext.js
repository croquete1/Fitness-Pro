import { createContext, useContext, useState } from 'react'

const TabContext = createContext()

export function TabProvider({ children }) {
  const [tab, setTab] = useState("perfil")
  return (
    <TabContext.Provider value={{ tab, setTab }}>
      {children}
    </TabContext.Provider>
  )
}

export function useTab() {
  return useContext(TabContext)
}
