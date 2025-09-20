// src/app/(app)/dashboard/admin/onboarding/[id]/ReviewClient.tsx
'use client';

import * as React from 'react';
import {
  Paper, Stack, Typography, Divider, TextField, Button, MenuItem, Snackbar, Alert
} from '@mui/material';

export default function ReviewClient({
  questionnaire,
  notes,
  pts
}: {
  questionnaire: any;
  notes: any[];
  pts: { id:string; name?:string|null; email?:string|null }[];
}) {
  const [selPT, setSelPT] = React.useState('');
  const [note, setNote] = React.useState('');
  const [vis, setVis] = React.useState<'private'|'client_visible'>('private');
  const [toast, setToast] = React.useState<{open:boolean;msg:string;sev:'success'|'error'}>({open:false,msg:'',sev:'success'});
  const [list, setList] = React.useState(notes);

  async function addNote(){
    try{
      const r = await fetch('/api/onboarding/notes', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ questionnaire_id: questionnaire.id, visibility: vis, body: note }) });
      if (!r.ok) throw new Error();
      setList([{ id: crypto.randomUUID(), created_at: new Date().toISOString(), author_id: null, visibility: vis, body: note }, ...list]);
      setNote('');
      setToast({open:true,msg:'Nota adicionada.',sev:'success'});
    }catch{
      setToast({open:true,msg:'Falha a adicionar nota.',sev:'error'});
    }
  }

  async function assignPT(){
    if(!selPT) return;
    try{
      const r = await fetch('/api/admin/assign-pt', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user_id: questionnaire.user_id, trainer_id: selPT }) });
      if (!r.ok) throw new Error();
      setToast({open:true,msg:'PT atribuído.',sev:'success'});
    }catch{
      setToast({open:true,msg:'Falha a atribuir PT.',sev:'error'});
    }
  }

  return (
    <Paper variant="outlined" sx={{ p:2, borderRadius:3, display:'grid', gap:2 }}>
      <Typography variant="h6" fontWeight={900}>Revisão do questionário</Typography>

      {!questionnaire && <Typography sx={{ opacity:.7 }}>Questionário não encontrado.</Typography>}

      {!!questionnaire && (
        <>
          <Stack spacing={1}>
            <Typography variant="subtitle2">Resumo</Typography>
            <Typography>Bem-estar: <b>{questionnaire.wellbeing_0_to_5 ?? '—'}</b></Typography>
            <Typography>Objetivo: {questionnaire.objective ?? '—'}</Typography>
            <Typography>Profissão: {questionnaire.job ?? '—'}</Typography>
            <Typography>Ativo: {questionnaire.active ? 'Sim' : 'Não'}</Typography>
            <Typography>Desporto/tempo: {questionnaire.sport ?? '—'} / {questionnaire.sport_time ?? '—'}</Typography>
            <Typography>Dias/Períodos: {(questionnaire.schedule?.days)||'—'} / {(questionnaire.schedule?.periods)||'—'}</Typography>
          </Stack>

          <Divider/>

          <Stack direction={{ xs:'column', md:'row' }} spacing={1}>
            <TextField select label="Atribuir PT" value={selPT} onChange={(e)=>setSelPT(e.target.value)} sx={{ minWidth: 260 }}>
              <MenuItem value="">—</MenuItem>
              {pts.map(pt => <MenuItem key={pt.id} value={pt.id}>{pt.name || pt.email}</MenuItem>)}
            </TextField>
            <Button variant="contained" onClick={assignPT} disabled={!selPT}>Atribuir</Button>
          </Stack>

          <Divider/>

          <Typography variant="subtitle2">Notas</Typography>
          <Stack direction={{ xs:'column', md:'row' }} spacing={1}>
            <TextField select label="Visibilidade" value={vis} onChange={(e)=>setVis(e.target.value as any)} sx={{ minWidth: 220 }}>
              <MenuItem value="private">Privada (apenas Admin/PT)</MenuItem>
              <MenuItem value="client_visible">Visível para o cliente</MenuItem>
            </TextField>
            <TextField label="Nota" value={note} onChange={(e)=>setNote(e.target.value)} fullWidth />
            <Button variant="contained" onClick={addNote} disabled={!note.trim()}>Adicionar</Button>
          </Stack>

          <ul style={{ margin:0, paddingLeft:18 }}>
            {list.map((n:any)=>(
              <li key={n.id}>
                <b>{n.visibility === 'private' ? 'Privada' : 'Visível'}</b> — {new Date(n.created_at).toLocaleString('pt-PT')} — {n.body}
              </li>
            ))}
            {list.length===0 && <Typography sx={{ opacity:.7 }}>Sem notas.</Typography>}
          </ul>
        </>
      )}

      <Snackbar open={toast.open} autoHideDuration={2200} onClose={()=>setToast({...toast,open:false})}>
        <Alert variant="filled" severity={toast.sev} onClose={()=>setToast({...toast,open:false})}>{toast.msg}</Alert>
      </Snackbar>
    </Paper>
  );
}
