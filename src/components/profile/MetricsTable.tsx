'use client';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

export default function MetricsTable({ points }: { points: { date: string; weight?: number | null; bodyfat_pct?: number | null }[] }) {
  const rows = [...points].reverse().slice(0, 30);
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Registos</Typography>
      <Table size="small">
        <TableHead>
          <TableRow><TableCell>Data</TableCell><TableCell>Peso (kg)</TableCell><TableCell>% Gordura</TableCell></TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>
              <TableCell>{new Date(r.date).toLocaleString('pt-PT')}</TableCell>
              <TableCell>{r.weight ?? '—'}</TableCell>
              <TableCell>{r.bodyfat_pct ?? '—'}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && <TableRow><TableCell colSpan={3} align="center">Sem registos.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Paper>
  );
}
