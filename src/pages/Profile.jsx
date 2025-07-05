// src/pages/Profile.jsx
import { useAuthRole } from '../contexts/authRoleContext'
import { useState } from 'react'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'

export default function Profile() {
  const { user } = useAuthRole()
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || null)
  const [nome, setNome] = useState(user?.nome || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  if (!user) return null

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      const storage = getStorage()
      const storageRef = ref(storage, `avatars/${user.uid}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      await updateDoc(doc(db, 'users', user.uid), { avatar: downloadURL })
      setAvatarUrl(downloadURL)
      setSuccessMsg('Imagem atualizada com sucesso!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      const storage = getStorage()
      const avatarRef = ref(storage, `avatars/${user.uid}`)
      await deleteObject(avatarRef)
      await updateDoc(doc(db, 'users', user.uid), { avatar: '' })
      setAvatarUrl(null)
      setSuccessMsg('Imagem removida com sucesso!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (error) {
      console.error('Erro ao remover imagem:', error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateDoc(doc(db, 'users', user.uid), { nome })
      setSuccessMsg('Alterações guardadas com sucesso!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (error) {
      console.error('Erro ao atualizar nome:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Perfil do Utilizador</h1>
      <div className="bg-white p-6 rounded shadow max-w-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 mb-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Sem foto
              </div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" disabled={uploading} />
          {avatarUrl && <button onClick={handleRemoveAvatar} className="text-red-500 text-sm mt-2">Remover foto</button>}
          {uploading && <p className="text-sm text-gray-500 mt-2">A carregar imagem...</p>}
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm">Nome</p>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm">Email</p>
          <p className="text-lg font-medium">{user.email}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm">Função</p>
          <p className="text-lg font-medium">{user.role}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm">Estado</p>
          <p className="text-lg font-medium">{user.status}</p>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
          disabled={saving}
        >
          {saving ? 'A guardar...' : 'Guardar alterações'}
        </button>

        {successMsg && <p className="text-green-600 text-sm mt-4">{successMsg}</p>}
      </div>
    </div>
  )
}
