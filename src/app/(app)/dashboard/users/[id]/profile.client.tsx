'use client';

import { useState } from 'react';

type Role = 'ADMIN' | 'TRAINER' | 'CLIENT';

export default function ClientProfileClient({
  user,
  trainers,
  currentTrainerId,
}: {
  user: { id: string; name: string | null; email: string; role: Role; status: 'ACTIVE' | 'SUSPENDED' | 'PENDING'; createdAt: string | null };
  trainers: { id: string; name: string }[];
  currentTrainerId: string | null;
}) {
  const [trainerId, setTrainerId] = useState<string>(currentTrainerId ?? '');

  async function saveLink() {
    const res = await fetch('/api/admin/trainer-clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: user.id, trainerId }),
    });
    if (!res.ok) alert('Não foi possível atualizar o vínculo');
    else alert('Vínculo atualizado com sucesso');
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="card" style={{ padding: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Ficha do cliente</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8, marginTop: 12 }}>
          <Field label="Nome" value={user.name ?? '—'} />
          <Field label="Email" value={user.email} />
          <Field label="Role" value={user.role} />
          <Field label="Estado" value={user.status} />
          <Field label="Criado" value={user.createdAt ? new Date(user.createdAt).toLocaleString('pt-PT') : '—'} />
        </div>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Atribuir Personal Trainer</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="input" value={trainerId} onChange={e => setTrainerId(e.target.value)} style={{ minWidth: 260 }}>
            <option value="">— Sem PT —</option>
            {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button className="btn primary" onClick={saveLink} disabled={trainerId === (currentTrainerId ?? '')}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <div style={{ fontSize: 12, opacity: .65 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}