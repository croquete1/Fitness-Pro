'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

type TrainerOption = {
  id: string;
  name: string | null;
  email: string | null;
  label: string;
};

export default function AdminUserRowActions({ id, currRole, currStatus }: { id: string; currRole: string; currStatus: string; }) {
  const [busy, setBusy] = React.useState(false);
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [trainerOptions, setTrainerOptions] = React.useState<TrainerOption[]>([]);
  const [trainersLoaded, setTrainersLoaded] = React.useState(false);
  const [trainerLoading, setTrainerLoading] = React.useState(false);
  const [trainerError, setTrainerError] = React.useState<string | null>(null);
  const [selectedTrainer, setSelectedTrainer] = React.useState<TrainerOption | null>(null);

  async function post(url: string, body?: any) {
    setBusy(true);
    try {
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
      location.reload();
    } finally {
      setBusy(false);
    }
  }

  const loadTrainers = React.useCallback(async () => {
    setTrainerLoading(true);
    setTrainerError(null);
    try {
      const res = await fetch('/api/admin/lookup/people?role=pt', { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const rows = Array.isArray(data?.rows) ? data.rows : [];
      const options = rows.map((row: any) => {
        const name = row?.name ?? null;
        const email = row?.email ?? null;
        const label = [name, email].filter(Boolean).join(' · ') || String(row?.id ?? 'PT');
        return { id: String(row?.id), name, email, label } as TrainerOption;
      });
      setTrainerOptions(options);
      setTrainersLoaded(true);
    } catch (error) {
      console.error('[admin] load trainers failed', error);
      setTrainerError('Não foi possível carregar os personal trainers.');
    } finally {
      setTrainerLoading(false);
    }
  }, []);

  const openAssignDialog = () => {
    setAnchor(null);
    setAssignOpen(true);
    setTrainerError(null);
    if (!trainersLoaded) {
      void loadTrainers();
    }
  };

  const closeAssignDialog = () => {
    if (busy) return;
    setAssignOpen(false);
    setSelectedTrainer(null);
  };

  const handleAssign = async () => {
    if (!selectedTrainer) return;
    setTrainerError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/admin/assign-pt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: id, trainer_id: selectedTrainer.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      location.reload();
    } catch (error) {
      console.error('[admin] assign trainer failed', error);
      setTrainerError('Não foi possível atribuir o cliente. Tenta novamente.');
      setBusy(false);
    }
  };

  const normalizedRole = currRole?.toUpperCase?.() ?? 'CLIENT';
  const isClient = normalizedRole.includes('CLIENT');

  return (
    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ flexWrap: 'wrap' }} useFlexGap>
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

      {isClient && (
        <Button size="small" variant="contained" onClick={openAssignDialog} disabled={busy}>
          Atribuir PT
        </Button>
      )}

      <Button
        size="small"
        variant={currStatus === 'ACTIVE' ? 'outlined' : 'contained'}
        color={currStatus === 'ACTIVE' ? 'warning' : 'success'}
        onClick={() => post(`/api/admin/users/${id}/status`, { status: currStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' })}
        disabled={busy}
      >
        {currStatus === 'ACTIVE' ? 'Desativar' : 'Ativar'}
      </Button>

      <Dialog open={assignOpen} onClose={closeAssignDialog} fullWidth maxWidth="xs">
        <DialogTitle>Atribuir cliente a um personal trainer</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Seleciona o personal trainer responsável por acompanhar este cliente.
          </Typography>
          <Autocomplete
            value={selectedTrainer}
            onChange={(_, value) => setSelectedTrainer(value)}
            options={trainerOptions}
            loading={trainerLoading}
            disabled={trainerLoading && !trainersLoaded}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText={trainerLoading ? 'A carregar…' : 'Sem personal trainers disponíveis.'}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Personal trainer"
                placeholder="Procurar por nome ou email"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {trainerLoading ? <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          {trainerError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {trainerError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAssignDialog} disabled={busy}>Cancelar</Button>
          <Button onClick={handleAssign} disabled={!selectedTrainer || busy} variant="contained">
            Atribuir
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
