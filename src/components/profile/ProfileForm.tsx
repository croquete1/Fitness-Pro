// src/components/profile/ProfileForm.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';

type Props = {
  initial: {
    name: string; email: string; avatar_url: string;
    gender?: string; birthdate?: string | null;
    height_cm?: number | string; weight_kg?: number | string; bodyfat_pct?: number | string;
  };
};

export default function ProfileForm({ initial }: Props) {
  const [form, setForm] = React.useState({ ...initial });
  const [saving, setSaving] = React.useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {/* layout responsivo sem Grid: 2 colunas a partir de md */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          alignItems: 'start',
        }}
      >
        {/* Coluna principal */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Nome"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              fullWidth
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Género"
                select
                value={form.gender || ''}
                onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                fullWidth
              >
                <MenuItem value="">—</MenuItem>
                <MenuItem value="M">Masculino</MenuItem>
                <MenuItem value="F">Feminino</MenuItem>
                <MenuItem value="O">Outro</MenuItem>
              </TextField>

              <TextField
                label="Data de nascimento"
                type="date"
                value={(form.birthdate || '').toString().slice(0, 10)}
                onChange={(e) => setForm((f) => ({ ...f, birthdate: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Altura"
                type="number"
                value={form.height_cm ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, height_cm: e.target.value }))}
                fullWidth
                InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
              />
              <TextField
                label="Peso"
                type="number"
                value={form.weight_kg ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))}
                fullWidth
                InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
              />
              <TextField
                label="% Gordura"
                type="number"
                value={form.bodyfat_pct ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, bodyfat_pct: e.target.value }))}
                fullWidth
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              />
            </Stack>
          </Stack>
        </Paper>

        {/* Coluna lateral */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2} alignItems="center">
            <Avatar src={form.avatar_url || undefined} sx={{ width: 96, height: 96 }} />
            <TextField
              label="URL da foto de perfil"
              value={form.avatar_url}
              onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))}
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'A guardar…' : 'Guardar alterações'}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </form>
  );
}
