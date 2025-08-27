'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Client = { id:string; name:string|null; email:string };

export default function NewPlanPage(){
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'ACTIVE'|'PENDING'|'SUSPENDED'>('ACTIVE');
  const [exercises, setExercises] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    fetch('/api/sb/clients/my').then(r=>r.json()).then(j=>setClients(j?.data ?? [])).catch(()=>setClients([]));
  }, []);

  const canSave = useMemo(()=> clientId && title.trim().length>0, [clientId,title]);

  function addExercise(){
    setExercises(v => [...v, { name:'', sets:3, reps:10, weight: null, notes:'' }]);
  }
  function setExercise(i:number, patch:Partial<any>){
    setExercises(v => v.map((e,idx)=> idx===i ? {...e, ...patch} : e));
  }
  function rmExercise(i:number){ setExercises(v => v.filter((_,idx)=>idx!==i)); }

  async function save(){
    setSaving(true); setErr(undefined);
    try{
      const body = { clientId, title, notes, status, exercises };
      const r = await fetch('/api/sb/plans', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      const j = await r.json().catch(()=> ({}));
      if(!r.ok) throw new Error(j?.error || 'Falha ao criar');
      router.replace(`/dashboard/pt/plans/${j.id}`);
    }catch(e:any){
      setErr(e?.message || 'Erro');
    }finally{
      setSaving(false);
    }
  }

  return (
    <div style={{ padding:16, display:'grid', gap:12 }}>
      <h1>Novo plano</h1>

      <div className="card" style={{ padding:12, display:'grid', gap:10 }}>
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Cliente</span>
          <select className="rounded-lg border p-2" value={clientId} onChange={(e)=>setClientId(e.target.value)}>
            <option value="">Selecionar…</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name || c.email} — {c.email}</option>)}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Título</span>
          <input className="rounded-lg border p-2" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Plano Hipertrofia A/B" />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Notas gerais</span>
          <textarea className="rounded-lg border p-2 min-h-[80px]" value={notes} onChange={e=>setNotes(e.target.value)} />
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Estado</span>
          <select className="rounded-lg border p-2" value={status} onChange={(e)=>setStatus(e.target.value as any)}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING">PENDING</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </label>

        <div className="card" style={{ padding:12 }}>
          <div className="flex items-center justify-between">
            <h3 style={{ margin:0 }}>Exercícios</h3>
            <button className="btn chip" onClick={addExercise}>+ Adicionar</button>
          </div>

          {exercises.length === 0 ? (
            <div className="text-gray-600" style={{ marginTop:8 }}>Sem exercícios. Adiciona com o botão acima.</div>
          ) : (
            <div className="grid gap-8" style={{ marginTop:8 }}>
              {exercises.map((ex,i)=>(
                <div key={i} className="grid md:grid-cols-5 gap-3 items-end">
                  <label className="grid gap-1 md:col-span-2">
                    <span className="text-sm text-gray-600">Nome</span>
                    <input className="rounded-lg border p-2" value={ex.name} onChange={e=>setExercise(i,{name:e.target.value})} placeholder="Agachamento" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm text-gray-600">Séries</span>
                    <input className="rounded-lg border p-2" type="number" value={ex.sets} onChange={e=>setExercise(i,{sets:parseInt(e.target.value||'0',10)})} />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm text-gray-600">Reps</span>
                    <input className="rounded-lg border p-2" type="number" value={ex.reps} onChange={e=>setExercise(i,{reps:parseInt(e.target.value||'0',10)})} />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm text-gray-600">Peso (kg)</span>
                    <input className="rounded-lg border p-2" type="number" value={ex.weight ?? ''} onChange={e=>setExercise(i,{weight:e.target.value===''? null: Number(e.target.value)})} />
                  </label>
                  <label className="grid gap-1 md:col-span-4">
                    <span className="text-sm text-gray-600">Notas do exercício</span>
                    <input className="rounded-lg border p-2" value={ex.notes ?? ''} onChange={e=>setExercise(i,{notes:e.target.value})} placeholder="Progressão semanal, RPE, etc." />
                  </label>
                  <div className="md:col-span-1">
                    <button className="btn" onClick={()=>rmExercise(i)}>Remover</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {err && <div className="badge badge-danger" style={{ marginTop:8 }}>{err}</div>}

        <div className="flex items-center justify-end gap-8">
          <a className="btn chip" href="/dashboard/pt/plans">Cancelar</a>
          <button className="btn primary" onClick={save} disabled={!canSave || saving}>
            {saving ? 'A criar…' : 'Criar plano'}
          </button>
        </div>
      </div>
    </div>
  );
}
