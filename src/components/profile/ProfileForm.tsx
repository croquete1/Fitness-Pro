// src/components/profile/ProfileForm.tsx
'use client';

import * as React from 'react';
import { Box, Paper, Stack, TextField, MenuItem, Avatar, Button, Typography, Snackbar, Alert, Divider, CircularProgress } from '@mui/material';

type Initial = {
  username: string;
  name: string;
  email: string;
  role: 'CLIENT'|'PT'|'TRAINER'|'ADMIN';
  avatar_url: string;
  gender: string;
  dob: string;
  height_cm: number | null;
  weight_kg: number | null;
};

export default function ProfileForm({ initial }: { initial: Initial }) {
  const [form, setForm] = React.useState<Initial>(initial);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [toast, setToast] = React.useState<{ open: boolean; sev:'success'|'error'; msg:string }>({ open:false, sev:'success', msg:'' });

  // username live check
  const [uState, setUState] = React.useState<{checking:boolean; ok:boolean; reason?:string}>({ checking:false, ok:true });
  const usernameChanged = form.username.trim() && form.username.trim() !== (initial.username || '').trim();
  React.useEffect(() => {
    const u = form.username.trim();
    if (!u || !usernameChanged) { setUState({ checking:false, ok:true }); return; }
    setUState({ checking:true, ok:false });
    const id = setTimeout(async () => {
      try{
        const r = await fetch('/api/profile/check-username?q='+encodeURIComponent(u), { cache:'no-store' });
        const j = await r.json();
        setUState({ checking:false, ok: !!j?.available, reason: j?.reason });
      }catch{ setUState({ checking:false, ok:false }); }
    }, 350);
    return () => clearTimeout(id);
  }, [form.username]); // eslint-disable-line

  const usernameError = usernameChanged && !uState.checking && !uState.ok;

  function set<K extends keyof Initial>(k:K, v:Initial[K]) {
    setForm(f => ({ ...f, [k]: v }));
    setDirty(true);
  }

  // Upload avatar (auto-aplica sem “Guardar”)
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement|null>(null);
  function pickFile(){ fileRef.current?.click(); }
  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>){
    const file = e.target.files?.[0]; if(!file) return;
    setUploading(true);
    try{
      const fd = new FormData(); fd.append('file', file);
      const r = await fetch('/api/profile/upload-avatar', { method:'POST', body: fd });
      const j = await r.json();
      if (r.ok && j?.url) {
        setForm(f => ({ ...f, avatar_url: j.url })); // auto-ativa
        setToast({ open:true, sev:'success', msg:'Avatar atualizado.' });
      } else {
        setToast({ open:true, sev:'error', msg:'Falha no upload do avatar.' });
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    if (saving || usernameError || !dirty) return;
    setSaving(true);
    try{
      const r = await fetch('/api/profile/update', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const j = await r.json().catch(()=> ({}));
        if (j?.field==='username' && j?.reason==='taken'){
          setUState({ checking:false, ok:false, reason:'taken' });
          setToast({ open:true, sev:'error', msg:'Esse username já está ocupado.' });
        } else {
          setToast({ open:true, sev:'error', msg:'Falha ao guardar alterações.' });
        }
      } else {
        setDirty(false);
        setToast({ open:true, sev:'success', msg:'Perfil atualizado.' });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', md:'2fr 1fr' }, gap:2 }}>
        {/* Dados */}
        <Paper variant="outlined" sx={{ p:2, borderRadius:3 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb:1 }}>Dados da conta</Typography>
          <Stack spacing={2}>
            <TextField
              label="Username"
              value={form.username}
              onChange={(e)=>set('username', e.target.value)}
              error={usernameError}
              helperText={
                uState.checking ? 'A verificar disponibilidade…'
                : usernameError ? (uState.reason==='invalid_format' ? 'Use 3–24 chars (letras, números, ".", "_" ou "-").' : 'Username indisponível.')
                : 'O teu identificador público.'
              }
              InputProps={{ endAdornment: uState.checking ? <CircularProgress size={16}/> : undefined }}
              fullWidth
            />
            <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
              <TextField label="Nome" value={form.name} onChange={(e)=>set('name', e.target.value)} fullWidth/>
              <TextField type="email" label="Email" value={form.email} onChange={(e)=>set('email', e.target.value)} fullWidth/>
            </Stack>
            <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
              <TextField select label="Género" value={form.gender || ''} onChange={(e)=>set('gender', e.target.value)} fullWidth>
                <option value=""></option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
                <option value="prefer_not">Prefiro não dizer</option>
              </TextField>
              <TextField type="date" label="Data de nascimento" value={form.dob ? form.dob.substring(0,10) : ''} onChange={(e)=>set('dob', e.target.value)} InputLabelProps={{ shrink:true }} fullWidth/>
            </Stack>
            <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
              <TextField type="number" label="Altura (cm)" value={form.height_cm ?? ''} onChange={(e)=>set('height_cm', e.target.value===''?null:Number(e.target.value))} fullWidth/>
              <TextField type="number" label="Peso (kg)" value={form.weight_kg ?? ''} onChange={(e)=>set('weight_kg', e.target.value===''?null:Number(e.target.value))} fullWidth/>
            </Stack>
          </Stack>
        </Paper>

        {/* Avatar */}
        <Paper variant="outlined" sx={{ p:2, borderRadius:3 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb:1 }}>Avatar</Typography>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Avatar src={form.avatar_url || undefined} sx={{ width: 72, height: 72 }} />
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={pickFile} disabled={uploading}>{uploading?'A enviar…':'Carregar foto'}</Button>
              <Button variant="text" disabled={uploading || !form.avatar_url} onClick={()=>set('avatar_url','')}>Remover</Button>
            </Stack>
            <input ref={fileRef} hidden type="file" accept="image/*" onChange={onFileChange}/>
          </Stack>

          <Divider sx={{ my:2 }}/>
          {dirty && (
            <Stack direction="row" justifyContent="flex-end">
              <Button type="submit" variant="contained" disabled={saving || usernameError}>{saving?'A guardar…':'Guardar alterações'}</Button>
            </Stack>
          )}
          {!dirty && <Typography variant="caption" sx={{ opacity:.7 }}>Sem alterações por guardar.</Typography>}
        </Paper>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={2400} onClose={()=>setToast({...toast,open:false})}>
        <Alert variant="filled" severity={toast.sev} onClose={()=>setToast({...toast,open:false})}>{toast.msg}</Alert>
      </Snackbar>
    </form>
  );
}
