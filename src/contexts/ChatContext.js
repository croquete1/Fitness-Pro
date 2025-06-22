import { createContext, useContext, useState } from 'react'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  const [mensagens, setMensagens] = useState([])
  return (
    <ChatContext.Provider value={{ mensagens, setMensagens }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  return useContext(ChatContext)
}
