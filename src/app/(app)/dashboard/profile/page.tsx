// src/app/(app)/dashboard/profile/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type AnthroRow = Database['public']['Tables']['anthropometry']['Row'];

export default function ProfilePage() {
  const sb = supabaseBrowser();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [anthro, setAnthro] = useState<AnthroRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // form – perfil
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState(''); // yyyy-mm-dd
  const [height, setHeight] = useState<number | ''>('');

  // form – antropometria
  const [weight, setWeight] = useState<number | ''>('');
  const [bf, setBf] = useState<number | ''>('');
  const [waist, setWaist] = useState<number | ''>('');
  const [hip, setHip] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      setErr(null);
      setOk(null);

      const { data: auth } = await sb.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) {
        setErr('Sessão inválida. Faz login novamente.');
        return;
      }

      // Perfil
      const profRes = await sb
        .from('profiles')
        .select('id,name,avatar_url,phone,birthdate,height_cm,created_at')
        .eq('id', uid)
        .maybeSingle();

      // Antropometria (sem chest_cm!)
      const anthRes = await sb
        .from('anthropometry')
        .select('id,user_id,measured_at,weight_kg,body_fat_pct,waist_cm,hip_cm,notes,created_at')
        .eq('user_id', uid)
        .order('measured_at', { ascending: false });

      if (!active) return;

      const prof = (profRes.data ?? null) as Profile | null;
      const anth = (anthRes.data ?? []) as AnthroRow[];

      if (prof) {
        setProfile(prof);
        setName(prof.name ?? '');
        setPhone(prof.phone ?? '');
        setBirthdate(prof.birthdate ?? '');
        setHeight(prof.height_cm ?? '');
      }

      setAnthro(anth);
    })();
    return () => {
      active = false;
    };
  }, [sb]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setOk(null);

    const { data: auth } = await sb.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) {
      setBusy(false);
      setErr('Sessão inválida. Faz login novamente.');
      return;
    }

    const { error } = await sb
      .from('profiles')
      .update({
        name: name || null,
        phone: phone || null,
        birthdate: birthdate || null,
        height_cm: typeof height === 'number' ? height : null,
      })
      .eq('id', uid);

    setBusy(false);
    if (error) setErr(error.message);
    else setOk('Perfil atualizado.');
  }

  async function addAnthro(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setOk(null);

    const { data: auth } = await sb.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) {
      setBusy(false);
      setErr('Sessão inválida.');
      return;
    }

    const nowIso = new Date().toISOString();
    const { error } = await sb
      .from('anthropometry')
      .insert({
        user_id: uid,
        measured_at: nowIso,
        weight_kg: typeof weight === 'number' ? weight : null,
        body_fat_pct: typeof bf === 'number' ? bf : null,
        waist_cm: typeof waist === 'number' ? waist : null,
        hip_cm: typeof hip === 'number' ? hip : null,
        notes: notes || null,
      });

    if (error) {
      setBusy(false);
      setErr(error.message);
      return;
    }

    // reload quick
    const { data: list } = await sb
      .from('anthropometry')
      .select('id,user_id,measured_at,weight_kg,body_fat_pct,waist_cm,hip_cm,notes,created_at')
      .eq('user_id', uid)
      .order('measured_at', { ascending: false });

    setAnthro((list ?? []) as AnthroRow[]);
    setBusy(false);
    setOk('Registo guardado.');
    setWeight(''); setBf(''); setWaist(''); setHip(''); setNotes('');
  }

  const latest = useMemo(() => anthro[0] ?? null, [anthro]);

  return (
    <main className="p-4 grid gap-4">
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <h1 className="text-xl font-extrabold tracking-tight">A minha conta</h1>
        <p className="text-sm opacity-70">Atualiza os teus dados pessoais e registos físicos.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {/* Perfil */}
        <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          <h2 className="font-semibold">Dados pessoais</h2>
          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm opacity-80">Nome</span>
              <input className="border rounded-md px-3 py-2 bg-white dark:bg-slate-800"
                value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm opacity-80">Telemóvel</span>
              <input className="border rounded-md px-3 py-2 bg-white dark:bg-slate-800"
                value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm opacity-80">Data de nascimento</span>
              <input type="date" className="border rounded-md px-3 py-2 bg-white dark:bg-slate-800"
                value={birthdate ?? ''} onChange={(e) => setBirthdate(e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm opacity-80">Altura (cm)</span>
              <input type="number" inputMode="numeric" className="border rounded-md px-3 py-2 bg-white dark:bg-slate-800"
                value={height} onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')} />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button disabled={busy} className="rounded-md bg-indigo-600 text-white px-3 py-2 font-semibold disabled:opacity-60">
              Guardar
            </button>
            {ok && <span className="text-emerald-600 text-sm">{ok}</span>}
            {err && <span className="text-rose-600 text-sm">{err}</span>}
          </div>
        </form>

        {/* Antropometria – novo registo */}
        <form onSubmit={addAnthro} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          <h2 className="font-semibold">Medidas antropométricas</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-sm opacity-80">Peso (kg)</span>
              <input type="number" step="0.1" className="border rounded-md px-3 py-2 bg-white dark:bg-slate-800"
                value={weight} onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm opacity-80">% Gordura</span>
              <input type="number" step="0.1" className="border rounded-md px-3 py-2 bg-white dark:bg-slate-800"
                value={bf} onChange={(e) => setBf(e.target.value ? Number(e.target.value) : '')} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm opacity-80">Cintura (cm)</span>
              <input type="number" step="0.1" className="border rounded-md px-3 py-2 bg-white dark:bg-slate-800"
                value={waist} onChange={(e) => setWaist(e.target.value ? Number(e.target.value) : '')} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm opacity-80">Anca (cm)</span>
              <input type="number" step="0.1" className="border rounded-md px-3 py-2 bg-white dark:bg-slate-800"
                value={hip} onChange={(e) => setHip(e.target.value ? Number(e.target.value) : '')} />
            </label>
          </div>
          <label className="grid gap-1">
            <span className="text-sm opacity-80">Notas</span>
            <textarea className="border rounded-md px-3 py-2 bg-white dark:bg-slate-800 min-h-[80px]"
              value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <div>
            <button disabled={busy} className="rounded-md bg-emerald-600 text-white px-3 py-2 font-semibold disabled:opacity-60">
              Adicionar registo
            </button>
          </div>
          {latest && (
            <div className="text-xs opacity-70">
              Último registo: {new Date(latest.measured_at).toLocaleString('pt-PT')}
            </div>
          )}
        </form>
      </section>

      {/* Histórico compacto */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <h2 className="font-semibold mb-2">Histórico</h2>
        {anthro.length === 0 ? (
          <div className="text-sm opacity-70">Ainda sem registos.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[640px] text-sm">
              <thead className="opacity-70 text-left">
                <tr>
                  <th className="py-2 pr-3">Quando</th>
                  <th className="py-2 pr-3">Peso</th>
                  <th className="py-2 pr-3">% Gordura</th>
                  <th className="py-2 pr-3">Cintura</th>
                  <th className="py-2 pr-3">Anca</th>
                  <th className="py-2 pr-3">Notas</th>
                </tr>
              </thead>
              <tbody>
                {anthro.map((a) => (
                  <tr key={a.id} className="border-t border-slate-200/60 dark:border-slate-800/60">
                    <td className="py-2 pr-3">{new Date(a.measured_at).toLocaleString('pt-PT')}</td>
                    <td className="py-2 pr-3">{a.weight_kg ?? '—'}</td>
                    <td className="py-2 pr-3">{a.body_fat_pct ?? '—'}</td>
                    <td className="py-2 pr-3">{a.waist_cm ?? '—'}</td>
                    <td className="py-2 pr-3">{a.hip_cm ?? '—'}</td>
                    <td className="py-2 pr-3">{a.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
