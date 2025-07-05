// src/pages/Chat.jsx
import { useEffect, useRef, useState } from 'react'
import { db, storage, requestPermission } from '../firebase/firebase'
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuthRole } from '../contexts/authRoleContext'
import { format } from 'date-fns'
import { onMessage } from 'firebase/messaging'
import { requestPermission, listenToForegroundMessages } from '../services/firebaseService'
import { messaging } from '../firebase/firebase'
import { getMessaging } from 'firebase/messaging'

export default function Chat() {
  const { user } = useAuthRole()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const mediaRecorderRef = useRef(null)
  const messagesEndRef = useRef(null)
  const audioRef = useRef(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    if (!user) return

    const messagesRef = collection(db, 'chats', user.uid, 'messages')
    const q = query(messagesRef, orderBy('createdAt'))

    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = []
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          msgs.push({ id: change.doc.id, ...change.doc.data() })
          if (change.doc.data().sender !== user.email) {
            audioRef.current?.play()
          }
        }
      })
      setMessages(prev => [...prev, ...msgs])
    })

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const unsubscribe = onMessage(messaging => {
      console.log('📩 Notificação recebida:', messaging)
      alert(`${messaging.notification.title}\n${messaging.notification.body}`)
    })
    return unsubscribe
  }, [])

  const enableNotifications = async () => {
    const token = await requestPermission()
    if (token && user?.uid) {
      await updateDoc(doc(db, 'users', user.uid), {
        fcmToken: token
      })
      setNotificationsEnabled(true)
    }
  }

  const sendPushNotification = async (recipientEmail, text) => {
    const usersSnapshot = await getDocs(collection(db, 'users'))
    usersSnapshot.forEach(async userDoc => {
      const userData = userDoc.data()
      if (userData.email === recipientEmail && userData.fcmToken) {
        await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=BEuqb32wN3ejoAhAQ16k-wVzGUDBXifRD3pZ_n0-jhzS-22_Kyncspp2LxvWs-oayDr7neNEhXJN7w58RJti0b0`
          },
          body: JSON.stringify({
            to: userData.fcmToken,
            notification: {
              title: 'Nova mensagem',
              body: text
            }
          })
        })
      }
    })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const msg = {
      sender: user.email,
      text: newMessage,
      createdAt: serverTimestamp()
    }

    await addDoc(collection(db, 'chats', user.uid, 'messages'), msg)
    await sendPushNotification('RECIPIENT_EMAIL', newMessage)
    setNewMessage('')
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !user) return

    setUploading(true)
    const storageRef = ref(storage, `chat_files/${user.uid}/${file.name}`)
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)

    const msg = {
      sender: user.email,
      fileUrl: downloadURL,
      fileName: file.name,
      fileType: file.type,
      createdAt: serverTimestamp()
    }

    await addDoc(collection(db, 'chats', user.uid, 'messages'), msg)
    setUploading(false)
  }

  const handleAudioRecord = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const mediaRecorder = new MediaRecorder(stream)
      const chunks = []
      mediaRecorder.ondataavailable = e => chunks.push(e.data)
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const audioRef = ref(storage, `chat_audio/${user.uid}/${Date.now()}.webm`)
        await uploadBytes(audioRef, blob)
        const url = await getDownloadURL(audioRef)

        await addDoc(collection(db, 'chats', user.uid, 'messages'), {
          sender: user.email,
          fileUrl: url,
          fileName: 'audio.webm',
          fileType: 'audio/webm',
          createdAt: serverTimestamp()
        })
      }
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()

      setTimeout(() => {
        mediaRecorder.stop()
      }, 5000)
    })
  }

  return (
    <div className="p-6 max-w-2xl mx-auto h-screen flex flex-col">
      <h2 className="text-xl font-bold mb-4">Chat</h2>

      {!notificationsEnabled && (
        <button
          onClick={enableNotifications}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Ativar notificações
        </button>
      )}

      <div className="flex-1 overflow-y-auto bg-white rounded p-4 shadow">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded-lg max-w-xs ${msg.sender === user.email ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}
          >
            {msg.text && <p className="text-sm text-gray-700">{msg.text}</p>}

            {msg.fileUrl && (
              msg.fileType?.startsWith('image') ? (
                <img src={msg.fileUrl} alt="file" className="mt-2 rounded max-w-full" />
              ) : msg.fileType?.startsWith('audio') ? (
                <audio controls src={msg.fileUrl} className="mt-2" />
              ) : (
                <a href={msg.fileUrl} download className="text-blue-500 underline mt-2 inline-block">
                  📎 {msg.fileName}
                </a>
              )
            )}

            <div className="text-xs text-gray-400 text-right">
              <p>{msg.sender}</p>
              {msg.createdAt?.seconds && (
                <p>{format(new Date(msg.createdAt.seconds * 1000), 'dd/MM/yyyy HH:mm')}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex mt-4 gap-2">
        <input
          type="text"
          className="flex-1 border p-2 rounded"
          placeholder="Digite uma mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Enviar</button>
        <label className="bg-gray-200 text-gray-700 px-3 py-2 rounded cursor-pointer">
          📎
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
        <button
          type="button"
          onClick={handleAudioRecord}
          className="bg-green-500 text-white px-3 py-2 rounded"
        >🎤</button>
      </form>

      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
    </div>
  )
}
