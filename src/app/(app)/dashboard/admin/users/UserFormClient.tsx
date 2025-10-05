'use client';

import * as React from 'react';
import {
  Box, Stack, TextField, MenuItem, Button, Alert, Snackbar, Typography, Switch, FormControlLabel,
} from '@mui/material';
import { z } from 'zod';

export type Role = 'admin' | 'trainer' | 'client';
export type Status = 'active' | 'inactive';

export type UserFormValues = {
  id?: string;
  name: string;
  email: string;
  role: Role;
  status?: Status;
  approved?: boolean;
  active?: boolean;
};

const Roles: Role[] = ['admin', 'trainer', 'client'];
const Statuses: Status[] = ['active', 'inactive'];

// Zod compat com versões antigas
const RoleSchema = z.union([z.literal('admin'), z.literal('trainer'), z.literal('client')]);
const StatusSchema = z.union([z.literal('active'), z.literal('inactive')]);

const UserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório').min(2, 'Nome muito curto'),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  role: RoleSchema,
  status: StatusSchema.optional(),
  approved: z.boolean().optional(),
  active: z.boolean().optional(),
});

export default function UserFormClient({
  mode,
  initial,
}: {
  mode: 'create' | 'edit';
  initial?: Partial<UserFormValues>;
}) {
  const [values, setValues] = React.useState<UserFormValues>(() => ({
    id: initial?.id,
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    role: (initial?.role as Role) ?? 'client',
    status: (initial?.status as Status) ?? 'active',
    approved: Boolean(initial?.approved ?? true),
    active: Boolean(initial?.active ?? true),
  }));

  const [errors, setErrors] = React.useState<Partial<Record<keyof UserFormValues, string>>>({});
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [snack, setSnack] = React.useState<{open:boolean; msg:string; sev:'success'|'error'|'info'|'warning'}>({
    open:false, msg:'', sev:'success',
  });
  const closeSnack = () => setSnack((s) => ({ ...s, open:false }));

  function setField<K extends keyof UserFormValues>(k: K, v: UserFormValues[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    setErrors({});

    const parsed = UserSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof UserFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof UserFormValues | undefined;
        if (path) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      setSaving(false);
      setSnack({ open: true, msg: 'Verifique os campos destacados.', sev: 'error' });
      return;
    }

    const payload = parsed.data;

    try {
      let res: Response;
      if (mode === 'edit' && payload.id) {
        res = await fetch(`/api/admin/users/${payload.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            role: payload.role,
            status: payload.status ?? 'active',
            approved: payload.approved ?? true,
            active: payload.active ?? true,
          }),
        });
      } else {
        res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            role: payload.role,
            status: payload.status ?? 'active',
            approved: payload.approved ?? true,
            active: payload.active ?? true,
          }),
        });
      }

      if (!res.ok) throw new Error((await res.text()) || 'Falha ao gravar utilizador');

      setSnack({ open: true, msg: mode === 'edit' ? 'Utilizador atualizado ✅' : 'Utilizador criado ✅', sev: 'success' });
    } catch (e: any) {
      setErr(e?.message || 'Falha ao gravar utilizador');
      setSnack({ open: true, msg: 'Erro ao gravar', sev: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display:'grid', gap:2 }}>
      <Typography variant="h6" fontWeight={800}>
        {mode === 'edit' ? '✏️ Editar utilizador' : '➕ Novo utilizador'}
      </Typography>

      {err && <Alert severity="error">{err}</Alert>}

      <TextField
        label="Nome"
        value={values.name}
        onChange={(e) => setField('name', e.target.value)}
        required
        error={Boolean(errors.name)}
        helperText={errors.name || ' '}
      />

      <TextField
        label="Email"
        value={values.email}
        onChange={(e) => setField('email', e.target.value)}
        required
        type="email"
        error={Boolean(errors.email)}
        helperText={errors.email || ' '}
      />

      <TextField
        select
        label="Perfil"
        value={values.role}
        onChange={(e) => setField('role', e.target.value as Role)}
        error={Boolean(errors.role)}
        helperText={errors.role || ' '}
      >
        {Roles.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
      </TextField>

      <TextField
        select
        label="Estado"
        value={values.status ?? 'active'}
        onChange={(e) => setField('status', e.target.value as Status)}
        error={Boolean(errors.status)}
        helperText={errors.status || ' '}
      >
        {Statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </TextField>

      <FormControlLabel
        control={<Switch checked={Boolean(values.approved)} onChange={(e) => setField('approved', e.target.checked)} />}
        label="Aprovado"
      />

      <FormControlLabel
        control={<Switch checked={Boolean(values.active)} onChange={(e) => setField('active', e.target.checked)} />}
        label="Ativo"
      />

      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button type="button" onClick={() => history.back()} disabled={saving}>Cancelar</Button>
        <Button variant="contained" type="submit" disabled={saving}>
          {saving ? (mode === 'edit' ? 'A atualizar…' : 'A criar…') : (mode === 'edit' ? 'Guardar alterações' : 'Criar utilizador')}
        </Button>
      </Stack>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack}>
        <Alert severity={snack.sev} variant="filled" onClose={closeSnack} sx={{ width:'100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
