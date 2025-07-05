// src/pages/Chat.jsx
import { useEffect, useRef, useState } from 'react'
import { db } from '../firebase/firebase'
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { format } from 'date-fns'
import { onMessage } from 'firebase/messaging'
import {
  requestPermission,
  listenToForegroundMessages
} from '../services/firebaseService'
import { getMessaging } from 'firebase/messaging'

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const messagesQuery = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    requestPermission()
    listenToForegroundMessages()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim()) return

    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      timestamp: serverTimestamp(),
    })
    setNewMessage('')
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="h-[400px] overflow-y-scroll border rounded p-2">
        {messages.map(msg => (
          <div key={msg.id} className="mb-2">
            <div>{msg.text}</div>
            <div className="text-xs text-gray-500">
              {msg.timestamp?.seconds ? format(new Date(msg.timestamp.seconds * 1000), 'HH:mm dd/MM/yyyy') : '...'}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-2 flex gap-2">
        <input
          className="flex-1 border rounded px-2"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Escreve uma mensagem"
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleSend}
        >
          Enviar
        </button>
      </div>
    </div>
  )
}

export default Chat
