// src/app/(app)/dashboard/clients/metrics/metricsClient.tsx
'use client';

import * as React from 'react';
import { Paper, Stack, Typography, TextField, Button } from '@mui/material';

type Row = { id: string; measured_at: string|null; weight_kg: number|null; height_cm: number|null; body_fat_pct: number|null; bmi:number|null; notes?:string|null };

export default function MetricsClient({ initial }: { initial: Row[] }){
  const [rows, setRows] = React.useState<Row[]>(initial);
  const [d, setD] = React.useState({ date: new Date().toISOString().substring(0,10), weight:'', height:'', fat:'', notes:'' });

  function calcBMI(w:number,h:number){ if(!w||!h) return null; const m = h/100; return +(w/(m*m)).toFixed(1); }

  async function add(){
    const weight = Number(d.weight||0); const height = Number(d.height||0); const fat = d.fat===''?null:Number(d.fat);
    const bmi = calcBMI(weight, height);
    const r = await fetch('/api/clients/metrics', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ measured_at:d.date, weight_kg:weight||null, height_cm:height||null, body_fat_pct:fat, bmi, notes:d.notes||null }) });
    const j = await r.json();
    if (r.ok && j?.row) { setRows([j.row, ...rows]); setD({ date: new Date().toISOString().substring(0,10), weight:'', height:'', fat:'', notes:'' }); }
  }

  return (
    <Paper variant="outlined" sx={{ p:2, borderRadius:3 }}>
      <Typography variant="h6" fontWeight={800}>Métricas antropométricas</Typography>
      <Stack direction={{ xs:'column', sm:'row' }} spacing={1} sx={{ my:1 }}>
        <TextField type="date" label="Data" value={d.date} onChange={(e)=>setD({...d,date:e.target.value})} InputLabelProps={{ shrink:true }}/>
        <TextField type="number" label="Peso (kg)" value={d.weight} onChange={(e)=>setD({...d,weight:e.target.value})}/>
        <TextField type="number" label="Altura (cm)" value={d.height} onChange={(e)=>setD({...d,height:e.target.value})}/>
        <TextField type="number" label="% Massa gorda" value={d.fat} onChange={(e)=>setD({...d,fat:e.target.value})}/>
        <TextField label="Notas" value={d.notes} onChange={(e)=>setD({...d,notes:e.target.value})} sx={{ minWidth: 200 }}/>
        <Button variant="contained" onClick={add}>Adicionar</Button>
      </Stack>

      <ul style={{ margin:0, paddingLeft:16 }}>
        {rows.map((r)=>(
          <li key={r.id}>
            {r.measured_at ? new Date(r.measured_at).toLocaleDateString('pt-PT') : '—'} — Peso <b>{r.weight_kg ?? '—'}</b> kg, Altura <b>{r.height_cm ?? '—'}</b> cm, %Gordura <b>{r.body_fat_pct ?? '—'}</b>, IMC <b>{r.bmi ?? '—'}</b> {r.notes ? `— ${r.notes}` : ''}
          </li>
        ))}
        {rows.length===0 && <Typography sx={{ opacity:.7 }}>Sem registos ainda.</Typography>}
      </ul>
    </Paper>
  );
}
