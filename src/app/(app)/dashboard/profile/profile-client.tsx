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

export default function ProfileClient({ model }: { model: { id:string; name:string; email:string; username:string; avatar_url:string; role:string }}) {
  const [name, setName] = React.useState(model.name);
  const [username, setUsername] = React.useState(model.username);
  const [avatar, setAvatar] = React.useState(model.avatar_url);
  const [saving, setSaving] = React.useState(false);
  const [ok, setOk] = React.useState<string| null>(null);

  async function save() {
    setSaving(true); setOk(null);
    try {
      const res = await fetch('/api/profile', { method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name, username, avatar_url: avatar }) });
      const json = await res.json();
      if (res.ok && json?.ok) setOk('Guardado!');
      else setOk('Erro ao guardar');
    } finally { setSaving(false); }
  }

  return (
    <Box sx={{ p:2, maxWidth: 800 }}>
      <Card variant="outlined" sx={{ borderRadius:3 }}>
        <CardHeader title="O meu perfil" subheader={model.role} />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs:12, sm:4 }}>
              <Box sx={{ display:'grid', placeItems:'center', gap:1 }}>
                <Avatar src={avatar||undefined} sx={{ width:96, height:96 }} />
                <TextField label="Avatar URL" value={avatar} onChange={(e)=>setAvatar(e.target.value)} fullWidth />
              </Box>
            </Grid>
            <Grid size={{ xs:12, sm:8 }}>
              <TextField label="Nome" value={name} onChange={(e)=>setName(e.target.value)} fullWidth sx={{ mb:2 }} />
              <TextField label="Email" value={model.email} disabled fullWidth sx={{ mb:2 }} />
              <TextField label="Username" value={username} onChange={(e)=>setUsername(e.target.value)} fullWidth />
              <Box sx={{ display:'flex', gap:1, mt:2 }}>
                <Button onClick={save} disabled={saving} variant="contained">Guardar</Button>
                {ok && <Typography variant="body2" sx={{ alignSelf:'center', opacity:.8 }}>{ok}</Typography>}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
