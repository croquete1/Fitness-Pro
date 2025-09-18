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
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

type Props = {
  initial: {
    name: string; email: string; avatar_url: string;
    gender?: string; birthdate?: string | null;
    height_cm?: number | string; weight_kg?: number | string; bodyfat_pct?: number | string;

    // extra
    phone?: string; city?: string;
    emergency_contact_name?: string; emergency_contact_phone?: string;
    goals?: string; allergies?: string; medical_notes?: string; training_availability?: string; injury_notes?: string;

    // PT
    certifications?: string; specialties?: string; hourly_rate?: number | string; bio?: string;
    role?: string;
  };
};

export default function ProfileForm({ initial }: Props) {
  const [form, setForm] = React.useState({ ...initial });
  const [saving, setSaving] = React.useState(false);
  const router = useRouter();
  const isPT = String(form.role || '').toUpperCase().includes('PT') || String(form.role || '').toUpperCase().includes('TRAINER');

  function up<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

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
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, alignItems: 'start' }}>
        {/* Coluna principal */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight={700}>Dados pessoais</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Nome" value={form.name} onChange={(e) => up('name', e.target.value)} fullWidth />
              <TextField label="Email" type="email" value={form.email} onChange={(e) => up('email', e.target.value)} fullWidth />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Telemóvel" value={form.phone || ''} onChange={(e) => up('phone', e.target.value)} fullWidth />
              <TextField label="Cidade" value={form.city || ''} onChange={(e) => up('city', e.target.value)} fullWidth />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Género" select value={form.gender || ''} onChange={(e) => up('gender', e.target.value)} fullWidth>
                <MenuItem value="">—</MenuItem>
                <MenuItem value="M">Masculino</MenuItem>
                <MenuItem value="F">Feminino</MenuItem>
                <MenuItem value="O">Outro</MenuItem>
              </TextField>
              <TextField label="Data de nascimento" type="date" value={(form.birthdate || '').toString().slice(0,10)} onChange={(e)=>up('birthdate', e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
            </Stack>

            <Divider />

            <Typography variant="subtitle2" fontWeight={700}>Métricas</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Altura" type="number" value={form.height_cm ?? ''} onChange={(e)=>up('height_cm', e.target.value)} fullWidth InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }} />
              <TextField label="Peso" type="number" value={form.weight_kg ?? ''} onChange={(e)=>up('weight_kg', e.target.value)} fullWidth InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }} />
              <TextField label="% Gordura" type="number" value={form.bodyfat_pct ?? ''} onChange={(e)=>up('bodyfat_pct', e.target.value)} fullWidth InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
            </Stack>

            <Divider />

            <Typography variant="subtitle2" fontWeight={700}>Saúde e objetivos</Typography>
            <TextField label="Objetivos" value={form.goals || ''} onChange={(e)=>up('goals', e.target.value)} fullWidth multiline minRows={2} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Alergias" value={form.allergies || ''} onChange={(e)=>up('allergies', e.target.value)} fullWidth />
              <TextField label="Informação médica" value={form.medical_notes || ''} onChange={(e)=>up('medical_notes', e.target.value)} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Lesões/Observações" value={form.injury_notes || ''} onChange={(e)=>up('injury_notes', e.target.value)} fullWidth />
              <TextField label="Disponibilidade para treinar" value={form.training_availability || ''} onChange={(e)=>up('training_availability', e.target.value)} fullWidth />
            </Stack>

            <Divider />

            <Typography variant="subtitle2" fontWeight={700}>Contacto de emergência</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Nome" value={form.emergency_contact_name || ''} onChange={(e)=>up('emergency_contact_name', e.target.value)} fullWidth />
              <TextField label="Telefone" value={form.emergency_contact_phone || ''} onChange={(e)=>up('emergency_contact_phone', e.target.value)} fullWidth />
            </Stack>

            {isPT && (
              <>
                <Divider />
                <Typography variant="subtitle2" fontWeight={700}>Informação profissional (PT)</Typography>
                <TextField label="Certificações" value={form.certifications || ''} onChange={(e)=>up('certifications', e.target.value)} fullWidth />
                <TextField label="Especialidades" value={form.specialties || ''} onChange={(e)=>up('specialties', e.target.value)} fullWidth />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Preço/hora" type="number" value={form.hourly_rate ?? ''} onChange={(e)=>up('hourly_rate', e.target.value)} fullWidth InputProps={{ endAdornment: <InputAdornment position="end">€</InputAdornment> }} />
                  <TextField label="Bio" value={form.bio || ''} onChange={(e)=>up('bio', e.target.value)} fullWidth />
                </Stack>
              </>
            )}
          </Stack>
        </Paper>

        {/* Coluna lateral */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2} alignItems="center">
            <Avatar src={form.avatar_url || undefined} sx={{ width: 96, height: 96 }} />
            <TextField label="URL da foto de perfil" value={form.avatar_url} onChange={(e)=>up('avatar_url', e.target.value)} fullWidth />
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'A guardar…' : 'Guardar alterações'}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </form>
  );
}
