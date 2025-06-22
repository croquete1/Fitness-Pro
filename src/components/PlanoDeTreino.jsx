
import { useEffect, useState } from "react"
import { db } from "@/lib/firebase_config"
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus } from "lucide-react"

export default function PlanoDeTreino() {
  const [exercicios, setExercicios] = useState([])
  const [novo, setNovo] = useState({ nome: "", series: "", descanso: "" })

  useEffect(() => {
    getDocs(collection(db, "planos")).then(snapshot => {
      setExercicios(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })))
    })
  }, [])

  async function adicionar() {
    if (!novo.nome || !novo.series || !novo.descanso) return
    await addDoc(collection(db, "planos"), { ...novo, series: Number(novo.series) })
    setNovo({ nome: "", series: "", descanso: "" })
    const snapshot = await getDocs(collection(db, "planos"))
    setExercicios(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })))
  }

  async function remover(id) {
    await deleteDoc(doc(db, "planos", id))
    const snapshot = await getDocs(collection(db, "planos"))
    setExercicios(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })))
  }

  return (
    <div className="space-y-2">
      {exercicios.map(ex => (
        <div key={ex.id} className="flex items-center justify-between">
          <span><strong>{ex.nome}</strong> — {ex.series} séries — descanso {ex.descanso}</span>
          <Button size="icon" variant="ghost" onClick={() => remover(ex.id)}><Trash2 size={16} /></Button>
        </div>
      ))}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Input placeholder="Nome" value={novo.nome} onChange={e => setNovo({ ...novo, nome: e.target.value })} />
        <Input placeholder="Séries" value={novo.series} onChange={e => setNovo({ ...novo, series: e.target.value })} />
        <Input placeholder="Descanso" value={novo.descanso} onChange={e => setNovo({ ...novo, descanso: e.target.value })} />
      </div>
      <Button onClick={adicionar} className="w-full gap-2"> <Plus size={16} /> Adicionar Exercício </Button>
    </div>
  )
}
