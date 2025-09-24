'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type MetricRow = {
  id: string;
  measured_at: string;
  weight_kg?: number | null;
  body_fat_pct?: number | null;
  chest_cm?: number | null;
  waist_cm?: number | null;
  hips_cm?: number | null;
  bicep_cm?: number | null;
  thigh_cm?: number | null;
  note?: string | null;
};

export default function ProfileClient({
  model,
}: {
  model: { id: string; name: string; email: string; username: string; avatar_url: string; role: string };
}) {
  // Perfil (básico)
  const [name, setName] = React.useState(model.name);
  const [username, setUsername] = React.useState(model.username);
  const [avatar, setAvatar] = React.useState(model.avatar_url);
  const [saving, setSaving] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);

  // Antropometria
  const [busy, setBusy] = React.useState(false);
  const [rows, setRows] = React.useState<MetricRow[]>([]);
  const [measuredAt, setMeasuredAt] = React.useState<string>(() => new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = React.useState<string>('');
  const [fat, setFat] = React.useState<string>('');
  const [chest, setChest] = React.useState<string>('');
  const [waist, setWaist] = React.useState<string>('');
  const [hips, setHips] = React.useState<string>('');
  const [bicep, setBicep] = React.useState<string>('');
  const [thigh, setThigh] = React.useState<string>('');
  const [note, setNote] = React.useState<string>('');

  async function saveProfile() {
    setSaving(true);
    setOk(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, avatar_url: avatar }),
      });
      const json = await res.json();
      setOk(res.ok && json?.ok ? 'Guardado!' : 'Erro ao guardar');
    } finally {
      setSaving(false);
    }
  }

  async function loadMetrics() {
    setBusy(true);
    try {
      const res = await fetch('/api/profile/metrics', { cache: 'no-store' });
      const json = await res.json();
      if (res.ok) setRows(json?.items ?? []);
      else setRows([]);
    } finally {
      setBusy(false);
    }
  }
  React.useEffect(() => { loadMetrics(); }, []);

  async function addMetric() {
    setBusy(true);
    try {
      const body = {
        measured_at: measuredAt,
        weight_kg: weight ? Number(weight) : null,
        body_fat_pct: fat ? Number(fat) : null,
        chest_cm: chest ? Number(chest) : null,
        waist_cm: waist ? Number(waist) : null,
        hips_cm: hips ? Number(hips) : null,
        bicep_cm: bicep ? Number(bicep) : null,
        thigh_cm: thigh ? Number(thigh) : null,
        note: note || null,
      };
      const res = await fetch('/api/profile/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        // limpa apenas os valores numéricos
        setWeight(''); setFat(''); setChest(''); setWaist(''); setHips(''); setBicep(''); setThigh(''); setNote('');
        await loadMetrics();
      }
    } finally {
      setBusy(false);
    }
  }

  // dados do gráfico
  const chartData = rows
    .slice()
    .sort((a, b) => +new Date(a.measured_at) - +new Date(b.measured_at))
    .map((r) => ({
      date: new Date(r.measured_at).toLocaleDateString('pt-PT'),
      weight: r.weight_kg ?? null,
      fat: r.body_fat_pct ?? null,
    }));

  return (
    <Box sx={{ p: 2, display: 'grid', gap: 2, maxWidth: 1100 }}>
      {/* Perfil */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardHeader title="O meu perfil" subheader={model.role} />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ display: 'grid', placeItems: 'center', gap: 1 }}>
                <Avatar src={avatar || undefined} sx={{ width: 96, height: 96 }} />
                <TextField label="Avatar URL" value={avatar} onChange={(e) => setAvatar(e.target.value)} fullWidth />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} fullWidth sx={{ mb: 2 }} />
              <TextField label="Email" value={model.email} disabled fullWidth sx={{ mb: 2 }} />
              <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button onClick={saveProfile} disabled={saving} variant="contained">Guardar</Button>
                {ok && <Typography variant="body2" sx={{ alignSelf: 'center', opacity: .8 }}>{ok}</Typography>}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Antropometria */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardHeader
          title="Antropometria"
          subheader="Acompanha o teu progresso e partilha com o teu PT 💪"
          action={
            <IconButton onClick={loadMetrics} aria-label="Atualizar" disabled={busy}>
              <RefreshIcon />
            </IconButton>
          }
        />
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          {/* formulário inline */}
          <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Data"
                  type="date"
                  value={measuredAt}
                  onChange={(e) => setMeasuredAt(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField label="Peso (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField label="Gordura (%)" value={fat} onChange={(e) => setFat(e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField label="Peito (cm)" value={chest} onChange={(e) => setChest(e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField label="Cintura (cm)" value={waist} onChange={(e) => setWaist(e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField label="Anca (cm)" value={hips} onChange={(e) => setHips(e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField label="Bíceps (cm)" value={bicep} onChange={(e) => setBicep(e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField label="Coxa (cm)" value={thigh} onChange={(e) => setThigh(e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Nota" value={note} onChange={(e) => setNote(e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={addMetric} disabled={busy} variant="contained">Adicionar registo</Button>
              </Grid>
            </Grid>
          </Paper>

          {/* gráficos */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Peso (kg)</Typography>
                <div style={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" hide />
                      <YAxis width={36} />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="var(--mui-palette-primary-main)" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Gordura corporal (%)</Typography>
                <div style={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" hide />
                      <YAxis width={36} />
                      <Tooltip />
                      <Line type="monotone" dataKey="fat" stroke="var(--mui-palette-secondary-main)" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Paper>
            </Grid>
          </Grid>

          {/* tabela rápida */}
          <Divider />
          <Box sx={{ overflowX: 'auto' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-2 pr-3">Data</th>
                  <th className="py-2 pr-3">Peso</th>
                  <th className="py-2 pr-3">Gordura</th>
                  <th className="py-2 pr-3">Peito</th>
                  <th className="py-2 pr-3">Cintura</th>
                  <th className="py-2 pr-3">Anca</th>
                  <th className="py-2 pr-3">Bíceps</th>
                  <th className="py-2 pr-3">Coxa</th>
                  <th className="py-2">Nota</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-[var(--mui-palette-divider)]">
                    <td className="py-2 pr-3">{new Date(r.measured_at).toLocaleDateString('pt-PT')}</td>
                    <td className="py-2 pr-3">{r.weight_kg ?? '—'}</td>
                    <td className="py-2 pr-3">{r.body_fat_pct ?? '—'}</td>
                    <td className="py-2 pr-3">{r.chest_cm ?? '—'}</td>
                    <td className="py-2 pr-3">{r.waist_cm ?? '—'}</td>
                    <td className="py-2 pr-3">{r.hips_cm ?? '—'}</td>
                    <td className="py-2 pr-3">{r.bicep_cm ?? '—'}</td>
                    <td className="py-2 pr-3">{r.thigh_cm ?? '—'}</td>
                    <td className="py-2">{r.note ?? ''}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={9} className="py-3 opacity-70">Sem registos.</td></tr>
                )}
              </tbody>
            </table>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
