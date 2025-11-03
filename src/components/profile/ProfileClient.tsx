'use client';

import * as React from 'react';
import {
  Paper, Stack, Typography, TextField, MenuItem, Button,
  Grid, Avatar, Alert, Snackbar, Divider, IconButton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AvatarUploader from './AvatarUploader';
import AnthroChart from './AnthroChart';

type Profile = {
  id: string;
  email: string | null;
  name: string;
  username: string;
  avatar_url: string | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
};

type AnthroRow = {
  id: string;
  measured_at: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  height_cm: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  notes: string | null;
};

export default function ProfileClient({
  initialProfile,
  initialAnthro,
}: {
  initialProfile: Profile;
  initialAnthro: AnthroRow[];
}) {
  const [p, setP] = React.useState<Profile>(initialProfile);
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [snack, setSnack] = React.useState<{ open: boolean; msg: string; sev?: 'success'|'error' }>({ open: false, msg: '' });

  // Validação live de username
  const [uCheck, setUCheck] = React.useState<{
    value: string;
    loading: boolean;
    available: boolean | null;
    source: 'supabase' | 'fallback' | null;
  }>({
    value: initialProfile.username ?? '',
    loading: false,
    available: null,
    source: null,
  });
  React.useEffect(() => {
    const v = p.username?.trim() ?? '';
    if (!v) { setUCheck((s) => ({ ...s, value: v, available: null, source: null })); return; }
    setUCheck((s) => ({ ...s, value: v, loading: true }));
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/profile/username/check?u=${encodeURIComponent(v)}`);
        const j = await r.json();
        const source: 'supabase' | 'fallback' | null = j?.source === 'fallback' ? 'fallback' : j?.source === 'supabase' ? 'supabase' : null;
        if (!r.ok || !j?.ok) {
          setUCheck({ value: v, loading: false, available: null, source });
          return;
        }
        setUCheck({ value: v, loading: false, available: !!j.available, source });
      } catch {
        setUCheck({ value: v, loading: false, available: null, source: null });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [p.username]);

  // Antropometria
  const [anthro, setAnthro] = React.useState<AnthroRow[]>(initialAnthro);
  const [addOpen, setAddOpen] = React.useState(false);
  const [newA, setNewA] = React.useState<Partial<AnthroRow>>({
    measured_at: new Date().toISOString().slice(0, 16),
    weight_kg: initialProfile.weight_kg ?? undefined,
    body_fat_pct: undefined,
    height_cm: initialProfile.height_cm ?? undefined,
    chest_cm: undefined,
    waist_cm: undefined,
    hip_cm: undefined,
    notes: '',
  });

  async function saveProfile() {
    setSaving(true);
    try {
      const r = await fetch('/api/profile/update', {
        method: 'PATCH',
        body: JSON.stringify(p),
      });
      if (!r.ok) throw new Error('Falha a guardar');
      setDirty(false);
      setSnack({ open: true, msg: 'Alterações guardadas', sev: 'success' });
    } catch {
      setSnack({ open: true, msg: 'Não foi possível guardar', sev: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function addAnthro() {
    try {
      const r = await fetch('/api/anthro/upsert', { method: 'POST', body: JSON.stringify(newA) });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error();
      // recarregar lista
      const rl = await fetch('/api/anthro/list', { cache: 'no-store' });
      const jl = await rl.json();
      setAnthro(jl.items ?? []);
      setAddOpen(false);
      setSnack({ open: true, msg: 'Medição adicionada', sev: 'success' });
    } catch {
      setSnack({ open: true, msg: 'Falha ao adicionar medição', sev: 'error' });
    }
  }

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6" fontWeight={900}>Perfil</Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={!dirty || saving || (uCheck.available === false)}
              onClick={saveProfile}
            >
              Guardar alterações
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 3 }}>
              <Stack spacing={2} alignItems="center">
                <Avatar
                  src={p.avatar_url ?? undefined}
                  alt={p.name || 'Avatar'}
                  sx={{ width: 96, height: 96 }}
                />
                <AvatarUploader
                  onUploaded={(url) => {
                    setP((pp) => ({ ...pp, avatar_url: url }));
                    setDirty(true);
                    // auto-guardar apenas o avatar
                    fetch('/api/profile/update', { method: 'PATCH', body: JSON.stringify({ avatar_url: url }) })
                      .then(() => setSnack({ open: true, msg: 'Avatar atualizado', sev: 'success' }))
                      .catch(() => setSnack({ open: true, msg: 'Falha ao atualizar avatar', sev: 'error' }));
                  }}
                />
                <Typography variant="body2" color="text.secondary" align="center">
                  Fotografia atual. O envio guarda automaticamente.
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, height: '100%' }}>
              <Stack spacing={2}>
                <TextField
                  label="Nome"
                  value={p.name}
                  onChange={(e) => { setP((pp) => ({ ...pp, name: e.target.value })); setDirty(true); }}
                />
                <TextField
                  label="Username"
                  value={p.username ?? ''}
                  onChange={(e) => { setP((pp) => ({ ...pp, username: e.target.value })); setDirty(true); }}
                  helperText={
                    !p.username
                      ? 'Opcional. Ex.: andremartins'
                      : uCheck.loading
                        ? 'A verificar disponibilidade…'
                        : uCheck.available === false
                          ? 'Este username já está ocupado.'
                          : uCheck.source === 'fallback'
                            ? 'Modo offline: não foi possível confirmar disponibilidade.'
                            : 'Disponível.'
                  }
                  error={!!p.username && uCheck.available === false}
                />
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Género"
                      value={p.gender ?? ''}
                      onChange={(e) => { setP((pp) => ({ ...pp, gender: e.target.value || null })); setDirty(true); }}
                      fullWidth
                    >
                      <MenuItem value="">—</MenuItem>
                      <MenuItem value="male">Masculino</MenuItem>
                      <MenuItem value="female">Feminino</MenuItem>
                      <MenuItem value="other">Outro</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      label="Altura (cm)"
                      type="number"
                      value={p.height_cm ?? ''}
                      onChange={(e) => { setP((pp) => ({ ...pp, height_cm: e.target.value ? Number(e.target.value) : null })); setDirty(true); }}
                      inputProps={{ min: 80, max: 250, step: 1 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      label="Peso (kg)"
                      type="number"
                      value={p.weight_kg ?? ''}
                      onChange={(e) => { setP((pp) => ({ ...pp, weight_kg: e.target.value ? Number(e.target.value) : null })); setDirty(true); }}
                      inputProps={{ min: 20, max: 400, step: 0.1 }}
                      fullWidth
                    />
                  </Grid>
                </Grid>

                {p.email && (
                  <TextField label="Email" value={p.email} disabled />
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={900}>Progresso (antropometria)</Typography>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => setAddOpen(true)}>
            Nova medição
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <AnthroChart rows={anthro} />

        {/* Drawer simplificado (em linha) para nova medição */}
        {addOpen && (
          <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight={800}>Adicionar medição</Typography>
              <IconButton onClick={() => setAddOpen(false)}><CloseIcon /></IconButton>
            </Stack>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Data/hora"
                  type="datetime-local"
                  value={newA.measured_at ?? ''}
                  onChange={(e) => setNewA((x) => ({ ...x, measured_at: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField label="Peso (kg)" type="number" value={newA.weight_kg ?? ''} onChange={(e) => setNewA((x) => ({ ...x, weight_kg: e.target.value ? Number(e.target.value) : null }))} inputProps={{ step: 0.1 }} fullWidth />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField label="Gordura (%)" type="number" value={newA.body_fat_pct ?? ''} onChange={(e) => setNewA((x) => ({ ...x, body_fat_pct: e.target.value ? Number(e.target.value) : null }))} inputProps={{ step: 0.1 }} fullWidth />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField label="Altura (cm)" type="number" value={newA.height_cm ?? ''} onChange={(e) => setNewA((x) => ({ ...x, height_cm: e.target.value ? Number(e.target.value) : null }))} inputProps={{ step: 1 }} fullWidth />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField label="Peito (cm)" type="number" value={newA.chest_cm ?? ''} onChange={(e) => setNewA((x) => ({ ...x, chest_cm: e.target.value ? Number(e.target.value) : null }))} inputProps={{ step: 0.1 }} fullWidth />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField label="Cintura (cm)" type="number" value={newA.waist_cm ?? ''} onChange={(e) => setNewA((x) => ({ ...x, waist_cm: e.target.value ? Number(e.target.value) : null }))} inputProps={{ step: 0.1 }} fullWidth />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <TextField label="Anca (cm)" type="number" value={newA.hip_cm ?? ''} onChange={(e) => setNewA((x) => ({ ...x, hip_cm: e.target.value ? Number(e.target.value) : null }))} inputProps={{ step: 0.1 }} fullWidth />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Notas" value={newA.notes ?? ''} onChange={(e) => setNewA((x) => ({ ...x, notes: e.target.value }))} fullWidth multiline minRows={2} />
              </Grid>
            </Grid>
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={() => setAddOpen(false)}>Cancelar</Button>
              <Button variant="contained" onClick={addAnthro}>Adicionar</Button>
            </Stack>
          </Paper>
        )}
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snack.sev ?? 'success'} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </Stack>
  );
}
