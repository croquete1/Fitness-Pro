'use client';

import * as React from 'react';
import { Paper, Stack, TextField, MenuItem, Button, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

type FormRow = {
  id?: string;
  user_id?: string;
  status?: 'draft' | 'submitted';
  goals?: string | null;
  injuries?: string | null;
  medical?: string | null;
  activity_level?: 'low' | 'medium' | 'high' | null;
  experience?: 'beginner' | 'intermediate' | 'advanced' | null;
  availability?: string | null;
};

export default function ClientOnboardingFormClient({ initial }: { initial: FormRow | null }) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormRow>({
    goals: initial?.goals ?? '',
    injuries: initial?.injuries ?? '',
    medical: initial?.medical ?? '',
    activity_level: (initial?.activity_level as any) ?? 'medium',
    experience: (initial?.experience as any) ?? 'beginner',
    availability: initial?.availability ?? '',
  });

  async function submit(status: 'draft' | 'submitted') {
    const r = await fetch('/api/onboarding/upsert', {
      method: 'POST',
      body: JSON.stringify({ ...form, status }),
    });
    if (r.ok) router.push('/dashboard'); // volta ao painel
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
        Avaliação física (Onboarding)
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Objetivos"
          multiline minRows={2}
          value={form.goals}
          onChange={(e) => setForm((f) => ({ ...f, goals: e.target.value }))}
        />
        <TextField
          label="Lesões / limitações"
          multiline minRows={2}
          value={form.injuries}
          onChange={(e) => setForm((f) => ({ ...f, injuries: e.target.value }))}
        />
        <TextField
          label="Condições médicas"
          multiline minRows={2}
          value={form.medical}
          onChange={(e) => setForm((f) => ({ ...f, medical: e.target.value }))}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            select label="Nível de atividade"
            value={form.activity_level ?? 'medium'}
            onChange={(e) => setForm((f) => ({ ...f, activity_level: e.target.value as any }))}
            fullWidth
          >
            <MenuItem value="low">Baixo</MenuItem>
            <MenuItem value="medium">Médio</MenuItem>
            <MenuItem value="high">Alto</MenuItem>
          </TextField>
          <TextField
            select label="Experiência"
            value={form.experience ?? 'beginner'}
            onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value as any }))}
            fullWidth
          >
            <MenuItem value="beginner">Iniciante</MenuItem>
            <MenuItem value="intermediate">Intermédio</MenuItem>
            <MenuItem value="advanced">Avançado</MenuItem>
          </TextField>
        </Stack>
        <TextField
          label="Disponibilidade (dias/horas preferidos)"
          value={form.availability}
          onChange={(e) => setForm((f) => ({ ...f, availability: e.target.value }))}
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => submit('draft')}>Guardar rascunho</Button>
          <Button variant="contained" onClick={() => submit('submitted')}>Submeter</Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
