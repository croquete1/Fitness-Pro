'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { toast } from 'sonner';

export default function FileUploadField({
  label = 'Carregar imagem',
  onUploaded,
}: {
  label?: string;
  onUploaded: (path: string) => void;
}) {
  const ref = React.useRef<HTMLInputElement | null>(null);

  async function handleUpload(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/uploads/workout-photo', { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || 'Falha no upload');
    onUploaded(json.path);
    toast.success('Upload concluído');
  }

  return (
    <Box sx={{ display: 'inline-flex', gap: 1 }}>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const f = e.currentTarget.files?.[0];
          if (!f) return;
          try { await handleUpload(f); }
          catch (e: any) { toast.error(e?.message || 'Falha no upload'); }
          finally { e.currentTarget.value = ''; }
        }}
      />
      <Button variant="outlined" onClick={() => ref.current?.click()}>{label}</Button>
    </Box>
  );
}
