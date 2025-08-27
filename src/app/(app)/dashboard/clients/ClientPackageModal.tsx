'use client';
import { useState } from 'react';

export default function ClientPackageModal({ existing }: { existing?: any }){
  const [open,setOpen]=useState(false);
  const [form,setForm]=useState<any>(existing ?? { title:'', clientId:'', sessionsIncluded:10, priceCents:0, currency:'EUR', status:'ACTIVE' });
  const [saving,setSaving]=useState(false);
  const [err,setErr]=useState<string|null>(null);

  const submit = async ()=>{
    setSaving(true); setErr(null);
    const url = existing ? `/api/clients/packages/${existing.id}` : '/api/clients/packages';
    const method = existing ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    if(!res.ok){ setErr('Erro'); setSaving(false); return; }
    location.reload();
  };

  return (
    <>
      <button className="btn chip" onClick={()=>setOpen(true)}>
        {existing ? 'Editar' : 'Novo pacote'}
      </button>
      {open && (
        <div className="fixed inset-0 grid place-items-center bg-black/30 p-4 z-[10000]" onClick={(e)=>e.currentTarget===e.target && setOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border bg-white p-4 shadow-xl">
            <h3 className="mb-3 text-lg font-semibold">{existing?'Editar pacote':'Novo pacote'}</h3>
            <div className="grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Cliente (ID)</span>
                <input className="rounded-lg border p-2" value={form.clientId??''}
                  onChange={(e)=>setForm({...form, clientId:e.target.value})} disabled={!!existing}/>
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Título</span>
                <input className="rounded-lg border p-2" value={form.title}
                  onChange={(e)=>setForm({...form, title:e.target.value})}/>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-sm text-gray-600">Sessões incl.</span>
                  <input type="number" className="rounded-lg border p-2" value={form.sessionsIncluded}
                    onChange={(e)=>setForm({...form, sessionsIncluded: Number(e.target.value)})}/>
                </label>
                <label className="grid gap-1">
                  <span className="text-sm text-gray-600">Usadas</span>
                  <input type="number" className="rounded-lg border p-2" value={form.sessionsUsed??0}
                    onChange={(e)=>setForm({...form, sessionsUsed: Number(e.target.value)})}/>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-sm text-gray-600">Preço (cêntimos)</span>
                  <input type="number" className="rounded-lg border p-2" value={form.priceCents}
                    onChange={(e)=>setForm({...form, priceCents: Number(e.target.value)})}/>
                </label>
                <label className="grid gap-1">
                  <span className="text-sm text-gray-600">Moeda</span>
                  <input className="rounded-lg border p-2" value={form.currency}
                    onChange={(e)=>setForm({...form, currency: e.target.value})}/>
                </label>
              </div>
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Estado</span>
                <select className="rounded-lg border p-2" value={form.status}
                  onChange={(e)=>setForm({...form, status:e.target.value})}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="ENDED">ENDED</option>
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-gray-600">Notas</span>
                <textarea className="rounded-lg border p-2" rows={3} value={form.notes??''}
                  onChange={(e)=>setForm({...form, notes:e.target.value})}/>
              </label>
              {err && <p className="text-sm text-red-600">{err}</p>}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              {existing && (
                <button className="btn chip" onClick={async ()=>{
                  if(!confirm('Apagar pacote?')) return;
                  setSaving(true);
                  await fetch(`/api/clients/packages/${existing.id}`, { method:'DELETE' });
                  location.reload();
                }}>Apagar</button>
              )}
              <button className="btn chip" onClick={()=>setOpen(false)} disabled={saving}>Cancelar</button>
              <button className="rounded-lg border bg-black/90 px-3 py-2 text-white disabled:opacity-60"
                onClick={submit} disabled={saving}>{saving?'A guardar…':'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
