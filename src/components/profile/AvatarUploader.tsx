'use client';
import * as React from 'react';
import { Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

export default function AvatarUploader({ onUploaded }: { onUploaded: (url: string) => void }) {
  const ref = React.useRef<HTMLInputElement | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
    const j = await r.json();
    if (r.ok && j?.url) onUploaded(j.url);
  }

  return (
    <>
      <input ref={ref} type="file" accept="image/*" hidden onChange={onPick} />
      <Button variant="outlined" startIcon={<EditIcon />} onClick={() => ref.current?.click()}>
        Alterar fotografia
      </Button>
    </>
  );
}
