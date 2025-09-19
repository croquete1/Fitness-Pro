'use client';

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

type Row = { id: string; name?: string|null; email?: string|null; role?: string|null; created_at?: string|null };

export default function AdminApprovalsClient({ initial }: { initial: Row[] }) {
  const [rows, setRows] = React.useState<Row[]>(initial);
  const [roleMenu, setRoleMenu] = React.useState<{ anchor: HTMLElement | null; id?: string }>({ anchor: null });

  async function approve(id: string, role?: string) {
    await fetch(`/api/admin/approvals/${id}/approve`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ role }) });
    setRows((r) => r.filter((x) => x.id !== id));
  }
  async function reject(id: string) {
    await fetch(`/api/admin/approvals/${id}/reject`, { method: 'POST' });
    setRows((r) => r.filter((x) => x.id !== id));
  }

  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>Aprovações pendentes</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Registo</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.name ?? '—'}</TableCell>
              <TableCell>{u.email ?? '—'}</TableCell>
              <TableCell>{u.role ?? '—'}</TableCell>
              <TableCell>{u.created_at ? new Date(u.created_at).toLocaleString('pt-PT') : '—'}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" variant="outlined" onClick={(e) => setRoleMenu({ anchor: e.currentTarget, id: u.id })}>
                    Aprovar como…
                  </Button>
                  <Button size="small" color="error" onClick={() => reject(u.id)}>Recusar</Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {!rows.length && (
            <TableRow><TableCell colSpan={5} align="center">Sem pendentes 🎉</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <Menu open={!!roleMenu.anchor} anchorEl={roleMenu.anchor} onClose={() => setRoleMenu({ anchor: null })}>
        {['CLIENT','PT','TRAINER','ADMIN'].map((r) => (
          <MenuItem key={r} onClick={() => { const id = roleMenu.id!; setRoleMenu({ anchor: null }); approve(id, r); }}>
            {r}
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
}
