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
        <div
          className="fixed inset-0 grid place-items-center p-4 z-[10000] neo-overlay"
          onClick={(e)=>e.currentTarget===e.target && setOpen(false)}
        >
          <div className="card" style={{ width: 'min(560px, 92vw)', padding: 20 }}>
            <h3 className="mb-3 text-lg font-semibold text-fg">{existing?'Editar pacote':'Novo pacote'}</h3>
            <div className="grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm text-muted">Cliente (ID)</span>
                <input className="neo-field" value={form.clientId??''}
                  onChange={(e)=>setForm({...form, clientId:e.target.value})} disabled={!!existing}/>
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-muted">Título</span>
                <input className="neo-field" value={form.title}
                  onChange={(e)=>setForm({...form, title:e.target.value})}/>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-sm text-muted">Sessões incl.</span>
                  <input type="number" className="neo-field" value={form.sessionsIncluded}
                    onChange={(e)=>setForm({...form, sessionsIncluded: Number(e.target.value)})}/>
                </label>
                <label className="grid gap-1">
                  <span className="text-sm text-muted">Usadas</span>
                  <input type="number" className="neo-field" value={form.sessionsUsed??0}
                    onChange={(e)=>setForm({...form, sessionsUsed: Number(e.target.value)})}/>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-sm text-muted">Preço (cêntimos)</span>
                  <input type="number" className="neo-field" value={form.priceCents}
                    onChange={(e)=>setForm({...form, priceCents: Number(e.target.value)})}/>
                </label>
                <label className="grid gap-1">
                  <span className="text-sm text-muted">Moeda</span>
                  <input className="neo-field" value={form.currency}
                    onChange={(e)=>setForm({...form, currency: e.target.value})}/>
                </label>
              </div>
              <label className="grid gap-1">
                <span className="text-sm text-muted">Estado</span>
                <select className="neo-field" value={form.status}
                  onChange={(e)=>setForm({...form, status:e.target.value})}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="ENDED">ENDED</option>
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-sm text-muted">Notas</span>
                <textarea className="neo-field" rows={3} value={form.notes??''}
                  onChange={(e)=>setForm({...form, notes:e.target.value})}/>
              </label>
              {err && <p className="text-sm text-danger">{err}</p>}
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
              <button className="btn primary" onClick={submit} disabled={saving}>
                {saving?'A guardar…':'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
