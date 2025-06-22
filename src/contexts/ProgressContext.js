import { createContext, useContext, useState } from 'react'

const ProgressContext = createContext()

export function ProgressProvider({ children }) {
  const [progresso, setProgresso] = useState(0)
  return (
    <ProgressContext.Provider value={{ progresso, setProgresso }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  return useContext(ProgressContext)
}
