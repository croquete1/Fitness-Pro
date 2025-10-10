'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

type ClientOption = { id: string; name: string | null };

type Props = { variant?: 'contained' | 'outlined' };

export default function CreateTrainingPlanButton({ variant = 'contained' }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [clients, setClients] = React.useState<ClientOption[]>([]);
  const [loadingClients, setLoadingClients] = React.useState(false);
  const [clientId, setClientId] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadClients = React.useCallback(async () => {
    setLoadingClients(true);
    setError(null);
    try {
      const res = await fetch('/api/pt/clients', { cache: 'no-store' });
      const json = res.ok ? await res.json() : { items: [] };
      const opts = Array.isArray(json.items)
        ? json.items.map((c: any) => ({ id: String(c.id), name: c.full_name ?? null }))
        : [];
      setClients(opts);
    } catch {
      setClients([]);
      setError('Não foi possível carregar os clientes.');
    } finally {
      setLoadingClients(false);
    }
  }, []);

  const openDialog = () => {
    setOpen(true);
    if (!clients.length) void loadClients();
  };

  const closeDialog = () => {
    if (submitting) return;
    setOpen(false);
    setClientId('');
    setTitle('');
    setError(null);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clientId) {
      setError('Seleciona um cliente para continuar.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/pt/training-plans', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, title: title || undefined }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      const planId = json?.id;
      if (planId) {
        router.push(`/dashboard/pt/plans/${planId}/edit`);
      } else {
        throw new Error('missing_plan_id');
      }
      setOpen(false);
    } catch (err) {
      console.error('[pt] create training plan failed', err);
      setError('Não foi possível criar o plano. Tenta novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant={variant} onClick={openDialog} disabled={submitting}>
        + Novo plano
      </Button>
      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Criar plano de treino</DialogTitle>
        <DialogContent>
          <Stack component="form" onSubmit={onSubmit} spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Cliente"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              helperText="Escolhe o cliente que vai receber este plano"
              disabled={loadingClients}
            >
              <MenuItem value="" disabled>
                {loadingClients ? 'A carregar…' : 'Seleciona um cliente'}
              </MenuItem>
              {clients.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name ?? c.id}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Título do plano"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Hipertrofia 8 semanas"
            />

            {error && <Alert severity="error">{error}</Alert>}

            <DialogActions sx={{ px: 0 }}>
              <Button onClick={closeDialog} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? <CircularProgress size={18} /> : 'Criar plano'}
              </Button>
            </DialogActions>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
