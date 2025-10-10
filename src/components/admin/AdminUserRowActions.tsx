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

type Option = {
  id: string;
  name: string | null;
  email: string | null;
  label: string;
};

type AssignMode = 'CLIENT_TO_TRAINER' | 'TRAINER_TO_CLIENT';

export default function AdminUserRowActions({ id, currRole, currStatus }: { id: string; currRole: string; currStatus: string; }) {
  const [busy, setBusy] = React.useState(false);
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  const [assignMode, setAssignMode] = React.useState<AssignMode | null>(null);
  const [trainerOptions, setTrainerOptions] = React.useState<Option[]>([]);
  const [clientOptions, setClientOptions] = React.useState<Option[]>([]);
  const [trainersLoaded, setTrainersLoaded] = React.useState(false);
  const [clientsLoaded, setClientsLoaded] = React.useState(false);
  const [trainerLoading, setTrainerLoading] = React.useState(false);
  const [clientLoading, setClientLoading] = React.useState(false);
  const [assignError, setAssignError] = React.useState<string | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<Option | null>(null);

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
    setAssignError(null);
    try {
      const res = await fetch('/api/admin/trainers?pageSize=200', { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const rows = Array.isArray(data?.rows) ? data.rows : [];
      const options = rows.map((row: any) => {
        const name = row?.name ?? null;
        const email = row?.email ?? null;
        const label = [name, email].filter(Boolean).join(' · ') || String(row?.id ?? 'PT');
        return { id: String(row?.id), name, email, label } as Option;
      });
      setTrainerOptions(options);
      setTrainersLoaded(true);
    } catch (error) {
      console.error('[admin] load trainers failed', error);
      setAssignError('Não foi possível carregar os personal trainers.');
    } finally {
      setTrainerLoading(false);
    }
  }, []);

  const loadClients = React.useCallback(async () => {
    setClientLoading(true);
    setAssignError(null);
    try {
      const res = await fetch('/api/admin/clients?pageSize=200', { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const rows = Array.isArray(data?.rows) ? data.rows : [];
      const options = rows.map((row: any) => {
        const name = row?.name ?? null;
        const email = row?.email ?? null;
        const label = [name, email].filter(Boolean).join(' · ') || String(row?.id ?? 'Cliente');
        return { id: String(row?.id), name, email, label } as Option;
      });
      setClientOptions(options);
      setClientsLoaded(true);
    } catch (error) {
      console.error('[admin] load clients failed', error);
      setAssignError('Não foi possível carregar os clientes.');
    } finally {
      setClientLoading(false);
    }
  }, []);

  const openAssignDialog = (mode: AssignMode) => {
    setAnchor(null);
    setAssignMode(mode);
    setAssignError(null);
    setSelectedOption(null);
    if (mode === 'CLIENT_TO_TRAINER' && !trainersLoaded) {
      void loadTrainers();
    }
    if (mode === 'TRAINER_TO_CLIENT' && !clientsLoaded) {
      void loadClients();
    }
  };

  const closeAssignDialog = () => {
    if (busy) return;
    setAssignMode(null);
    setSelectedOption(null);
    setAssignError(null);
  };

  const handleAssign = async () => {
    if (!assignMode || !selectedOption) return;
    setAssignError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/admin/assign-pt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          assignMode === 'CLIENT_TO_TRAINER'
            ? { user_id: id, trainer_id: selectedOption.id }
            : { user_id: selectedOption.id, trainer_id: id },
        ),
      });
      if (!res.ok) throw new Error(await res.text());
      location.reload();
    } catch (error) {
      console.error('[admin] assign trainer failed', error);
      setAssignError('Não foi possível concluir a atribuição. Tenta novamente.');
      setBusy(false);
    }
  };

  const normalizedRole = currRole?.toUpperCase?.() ?? 'CLIENT';
  const isClient = normalizedRole.includes('CLIENT');
  const isTrainer = normalizedRole.includes('TRAINER') || normalizedRole.includes('PT');

  const assigningTrainer = assignMode === 'CLIENT_TO_TRAINER';
  const options = assigningTrainer ? trainerOptions : clientOptions;
  const loading = assigningTrainer ? trainerLoading : clientLoading;

  const dialogTitle = assigningTrainer
    ? 'Atribuir cliente a um personal trainer'
    : 'Adicionar cliente a este personal trainer';

  const dialogDescription = assigningTrainer
    ? 'Seleciona o personal trainer responsável por acompanhar este cliente.'
    : 'Seleciona o cliente que queres associar a este personal trainer.';

  const fieldLabel = assigningTrainer ? 'Personal trainer' : 'Cliente';
  const fieldPlaceholder = assigningTrainer
    ? 'Procurar por nome ou email do PT'
    : 'Procurar por nome ou email do cliente';

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
        <Button size="small" variant="contained" onClick={() => openAssignDialog('CLIENT_TO_TRAINER')} disabled={busy}>
          Atribuir PT
        </Button>
      )}

      {isTrainer && (
        <Button size="small" variant="outlined" onClick={() => openAssignDialog('TRAINER_TO_CLIENT')} disabled={busy}>
          Adicionar cliente
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

      <Dialog open={assignMode !== null} onClose={closeAssignDialog} fullWidth maxWidth="xs">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {dialogDescription}
          </Typography>
          <Autocomplete
            value={selectedOption}
            onChange={(_, value) => setSelectedOption(value)}
            options={options}
            loading={loading}
            disabled={loading && !(assigningTrainer ? trainersLoaded : clientsLoaded)}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText={loading ? 'A carregar…' : 'Sem opções disponíveis.'}
            renderInput={(params) => (
              <TextField
                {...params}
                label={fieldLabel}
                placeholder={fieldPlaceholder}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          {assignError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {assignError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAssignDialog} disabled={busy}>Cancelar</Button>
          <Button onClick={handleAssign} disabled={!selectedOption || busy} variant="contained">
            Atribuir
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
