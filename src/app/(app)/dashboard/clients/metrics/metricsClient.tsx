// src/app/(app)/dashboard/clients/metrics/metricsClient.tsx
'use client';

import * as React from 'react';
import { Paper, Stack, Typography, TextField, Button, Divider, Box } from '@mui/material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

type Row = { id: string; measured_at: string|null; weight_kg: number|null; height_cm: number|null; body_fat_pct: number|null; bmi:number|null; notes?:string|null };

function calcBMI(w:number|null|undefined,h:number|null|undefined){ if(!w||!h) return null; const m = h/100; if(!m) return null; return +(w/(m*m)).toFixed(1); }

function parseDateLike(value:unknown){
  if(!value) return null;
  if(value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  const raw = String(value).trim();
  if(!raw) return null;
  if(/^\d{4}-\d{2}-\d{2}/.test(raw)){ const iso = new Date(raw); if(!Number.isNaN(iso.getTime())) return iso.toISOString(); }
  const ddmmyyyy = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if(ddmmyyyy){
    const day = Number(ddmmyyyy[1]); const month = Number(ddmmyyyy[2]) - 1; const year = Number(ddmmyyyy[3].length === 2 ? `20${ddmmyyyy[3]}` : ddmmyyyy[3]);
    const date = new Date(Date.UTC(year, month, day));
    if(!Number.isNaN(date.getTime())) return date.toISOString();
  }
  const parsed = new Date(raw);
  if(!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return null;
}

function parseNumberLike(value:unknown){
  if(value===null || value===undefined) return null;
  if(typeof value === 'number' && !Number.isNaN(value)) return value;
  const normalized = String(value).replace(',', '.').trim();
  if(!normalized) return null;
  const n = Number(normalized);
  return Number.isNaN(n) ? null : n;
}

export default function MetricsClient({ initial }: { initial: Row[] }){
  const [rows, setRows] = React.useState<Row[]>(initial);
  const [d, setD] = React.useState({ date: new Date().toISOString().substring(0,10), weight:'', height:'', fat:'', notes:'' });
  const [importing, setImporting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const summary = React.useMemo(()=>{
    if(rows.length === 0) return null;
    const latest = rows[0];
    const previous = rows.find((_, idx)=>idx>0 && rows[idx]?.weight_kg!=null && rows[idx]?.measured_at);
    const avgWeight = (()=>{
      const weights = rows.map((r)=>r.weight_kg).filter((v):v is number=>typeof v === 'number');
      if(weights.length===0) return null; return +(weights.reduce((acc,v)=>acc+v,0)/weights.length).toFixed(1);
    })();
    const trendWeight = (latest.weight_kg!=null && previous?.weight_kg!=null) ? +(latest.weight_kg - previous.weight_kg).toFixed(1) : null;
    return { latest, avgWeight, trendWeight };
  }, [rows]);

  async function add(){
    const weight = parseNumberLike(d.weight);
    const height = parseNumberLike(d.height);
    const fat = parseNumberLike(d.fat);
    const bmi = calcBMI(weight, height);
    const payload = { measured_at:d.date, weight_kg:weight, height_cm:height, body_fat_pct:fat, bmi, notes:d.notes||null };
    const r = await fetch('/api/clients/metrics', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const j = await r.json().catch(()=>null);
    if (r.ok && j?.row) {
      setRows([j.row, ...rows]);
      setD({ date: new Date().toISOString().substring(0,10), weight:'', height:'', fat:'', notes:'' });
    } else {
      window.alert(j?.message ?? 'Não foi possível guardar as métricas.');
    }
  }

  function generateReport(){
    if(rows.length===0){ window.alert('Adicione pelo menos uma avaliação para gerar o relatório.'); return; }
    const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
    const latest = rows[0];
    const createdAt = latest.measured_at ? new Date(latest.measured_at) : new Date();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Análise da composição corporal', 105, 18, { align:'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Emitido em: ${new Date().toLocaleString('pt-PT')}`, 20, 28);
    doc.text(`Última avaliação: ${createdAt.toLocaleDateString('pt-PT')}`, 20, 34);
    const summaryY = 42;
    const latestLines = [
      `Peso: ${latest.weight_kg ?? '—'} kg`,
      `Altura: ${latest.height_cm ?? '—'} cm`,
      `% Massa gorda: ${latest.body_fat_pct ?? '—'} %`,
      `IMC: ${latest.bmi ?? calcBMI(latest.weight_kg, latest.height_cm) ?? '—'}`,
    ];
    doc.text('Resumo da última avaliação', 20, summaryY, { baseline:'top' });
    latestLines.forEach((line, idx)=>doc.text(line, 20, summaryY + 6 + idx*6));
    if(summary){
      const startX = 120;
      doc.text('Tendência', startX, summaryY, { baseline:'top' });
      const avgText = summary.avgWeight ? `Peso médio (últimos ${rows.length} registos): ${summary.avgWeight} kg` : 'Peso médio indisponível';
      doc.text(avgText, startX, summaryY + 6);
      const trendText = summary.trendWeight!=null ? `Variação desde a avaliação anterior: ${summary.trendWeight > 0 ? '+' : ''}${summary.trendWeight} kg` : 'Sem avaliação anterior para comparar';
      doc.text(trendText, startX, summaryY + 12);
    }
    autoTable(doc, {
      startY: summaryY + 32,
      head: [[ 'Data', 'Peso (kg)', 'Altura (cm)', '% Gordura', 'IMC', 'Notas' ]],
      body: rows.slice(0, 20).map((r)=>[
        r.measured_at ? new Date(r.measured_at).toLocaleDateString('pt-PT') : '—',
        r.weight_kg ?? '—',
        r.height_cm ?? '—',
        r.body_fat_pct ?? '—',
        r.bmi ?? calcBMI(r.weight_kg, r.height_cm) ?? '—',
        r.notes ?? '',
      ]),
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [33, 150, 243], textColor: 255 },
    });
    doc.save(`avaliacao-${createdAt.toISOString().slice(0,10)}.pdf`);
  }

  async function onImportFile(event: React.ChangeEvent<HTMLInputElement>){
    const file = event.target.files?.[0];
    if(!file) return;
    try {
      setImporting(true);
      const text = await file.text();
      const parsed = Papa.parse<Record<string, unknown>>(text, { header:true, skipEmptyLines:true, transformHeader:(header)=>header.trim().toLowerCase() });
      if(parsed.errors.length){ throw new Error(parsed.errors[0].message); }
      const mapped = (parsed.data || []).map((row)=>{
        const measured_at = parseDateLike(row['data'] ?? row['date'] ?? row['measured_at']);
        const weight_kg = parseNumberLike(row['peso'] ?? row['weight'] ?? row['weight_kg']);
        const height_cm = parseNumberLike(row['altura'] ?? row['height'] ?? row['height_cm']);
        const body_fat_pct = parseNumberLike(row['percentual_gordura'] ?? row['bodyfat'] ?? row['body_fat_pct'] ?? row['%gordura']);
        const bmi = parseNumberLike(row['imc'] ?? row['bmi']) ?? calcBMI(weight_kg, height_cm);
        const notes = typeof row['notas'] === 'string' ? row['notas'] : typeof row['notes'] === 'string' ? row['notes'] : null;
        if(!measured_at && weight_kg==null && height_cm==null && body_fat_pct==null && bmi==null && !notes) return null;
        return { measured_at, weight_kg, height_cm, body_fat_pct, bmi, notes };
      }).filter((row): row is { measured_at:string|null; weight_kg:number|null; height_cm:number|null; body_fat_pct:number|null; bmi:number|null; notes:string|null }=>Boolean(row));
      if(mapped.length===0){ window.alert('Não foram encontrados registos válidos no ficheiro.'); return; }
      const response = await fetch('/api/clients/metrics', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ rows: mapped }) });
      const json = await response.json().catch(()=>null);
      if(response.ok && Array.isArray(json?.rows)){
        setRows((current)=>[...json.rows, ...current]);
      }else{
        window.alert(json?.message ?? 'Não foi possível importar os dados.');
      }
    } catch (err){
      console.error(err);
      window.alert('Erro ao processar o ficheiro da balança. Confirme o formato e tente novamente.');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
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

      <Stack direction={{ xs:'column', sm:'row' }} spacing={1} sx={{ mb:2 }}>
        <Button variant="outlined" onClick={generateReport} disabled={rows.length===0}>Gerar relatório em PDF</Button>
        <Button variant="outlined" onClick={()=>fileInputRef.current?.click()} disabled={importing}>
          {importing ? 'A importar…' : 'Importar da balança (.csv)'}
        </Button>
        <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={onImportFile} style={{ display:'none' }} />
      </Stack>

      {summary && (
        <Box sx={{ mb:2, p:2, bgcolor:(theme)=>theme.palette.action.hover, borderRadius:2 }}>
          <Typography fontWeight={700} sx={{ mb:0.5 }}>Resumo rápido</Typography>
          <Typography variant="body2">Último peso registado: <b>{summary.latest.weight_kg ?? '—'} kg</b></Typography>
          {summary.avgWeight && <Typography variant="body2">Peso médio: <b>{summary.avgWeight} kg</b></Typography>}
          {summary.trendWeight!=null && (
            <Typography variant="body2">
              Evolução desde a última avaliação: <b>{summary.trendWeight > 0 ? '+' : ''}{summary.trendWeight} kg</b>
            </Typography>
          )}
        </Box>
      )}

      <Divider sx={{ mb:2 }} />

      <ul style={{ margin:0, paddingLeft:16 }}>
        {rows.map((r)=>(
          <li key={r.id}>
            {r.measured_at ? new Date(r.measured_at).toLocaleDateString('pt-PT') : '—'} — Peso <b>{r.weight_kg ?? '—'}</b> kg, Altura <b>{r.height_cm ?? '—'}</b> cm, %Gordura <b>{r.body_fat_pct ?? '—'}</b>, IMC <b>{r.bmi ?? calcBMI(r.weight_kg, r.height_cm) ?? '—'}</b> {r.notes ? `— ${r.notes}` : ''}
          </li>
        ))}
        {rows.length===0 && <Typography sx={{ opacity:.7 }}>Sem registos ainda.</Typography>}
      </ul>
    </Paper>
  );
}
