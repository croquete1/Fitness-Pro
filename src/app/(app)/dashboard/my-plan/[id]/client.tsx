// src/app/(app)/dashboard/my-plan/[id]/client.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import Paper from '@mui/material/Paper';
import type { PlanDetail } from './page';

function dayLabel(idx: number) {
  return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][idx] ?? `Dia ${idx + 1}`;
}
function formatDateWithWeekday(offset: number) {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  const weekStart = new Date(d);
  const dow = (d.getDay() + 6) % 7;
  weekStart.setDate(d.getDate() - dow);
  const day = new Date(weekStart);
  day.setDate(weekStart.getDate() + offset);
  return new Intl.DateTimeFormat('pt-PT', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(day);
}

export default function PlanDetailClient({
  meId, role, plan,
}: { meId: string; role: 'CLIENT' | 'PT' | 'ADMIN'; plan: PlanDetail; }) {
  const router = useRouter();
  const [dayIdx, setDayIdx] = React.useState<number>((new Date().getDay() + 6) % 7);
  const todayIdx = (new Date().getDay() + 6) % 7;

  // Timers
  const [sessionStart, setSessionStart] = React.useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = React.useState(0);
  React.useEffect(() => {
    if (!sessionStart) return;
    const id = setInterval(() => setElapsedSec(Math.floor((Date.now() - sessionStart) / 1000)), 500);
    return () => clearInterval(id);
  }, [sessionStart]);

  function toggleSession() {
    if (sessionStart) { setSessionStart(null); }
    else { setSessionStart(Date.now()); setElapsedSec(0); }
  }
  function resetSession() {
    setSessionStart(null); setElapsedSec(0);
  }
  const elapsedLabel = new Date(elapsedSec * 1000).toISOString().substring(11, 19);

  // Nota de sessão + foto (upload → path privado → signed preview)
  const [dayNote, setDayNote] = React.useState('');
  const [photoPath, setPhotoPath] = React.useState<string>('');
  const [localPreview, setLocalPreview] = React.useState<string>('');
  const [uploading, setUploading] = React.useState(false);
  const [savingNote, setSavingNote] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  async function buildOverlayBlob(file: File): Promise<Blob> {
    // Cria overlay (data, duração) num canvas e devolve Blob PNG
    const imgUrl = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = imgUrl;
    });
    const canvas = document.createElement('canvas');
    const scale = 1;
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // overlay
    const pad = Math.max(16, Math.round(canvas.width * 0.02));
    const boxW = Math.min(canvas.width - pad * 2, 480);
    const boxH = 88;
    const x = pad; const y = canvas.height - pad - boxH;

    // fundo translúcido
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.roundRect?.(x, y, boxW, boxH, 12);
    if (!ctx.roundRect) { ctx.fillRect(x, y, boxW, boxH); } else { ctx.fill(); }

    // texto
    const now = new Date();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.round(boxH*0.28)}px system-ui, -apple-system, Segoe UI, Roboto`;
    ctx.fillText(`Duração: ${elapsedLabel}`, x + 16, y + Math.round(boxH*0.45));
    ctx.font = `400 ${Math.round(boxH*0.24)}px system-ui, -apple-system, Segoe UI, Roboto`;
    ctx.fillText(`${now.toLocaleDateString('pt-PT')} · ${now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`, x + 16, y + Math.round(boxH*0.80));

    const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b as Blob), 'image/png', 0.92));
    URL.revokeObjectURL(imgUrl);
    return blob;
  }

  async function handlePickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLocalPreview(URL.createObjectURL(f));
    setUploading(true);
    try {
      // cria overlay client-side
      const withOverlay = await buildOverlayBlob(f);
      const name = f.name.replace(/\.[^.]+$/, '.png'); // força png do overlay
      const upFile = new File([withOverlay], name, { type: 'image/png' });

      const fd = new FormData();
      fd.append('file', upFile);
      const res = await fetch('/api/uploads/workout-photo', { method: 'POST', body: fd });
      const json = await res.json();
      if (res.ok && json?.path) {
        setPhotoPath(json.path as string);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function saveDayNote() {
    setSavingNote(true);
    try {
      await fetch('/api/logs/day-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: plan.id,
          day_index: dayIdx,
          note: dayNote,
          photo_path: photoPath || null,
        })
      });
      setDayNote('');
    } finally { setSavingNote(false); }
  }

  // Resumo semanal
  const totals = React.useMemo(() => {
    return (plan.days ?? []).map((d) => {
      const items = d?.items ?? [];
      const sets = items.reduce((acc: number, it: any) => acc + (Number(it?.sets ?? 0) || 0), 0);
      const reps = items.reduce((acc: number, it: any) => {
        const r = String(it?.reps ?? '').trim();
        if (!r) return acc;
        if (/^\d+(?:\s*-\s*\d+)+$/.test(r)) {
          const parts = r.split('-').map((x) => Number(x.trim()) || 0);
          const avg = parts.reduce((a, b) => a + b, 0) / (parts.length || 1);
          const nSets = Number(it?.sets ?? parts.length) || parts.length;
          return acc + Math.round(avg * nSets);
        }
        const n = Number(r);
        if (Number.isFinite(n)) {
          const nSets = Number(it?.sets ?? 1) || 1;
          return acc + n * nSets;
        }
        return acc;
      }, 0);
      return { day_index: d.day_index, sets, reps };
    });
  }, [plan.days]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Timers sessão */}
      <Card variant="outlined" sx={{ mb: 2, borderRadius: 3 }}>
        <CardContent sx={{ display:'flex', gap:1, alignItems:'center', flexWrap:'wrap' }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mr: 1 }}>Sessão</Typography>
          <Chip label={elapsedLabel} />
          <Button size="small" onClick={toggleSession} variant={sessionStart?'outlined':'contained'}>
            {sessionStart ? 'Pausar' : 'Iniciar'}
          </Button>
          <Button size="small" onClick={resetSession} variant="text">Repor</Button>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5" fontWeight={800}>{plan.title ?? 'Plano de treino'}</Typography>
        <Chip size="small" label={String(plan.status ?? 'ATIVO')}
              color={(String(plan.status ?? '').toUpperCase()==='ATIVO')?'success':'default'} />
        {plan.start_date && <Chip size="small" variant="outlined" label={`início: ${new Date(plan.start_date).toLocaleDateString('pt-PT')}`} />}
        {plan.end_date && <Chip size="small" variant="outlined" label={`fim: ${new Date(plan.end_date).toLocaleDateString('pt-PT')}`} />}
        <Box sx={{ flex: 1 }} />
        <Button onClick={() => router.push('/dashboard/sessions')} size="small">📅 Sessões</Button>
        {(role==='PT'||role==='ADMIN') && (
          <Button onClick={() => window.print()} size="small" variant="outlined" className="no-print">🖨️ Exportar PDF</Button>
        )}
      </Box>

      {/* Resumo semanal */}
      <Card variant="outlined" sx={{ mb: 2, borderRadius: 3 }}>
        <CardContent sx={{ display: 'grid', gap: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>Resumo semanal</Typography>
          <Box sx={{ display: 'grid', gap: .5, gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))' }}>
            {(totals ?? []).map((t) => (
              <Paper key={t.day_index} variant="outlined" sx={{ p: 1.2, borderRadius: 2 }}>
                <div className="text-xs opacity-70">{dayLabel(t.day_index)} · {formatDateWithWeekday(t.day_index)}</div>
                <div className="text-sm">Séries: <b>{t.sets}</b></div>
                <div className="text-sm">Reps (≈): <b>{t.reps}</b></div>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Seletor de dia */}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 2 }}>
        {plan.days.map((d) => {
          const isToday = d.day_index === todayIdx;
          const active = d.day_index === dayIdx;
          return (
            <Badge key={d.day_index} color="primary" variant={isToday ? 'dot' : 'standard'}>
              <Button variant={active ? 'contained' : 'outlined'} size="small" onClick={() => setDayIdx(d.day_index)}>
                {dayLabel(d.day_index)}{' '}
                <Box component="span" sx={{ ml: .75, opacity: .7 }}>{formatDateWithWeekday(d.day_index)}</Box>
              </Button>
            </Badge>
          );
        })}
      </Box>

      {/* Lista de exercícios */}
      <Grid container spacing={2}>
        {(plan.days[dayIdx]?.items ?? []).map((it: any, idx: number) => (
          <Grid key={it.id ?? `${dayIdx}-${idx}`} size={{ xs: 12 }}>
            <ExerciseItem item={it} defaultOpen={idx === 0} planId={plan.id} dayIndex={dayIdx} />
          </Grid>
        ))}

        {!plan.days[dayIdx]?.items?.length && (
          <Grid size={{ xs: 12 }}>
            <Card variant="outlined" sx={{ borderRadius: 3, p: 2 }}>
              <Typography>Sem exercícios agendados para este dia.</Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Nota da sessão + foto (upload real, preview signed) */}
      <Card variant="outlined" sx={{ mt: 2, borderRadius: 3 }}>
        <CardHeader title="Notas da sessão" subheader="Regista como correu o treino ✍️ e adiciona uma foto" />
        <CardContent sx={{ display: 'grid', gap: 1 }}>
          <TextField
            fullWidth placeholder="Como te sentiste? Alguma dificuldade?"
            value={dayNote} onChange={(e) => setDayNote(e.target.value)} multiline minRows={2}
          />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePickFile} />
            <Button variant="outlined" onClick={() => fileRef.current?.click()} disabled={uploading} className="no-print">
              {uploading ? 'A enviar…' : '📷 Anexar foto'}
            </Button>
            {localPreview && !photoPath && (
              <img src={localPreview} alt="preview" style={{ height: 64, borderRadius: 8, opacity: .8 }} />
            )}
            {photoPath && (
              <img
                src={`/api/uploads/signed?path=${encodeURIComponent(photoPath)}`}
                alt="foto do treino" style={{ height: 64, borderRadius: 8 }}
              />
            )}
            <Button onClick={saveDayNote} disabled={savingNote || (!dayNote && !photoPath)} variant="contained">
              Guardar sessão
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

/** Item de exercício com nota + descanso (cronómetro por exercício) */
function ExerciseItem({
  item, defaultOpen, planId, dayIndex,
}: { item: any; defaultOpen?: boolean; planId: string; dayIndex: number; }) {
  const [open, setOpen] = React.useState(!!defaultOpen);
  const ex = item?.exercise;
  const media = ex?.gif_url || ex?.video_url || null;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardHeader
        title={ex?.name ?? 'Exercício'}
        subheader={item?.reps ? `Séries: ${item?.sets ?? '-'} · Reps: ${item?.reps}` : `Séries: ${item?.sets ?? '-'}`}
        action={
          <Tooltip title="Expandir / recolher">
            <IconButton onClick={() => setOpen((v) => !v)} aria-label="Expandir / recolher"><ExpandMoreIcon /></IconButton>
          </Tooltip>
        }
      />
      <Collapse in={open} timeout="auto" unmountOnExit>
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          {media && (
            <Box sx={{ display: 'grid', placeItems: 'center' }}>
              {ex?.gif_url ? (
                <img src={ex.gif_url!} alt={ex?.name ?? ''} style={{ maxWidth: '100%', borderRadius: 12 }} />
              ) : (
                <video src={ex?.video_url!} controls style={{ width: '100%', borderRadius: 12 }} />
              )}
            </Box>
          )}
          <SeriesEditor
            planId={planId}
            dayIndex={dayIndex}
            exerciseId={item.exercise_id}
            defaultSets={Number(item?.sets ?? 3)}
            defaultReps={String(item?.reps ?? '')}
            defaultRest={Number(item?.rest_seconds ?? 60)}
          />
          {item?.notes && <Typography variant="body2" sx={{ opacity: .8 }}>Nota do PT: {item.notes}</Typography>}
        </CardContent>
      </Collapse>
    </Card>
  );
}

function SeriesEditor({
  planId, dayIndex, exerciseId, defaultSets, defaultReps, defaultRest,
}: { planId: string; dayIndex: number; exerciseId: string; defaultSets: number; defaultReps: string; defaultRest: number; }) {
  const [sets, setSets] = React.useState<number>(Math.max(1, defaultSets));
  const [reps, setReps] = React.useState<string>(defaultReps || '');
  const [rest, setRest] = React.useState<number>(Math.max(15, defaultRest));
  const [weights, setWeights] = React.useState<string[]>(() => Array.from({ length: sets }, () => ''));
  const [note, setNote] = React.useState<string>('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setWeights((prev) => { const n = prev.slice(0, sets); while (n.length < sets) n.push(''); return n; });
  }, [sets]);

  async function save() {
    setSaving(true);
    try {
      await fetch('/api/logs/exercise', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planId, day_index: dayIndex, exercise_id: exerciseId,
          sets, reps, rest_seconds: rest,
          loads: weights.map((w, i) => ({ set: i + 1, weight: w })), note,
        }),
      });
      setNote('');
    } finally { setSaving(false); }
  }

  // cronómetro de descanso (countdown)
  const [cd, setCd] = React.useState<number>(0);
  const running = cd > 0;
  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setCd((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);
  function startRest() { setCd(Math.max(1, rest)); }

  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))' }}>
        <TextField label="Séries" type="number" value={sets} onChange={(e) => setSets(Math.max(1, Number(e.target.value) || 1))} />
        <TextField label="Reps" value={reps} onChange={(e) => setReps(e.target.value)} />
        <TextField label="Descanso (s)" type="number" value={rest} onChange={(e) => setRest(Math.max(15, Number(e.target.value) || 15))} />
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ display: 'grid', gap: .75 }}>
        {Array.from({ length: sets }, (_, i) => (
          <TextField key={i} label={`Carga série ${i + 1} (kg)`}
            value={weights[i] ?? ''} onChange={(e) => setWeights((arr) => { const n = arr.slice(); n[i] = e.target.value; return n; })} />
        ))}
      </Box>

      <Box sx={{ display:'flex', gap:1, alignItems:'center', flexWrap:'wrap' }}>
        <Button size="small" variant="outlined" onClick={startRest}>⏱️ Descanso</Button>
        {running && <Chip label={`Restante: ${cd}s`} />}
      </Box>

      <TextField
        label="Nota deste exercício (opcional)"
        value={note} onChange={(e) => setNote(e.target.value)} multiline minRows={2}
      />
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button onClick={save} disabled={saving} variant="contained">Guardar exercício</Button>
      </Box>
    </Box>
  );
}
