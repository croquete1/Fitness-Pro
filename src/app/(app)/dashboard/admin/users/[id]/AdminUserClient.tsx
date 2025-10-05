'use client';

import * as React from 'react';
import { z } from 'zod';
import {
  Stack, TextField, Button, Alert, Snackbar, Switch, FormControlLabel,
  MenuItem,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import type { Row, Role } from '../users.types';

const schema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome obrigatório').nullable().or(z.literal('').transform(() => null)).optional(),
  email: z.string().email('Email inválido').nullable().optional(),
  role: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  approved: z.boolean().optional(),
  active: z.boolean().optional(),
});

function normalizeRole(v: any): Role | null {
  if (v == null) return null;
  const s = String(v).toLowerCase();
  if (['adm','administrator'].includes(s)) return 'admin';
  if (['pt','trainer','coach','personal'].includes(s)) return 'pt';
  if (['client','user','aluno','utente'].includes(s)) return 'client';
  return s;
}

export default function AdminUserClient({ initial, readOnly }: { initial: Row; readOnly?: boolean }) {
  const router = useRouter();
  const toast = useToast();

  const [f, setF] = React.useState<Row>({ ...initial });
  const initialRef = React.useRef<Row>({ ...initial });

  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [snack, setSnack] = React.useState<{open:boolean; msg:string; sev:'success'|'error'|'info'|'warning'}>({
    open: false, msg: '', sev: 'success',
  });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const on = (k: keyof Row) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let val: any = e.target.value;
    if (k === 'approved' || k === 'active') val = (e as any).target.checked;
    setF((s) => ({ ...s, [k]: val }));
  };

  function makePatch(prev: Row, next: Row) {
    const patch: Partial<Row> = {};
    (['name','email','role','status','approved','active'] as (keyof Row)[]).forEach((k) => {
      if (prev[k] !== next[k]) (patch as any)[k] = (k === 'role') ? normalizeRole(next[k]) : next[k];
    });
    return patch;
  }

  async function save() {
    setErr(null);
    const parsed = schema.safeParse({
      ...f,
      role: f.role ? normalizeRole(f.role) : null,
    });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Dados inválidos';
      setErr(msg);
      setSnack({ open: true, msg, sev: 'error' });
      toast.error(msg);
      return;
    }

    const patch = makePatch(initialRef.current, parsed.data as Row);
    if (Object.keys(patch).length === 0) {
      toast.info('Nada para atualizar');
      setSnack({ open: true, msg: 'Nada para atualizar', sev: 'info' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${f.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Falha ao gravar utilizador.');
      toast.success('Alterações guardadas');
      setSnack({ open: true, msg: 'Alterações guardadas', sev: 'success' });
      initialRef.current = { ...f };
      setTimeout(() => {
        router.replace(`/dashboard/admin/users/${f.id}`);
        router.refresh();
      }, 250);
    } catch (e: any) {
      const msg = e.message || 'Falha ao gravar utilizador.';
      setErr(msg);
      setSnack({ open: true, msg, sev: 'error' });
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (readOnly) {
    return (
      <Stack spacing={2}>
        {err && <Alert severity="error">{err}</Alert>}

        <TextField label="Nome" value={f.name ?? ''} InputProps={{ readOnly: true }} />
        <TextField label="Email" value={f.email ?? ''} InputProps={{ readOnly: true }} />
        <TextField label="Função" value={String(f.role ?? '')} InputProps={{ readOnly: true }} />
        <TextField label="Estado" value={String(f.status ?? '')} InputProps={{ readOnly: true }} />
        <FormControlLabel control={<Switch checked={!!f.approved} readOnly />} label="Aprovado" />
        <FormControlLabel control={<Switch checked={!!f.active} readOnly />} label="Ativo" />
        <TextField
          label="Criado em"
          value={f.created_at ? new Date(f.created_at).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }) : ''}
          InputProps={{ readOnly: true }}
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => history.back()}>Voltar</Button>
          <Button variant="contained" onClick={() => router.replace(`/dashboard/admin/users/${f.id}?edit=1`)}>Editar</Button>
        </Stack>

        <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
          <Alert severity={snack.sev} variant="filled" onClose={closeSnack}>{snack.msg}</Alert>
        </Snackbar>
      </Stack>
    );
  }

  return (
    <>
      <Stack spacing={2}>
        {err && <Alert severity="error">{err}</Alert>}

        <TextField label="Nome *" value={f.name ?? ''} onChange={on('name')} />
        <TextField label="Email" value={f.email ?? ''} onChange={on('email')} />
        <TextField
          select
          label="Função"
          value={String(f.role ?? '')}
          onChange={on('role')}
          sx={{ maxWidth: 260 }}
        >
          <MenuItem value="">(Sem função)</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="pt">PT</MenuItem>
          <MenuItem value="trainer">PT (trainer)</MenuItem>
          <MenuItem value="client">Cliente</MenuItem>
        </TextField>
        <TextField label="Estado" value={String(f.status ?? '')} onChange={on('status')} />

        <FormControlLabel
          control={<Switch checked={!!f.approved} onChange={on('approved') as any} />}
          label="Aprovado"
        />
        <FormControlLabel
          control={<Switch checked={!!f.active} onChange={on('active') as any} />}
          label="Ativo"
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => router.replace(`/dashboard/admin/users/${f.id}`)}>Cancelar</Button>
          <Button variant="contained" disabled={saving} onClick={save}>{saving ? 'A gravar…' : 'Gravar'}</Button>
        </Stack>
      </Stack>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack}>{snack.msg}</Alert>
      </Snackbar>
    </>
  );
}
