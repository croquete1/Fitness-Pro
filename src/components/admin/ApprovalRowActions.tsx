// src/components/admin/ApprovalRowActions.tsx
'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

export default function ApprovalRowActions({ id }: { id: string }) {
  const [busy, setBusy] = React.useState<string | null>(null);

  async function doAction(path: string) {
    setBusy(path);
    try {
      const r = await fetch(path, { method: 'POST' });
      if (r.ok) location.reload();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Stack direction="row" spacing={1}>
      <Button
        size="small"
        variant="contained"
        disabled={!!busy}
        onClick={() => doAction(`/api/admin/approvals/${id}/approve`)}
      >
        {busy?.includes('approve') ? 'A aprovar…' : 'Aprovar'}
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="error"
        disabled={!!busy}
        onClick={() => doAction(`/api/admin/approvals/${id}/reject`)}
      >
        {busy?.includes('reject') ? 'A rejeitar…' : 'Rejeitar'}
      </Button>
    </Stack>
  );
}
