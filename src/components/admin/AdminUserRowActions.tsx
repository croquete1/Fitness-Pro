'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export default function AdminUserRowActions({ id, currRole, currStatus }: { id: string; currRole: string; currStatus: string; }) {
  const [busy, setBusy] = React.useState(false);
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);

  async function post(url: string, body?: any) {
    setBusy(true);
    try {
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
      location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack direction="row" spacing={1} justifyContent="flex-end">
      <Button size="small" variant="outlined" onClick={(e) => setAnchor(e.currentTarget)} disabled={busy}>
        Role: {currRole}
      </Button>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {['CLIENT','PT','TRAINER','ADMIN'].map((r) => (
          <MenuItem key={r} onClick={() => { setAnchor(null); post(`/api/admin/users/${id}/role`, { role: r }); }}>
            {r}
          </MenuItem>
        ))}
      </Menu>

      <Button
        size="small"
        variant={currStatus === 'ACTIVE' ? 'outlined' : 'contained'}
        color={currStatus === 'ACTIVE' ? 'warning' : 'success'}
        onClick={() => post(`/api/admin/users/${id}/status`, { status: currStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' })}
        disabled={busy}
      >
        {currStatus === 'ACTIVE' ? 'Desativar' : 'Ativar'}
      </Button>
    </Stack>
  );
}
