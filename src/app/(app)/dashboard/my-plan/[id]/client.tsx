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
import { toast } from 'sonner';
import type { PlanDetail } from './page';

function dayLabel(idx: number) {
  return ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][idx] ?? `Dia ${idx+1}`;
}
function formatDateWithWeekday(offset: number) {
  const d = new Date(); d.setHours(0,0,0,0);
  const weekStart = new Date(d); const dow = (d.getDay()+6)%7; weekStart.setDate(d.getDate()-dow);
  const day = new Date(weekStart); day.setDate(weekStart.getDate()+offset);
  return new Intl.DateTimeFormat('pt-PT',{weekday:'short',day:'2-digit',month:'2-digit'}).format(day);
}

export default function PlanDetailClient({
  meId, role, plan,
}: { meId: string; role: 'CLIENT'|'PT'|'ADMIN'; plan: PlanDetail; }) {
  const router = useRouter();
  const [dayIdx, setDayIdx] = React.useState<number>((new Date().getDay()+6)%7);
  const todayIdx = (new Date().getDay()+6)%7;
  const [dayNote, setDayNote] = React.useState('');
  const [savingNote, setSavingNote] = React.useState(false);

  // Upload de foto da sessão
  const [photoPath, setPhotoPath] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  async function handleUpload(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/uploads/workout-photo', { method:'POST', body: fd });
    const json = await res.json();
    if (!res.ok || !json?.path) throw new Error(json?.error || 'Falha no upload');
    setPhotoPath(json.path);
    toast.success('Foto carregada');
  }

  async function saveDayNote() {
    setSavingNote(true);
    try {
      const res = await fetch('/api/logs/day-note', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ plan_id: plan.id, day_index: dayIdx, note: dayNote, photo_path: photoPath }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Erro a guardar nota');
      toast.success('Nota guardada');
      setDayNote('');
    } catch (e: any) {
      toast.error(e?.message || 'Erro a guardar nota');
    } finally { setSavingNote(false); }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2, flexWrap:'wrap' }}>
        <Typography variant="h5" fontWeight={800}>{plan.title ?? 'Plano de treino'}</Typography>
        <Chip size="small" label={String(plan.status ?? 'ATIVO')}
              color={(plan.status ?? '').toUpperCase()==='ATIVO'?'success':'default'} />
        {plan.start_date && <Chip size="small" variant="outlined" label={`início: ${new Date(plan.start_date).toLocaleDateString('pt-PT')}`} />}
        {plan.end_date && <Chip size="small" variant="outlined" label={`fim: ${new Date(plan.end_date).toLocaleDateString('pt-PT')}`} />}
        <Box sx={{ flex:1 }} />
        <Button onClick={() => router.push('/dashboard/sessions')} size="small">📅 Sessões</Button>
        {(role==='PT'||role==='ADMIN') && (
          <Button
            onClick={() => router.push(`/dashboard/plans/${plan.id}/print`)}
            size="small" variant="outlined" className="no-print"
          >
            🖨️ Exportar PDF
          </Button>
        )}
      </Box>

      <Box sx={{ display:'flex', gap:1, overflowX:'auto', pb:1, mb:2 }}>
        {plan.days.map((d) => {
          const isToday = d.day_index === todayIdx;
          const active = d.day_index === dayIdx;
          return (
            <Badge key={d.day_index} color="primary" variant={isToday?'dot':'standard'}>
              <Button variant={active?'contained':'outlined'} size="small" onClick={() => setDayIdx(d.day_index)}>
                {dayLabel(d.day_index)} <Box component="span" sx={{ ml:.75, opacity:.7 }}>{formatDateWithWeekday(d.day_index)}</Box>
              </Button>
            </Badge>
          );
        })}
      </Box>

      <Grid container spacing={2}>
        {(plan.days[dayIdx]?.items ?? []).map((it, idx) => {
          const [open, setOpen] = React.useState(idx===0);
          const ex = it.exercise; const media = ex?.gif_url || ex?.video_url || null;
          return (
            <Grid key={it.id} size={{ xs:12 }}>
              <Card variant="outlined" sx={{ borderRadius:3 }}>
                <CardHeader
                  title={ex?.name ?? 'Exercício'}
                  subheader={it.reps ? `Séries: ${it.sets ?? '-'} · Reps: ${it.reps}` : `Séries: ${it.sets ?? '-'}`}
                  action={<Tooltip title="Expandir / recolher"><IconButton onClick={()=>setOpen(!open)}><ExpandMoreIcon/></IconButton></Tooltip>}
                />
                <Collapse in={open} timeout="auto" unmountOnExit>
                  <CardContent sx={{ display:'grid', gap:2 }}>
                    {media && (
                      <Box sx={{ display:'grid', placeItems:'center' }}>
                        {ex?.gif_url ? (
                          <img src={ex.gif_url!} alt={ex?.name ?? ''} style={{ maxWidth:'100%', borderRadius:12 }} />
                        ) : (
                          <video src={ex?.video_url!} controls style={{ width:'100%', borderRadius:12 }} />
                        )}
                      </Box>
                    )}
                    <SeriesEditor
                      planId={plan.id}
                      dayIndex={dayIdx}
                      exerciseId={it.exercise_id}
                      defaultSets={Number(it.sets ?? 3)}
                      defaultReps={String(it.reps ?? '')}
                      defaultRest={Number(it.rest_seconds ?? 60)}
                    />
                    {it.notes && <Typography variant="body2" sx={{ opacity:.8 }}>Nota do PT: {it.notes}</Typography>}
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
          );
        })}

        {!plan.days[dayIdx]?.items?.length && (
          <Grid size={{ xs:12 }}>
            <Card variant="outlined" sx={{ borderRadius:3, p:2 }}>
              <Typography>Sem exercícios agendados para este dia.</Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      <Card variant="outlined" sx={{ mt:2, borderRadius:3 }}>
        <CardHeader title="Notas do treino" subheader="Regista como correu o treino ✍️" />
        <CardContent sx={{ display:'grid', gap:1 }}>
          {/* Preview da foto (se existir) */}
          {photoPath && (
            <Box sx={{ mb: 1 }}>
              <img
                src={`/api/uploads/signed?path=${encodeURIComponent(photoPath)}`}
                alt="Foto da sessão"
                style={{ maxWidth:'100%', borderRadius:12 }}
              />
            </Box>
          )}

          <Box sx={{ display:'flex', gap:1, alignItems:'center', flexWrap:'wrap' }}>
            <TextField fullWidth placeholder="Como te sentiste? Alguma dificuldade?" value={dayNote} onChange={(e)=>setDayNote(e.target.value)} />
            <input
              type="file" accept="image/*" ref={fileRef}
              onChange={async (e) => {
                const f = e.currentTarget.files?.[0];
                if (!f) return;
                try { await handleUpload(f); }
                catch (err:any) { toast.error(err?.message || 'Falha no upload'); }
                finally { e.currentTarget.value = ''; }
              }}
              style={{ display:'none' }}
            />
            <Button onClick={() => fileRef.current?.click()} variant="outlined">📷 Anexar foto</Button>
            <Button onClick={saveDayNote} disabled={savingNote} variant="contained">Guardar</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

function SeriesEditor({
  planId, dayIndex, exerciseId, defaultSets, defaultReps, defaultRest,
}: { planId:string; dayIndex:number; exerciseId:string; defaultSets:number; defaultReps:string; defaultRest:number; }) {
  const [sets, setSets] = React.useState<number>(Math.max(1, defaultSets));
  const [reps, setReps] = React.useState<string>(defaultReps||'');
  const [rest, setRest] = React.useState<number>(Math.max(15, defaultRest));
  const [weights, setWeights] = React.useState<string[]>(() => Array.from({ length: sets }, ()=>'' ));
  const [saving, setSaving] = React.useState(false);

  React.useEffect(()=>{ setWeights((prev)=>{ const n = prev.slice(0,sets); while(n.length<sets) n.push(''); return n; }); }, [sets]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/logs/exercise', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          plan_id: planId, day_index: dayIndex, exercise_id: exerciseId,
          sets, reps, rest_seconds: rest, loads: weights.map((w,i)=>({ set:i+1, weight:w }))
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Erro a guardar séries');
      toast.success('Séries guardadas');
    } catch (e:any) {
      toast.error(e?.message || 'Erro a guardar séries');
    } finally { setSaving(false); }
  }

  return (
    <Box sx={{ display:'grid', gap:1 }}>
      <Box sx={{ display:'grid', gap:1, gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))' }}>
        <TextField label="Séries" type="number" value={sets} onChange={(e)=>setSets(Math.max(1, Number(e.target.value)||1))}/>
        <TextField label="Reps" value={reps} onChange={(e)=>setReps(e.target.value)} />
        <TextField label="Descanso (s)" type="number" value={rest} onChange={(e)=>setRest(Math.max(15, Number(e.target.value)||15))}/>
      </Box>
      <Divider sx={{ my:1 }}/>
      <Box sx={{ display:'grid', gap:.75 }}>
        {Array.from({ length: sets }, (_, i) => (
          <TextField key={i} label={`Carga série ${i+1} (kg)`} value={weights[i]??''}
            onChange={(e)=>setWeights((arr)=>{ const n=arr.slice(); n[i]=e.target.value; return n; })} />
        ))}
      </Box>
      <Box sx={{ display:'flex', gap:1, justifyContent:'flex-end' }}>
        <Button onClick={save} disabled={saving} variant="contained">Guardar séries</Button>
      </Box>
    </Box>
  );
}
