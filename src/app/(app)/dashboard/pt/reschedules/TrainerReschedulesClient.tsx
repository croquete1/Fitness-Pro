'use client';

import * as React from 'react';
import {
  Alert,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';

export type TrainerRequest = {
  id: string;
  sessionId: string | null;
  status: string;
  requestedStart: string | null;
  requestedEnd: string | null;
  proposedStart: string | null;
  proposedEnd: string | null;
  message: string | null;
  trainerNote: string | null;
  rescheduleNote: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  respondedAt: string | null;
  proposedAt: string | null;
  client: { id: string; name: string | null; email: string | null } | null;
};

export type TrainerAgendaSession = {
  id: string;
  start: string | null;
  end: string | null;
  durationMin: number;
  location: string | null;
  status: string | null;
  client: { id: string; name: string | null } | null;
};

type Props = {
  initialRequests: TrainerRequest[];
  weeklySessions: TrainerAgendaSession[];
};

function toDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateTime(value: string | null) {
  const d = toDate(value);
  if (!d) return 'Data por definir';
  return d.toLocaleString('pt-PT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTime(value: string | null) {
  const d = toDate(value);
  if (!d) return '—';
  return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}

function formatRange(start: string | null, end: string | null) {
  if (!start) return 'Data por definir';
  const startStr = formatDateTime(start);
  if (!end) return startStr;
  return `${startStr} — ${formatTime(end)}`;
}

function clientDisplay(client: TrainerRequest['client']) {
  if (!client) return 'Cliente indefinido';
  if (client.name && client.email) return `${client.name} (${client.email})`;
  return client.name ?? client.email ?? client.id;
}

function requestStatusInfo(status: string) {
  const normalized = status?.toLowerCase();
  switch (normalized) {
    case 'pending':
      return { label: 'Aguardando', color: 'warning' as const };
    case 'accepted':
      return { label: 'Aceite', color: 'success' as const };
    case 'declined':
      return { label: 'Recusado', color: 'error' as const };
    case 'cancelled':
      return { label: 'Cancelado', color: 'default' as const };
    case 'reschedule_pending':
      return { label: 'Remarcação pendente', color: 'info' as const };
    case 'reschedule_declined':
      return { label: 'Remarcação recusada', color: 'warning' as const };
    default:
      return { label: status, color: 'default' as const };
  }
}

function sessionStatusChip(status: string | null | undefined) {
  if (!status) return null;
  const normalized = status.toString().toLowerCase();
  if (normalized === 'scheduled') return { label: 'Agendado', color: 'info' as const };
  if (normalized === 'done' || normalized === 'completed') return { label: 'Concluído', color: 'success' as const };
  if (normalized === 'cancelled') return { label: 'Cancelado', color: 'error' as const };
  return { label: status, color: 'default' as const };
}

export default function TrainerReschedulesClient({ initialRequests, weeklySessions }: Props) {
  const [requests, setRequests] = React.useState<TrainerRequest[]>(initialRequests);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [actionBusy, setActionBusy] = React.useState<string | null>(null);
  const [declineDialog, setDeclineDialog] = React.useState<{ id: string; note: string } | null>(null);
  const [rescheduleDialog, setRescheduleDialog] = React.useState<{ id: string; start: string; duration: number; note: string } | null>(null);

  const sortedRequests = React.useMemo(() => {
    return [...requests].sort((a, b) => {
      const aTime = toDate(a.createdAt)?.getTime() ?? toDate(a.requestedStart)?.getTime() ?? 0;
      const bTime = toDate(b.createdAt)?.getTime() ?? toDate(b.requestedStart)?.getTime() ?? 0;
      return bTime - aTime;
    });
  }, [requests]);

  const pendingRequests = sortedRequests.filter((r) => r.status === 'pending');
  const otherRequests = sortedRequests.filter((r) => r.status !== 'pending');

  const sessionsByDay = React.useMemo(() => {
    const groups = new Map<string, TrainerAgendaSession[]>();
    for (const session of weeklySessions) {
      const dayKey = toDate(session.start)?.toISOString().slice(0, 10) ?? 'sem-data';
      const list = groups.get(dayKey) ?? [];
      list.push(session);
      groups.set(dayKey, list);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [weeklySessions]);

  async function mutateRequest(id: string, payload: Record<string, any>, successMsg: string) {
    setActionBusy(`${id}:${payload.action}`);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/trainer/session-requests/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let json: any = {};
      try { json = text ? JSON.parse(text) : {}; } catch { json = {}; }
      if (!res.ok) {
        throw new Error(json?.details || json?.error || text || 'Operação falhou.');
      }
      if (json?.request) {
        setRequests((prev) => prev.map((req) => (req.id === id ? (json.request as TrainerRequest) : req)));
      }
      if (successMsg) setSuccess(successMsg);
    } catch (e: any) {
      setError(e?.message || 'Não foi possível actualizar o pedido.');
    } finally {
      setActionBusy(null);
    }
  }

  function openRescheduleDialog(request: TrainerRequest) {
    const baseStart = request.requestedStart ?? request.proposedStart ?? '';
    const startLocal = baseStart ? new Date(baseStart) : null;
    const localValue = startLocal
      ? new Date(startLocal.getTime() - startLocal.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : '';
    const duration = request.requestedEnd && request.requestedStart
      ? Math.max(30, Math.round((toDate(request.requestedEnd)!.getTime() - toDate(request.requestedStart)!.getTime()) / 60000))
      : 60;
    setRescheduleDialog({ id: request.id, start: localValue, duration, note: '' });
  }

  return (
    <Paper elevation={0} sx={{ p: 2, display: 'grid', gap: 3 }}>
      <Typography variant="h6" fontWeight={800}>Remarcações e pedidos pendentes</Typography>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={700}>Pedidos por aprovar</Typography>
        {pendingRequests.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Sem pedidos em espera. Boa gestão!</Typography>
        ) : (
          <Stack spacing={1.5}>
            {pendingRequests.map((request) => (
              <Paper key={request.id} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'grid', gap: 1 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} alignItems={{ sm: 'center' }}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" fontWeight={700}>{clientDisplay(request.client)}</Typography>
                    <Typography variant="body2" color="text.secondary">Proposto: {formatRange(request.requestedStart, request.requestedEnd)}</Typography>
                    {request.message && (
                      <Typography variant="body2" color="text.secondary">Mensagem do cliente: {request.message}</Typography>
                    )}
                  </Stack>
                  <Chip label="A aguardar" color="warning" variant="outlined" />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleOutlineIcon fontSize="small" />}
                    disabled={actionBusy === `${request.id}:accept`}
                    onClick={() => mutateRequest(request.id, { action: 'accept' }, 'Sessão aceite e agendada.')}
                  >
                    Aceitar pedido
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<HighlightOffIcon fontSize="small" />}
                    disabled={actionBusy === `${request.id}:decline`}
                    onClick={() => setDeclineDialog({ id: request.id, note: '' })}
                  >
                    Recusar
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>

      <Divider />

      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={700}>Outros pedidos</Typography>
        {otherRequests.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Sem histórico adicional.</Typography>
        ) : (
          <Stack spacing={1.5}>
            {otherRequests.map((request) => {
              const normalized = request.status?.toString().toLowerCase();
              const isAwaitingClient = normalized === 'reschedule_pending';
              const canPropose = normalized === 'accepted' || normalized === 'reschedule_declined';
              const statusInfo = requestStatusInfo(request.status ?? '');
              return (
                <Paper key={request.id} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'grid', gap: 1 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} alignItems={{ sm: 'center' }}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" fontWeight={700}>{clientDisplay(request.client)}</Typography>
                      <Typography variant="body2" color="text.secondary">Pedido: {formatRange(request.requestedStart, request.requestedEnd)}</Typography>
                      {request.proposedStart && (
                        <Typography variant="body2" color={isAwaitingClient ? 'info.main' : 'text.secondary'}>
                          Última proposta: {formatRange(request.proposedStart, request.proposedEnd)}
                        </Typography>
                      )}
                      {request.rescheduleNote && (
                        <Typography variant="body2" color="text.secondary">Nota: {request.rescheduleNote}</Typography>
                      )}
                      {request.trainerNote && (
                        <Typography variant="body2" color="text.secondary">Nota anterior: {request.trainerNote}</Typography>
                      )}
                      {request.respondedAt && (
                        <Typography variant="caption" color="text.secondary">Actualizado: {formatDateTime(request.respondedAt)}</Typography>
                      )}
                    </Stack>
                    <Chip
                      label={statusInfo.label}
                      color={statusInfo.color}
                      variant={statusInfo.color === 'default' ? 'outlined' : 'filled'}
                    />
                  </Stack>
                  {isAwaitingClient && (
                    <Typography variant="body2" color="text.secondary">
                      Aguardando resposta do cliente à proposta de remarcação.
                    </Typography>
                  )}
                  {canPropose && (
                    <Button
                      variant="outlined"
                      startIcon={<EventRepeatOutlinedIcon fontSize="small" />}
                      onClick={() => openRescheduleDialog(request)}
                      disabled={actionBusy === `${request.id}:propose_reschedule`}
                    >
                      Propor nova remarcação
                    </Button>
                  )}
                </Paper>
              );
            })}
          </Stack>
        )}
      </Stack>

      <Divider />

      <Stack spacing={1.5}>
        <Typography variant="subtitle1" fontWeight={700}>Agenda da semana</Typography>
        {sessionsByDay.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Ainda não há sessões marcadas para esta semana.</Typography>
        ) : (
          <Stack spacing={1.25}>
            {sessionsByDay.map(([day, sessions]) => {
              const date = day !== 'sem-data' ? formatDateTime(`${day}T00:00:00Z`) : 'Data a definir';
              return (
                <Paper key={day} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'grid', gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>{date.split(',')[0]}</Typography>
                  <Stack spacing={0.75}>
                    {sessions.map((session) => {
                      const statusChip = sessionStatusChip(session.status);
                      return (
                        <Stack key={session.id} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                          <Stack spacing={0.25}>
                            <Typography fontWeight={600}>{session.client?.name ?? 'Cliente'}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatRange(session.start, session.end)}
                              {session.location ? ` · ${session.location}` : ''}
                            </Typography>
                          </Stack>
                          {statusChip && <Chip label={statusChip.label} color={statusChip.color} size="small" />}
                        </Stack>
                      );
                    })}
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Stack>

      <Dialog
        open={Boolean(declineDialog)}
        onClose={() => setDeclineDialog(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Recusar pedido</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Partilha uma nota opcional para o cliente saber o motivo.
          </Typography>
          <TextField
            label="Nota para o cliente"
            multiline
            minRows={3}
            value={declineDialog?.note ?? ''}
            onChange={(event) => setDeclineDialog((prev) => (prev ? { ...prev, note: event.target.value } : prev))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeclineDialog(null)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            startIcon={<HighlightOffIcon fontSize="small" />}
            onClick={() => {
              if (!declineDialog) return;
              mutateRequest(declineDialog.id, { action: 'decline', note: declineDialog.note || undefined }, 'Pedido recusado.');
              setDeclineDialog(null);
            }}
          >
            Confirmar recusa
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(rescheduleDialog)}
        onClose={() => setRescheduleDialog(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Propor nova remarcação</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2 }}>
          <TextField
            type="datetime-local"
            label="Novo início"
            value={rescheduleDialog?.start ?? ''}
            onChange={(event) => setRescheduleDialog((prev) => (prev ? { ...prev, start: event.target.value } : prev))}
            required
          />
          <TextField
            type="number"
            label="Duração (minutos)"
            value={rescheduleDialog?.duration ?? 60}
            onChange={(event) => setRescheduleDialog((prev) => (prev ? { ...prev, duration: Number(event.target.value) } : prev))}
            inputProps={{ min: 15, step: 5 }}
            required
          />
          <TextField
            label="Nota para o cliente"
            multiline
            minRows={3}
            value={rescheduleDialog?.note ?? ''}
            onChange={(event) => setRescheduleDialog((prev) => (prev ? { ...prev, note: event.target.value } : prev))}
            placeholder="Sugere o motivo ou logística da nova data."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRescheduleDialog(null)}>Cancelar</Button>
          <Button
            variant="contained"
            startIcon={<EventAvailableOutlinedIcon fontSize="small" />}
            disabled={actionBusy === `${rescheduleDialog?.id}:propose_reschedule`}
            onClick={() => {
              if (!rescheduleDialog) return;
              if (!rescheduleDialog.start) {
                setError('Indica a data para a remarcação.');
                return;
              }
              const duration = Number(rescheduleDialog.duration);
              if (!duration || duration <= 0) {
                setError('Define uma duração válida.');
                return;
              }
              const startDate = new Date(rescheduleDialog.start);
              if (Number.isNaN(startDate.getTime())) {
                setError('Data/hora inválida.');
                return;
              }
              const endDate = new Date(startDate.getTime() + duration * 60000);
              mutateRequest(rescheduleDialog.id, {
                action: 'propose_reschedule',
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                note: rescheduleDialog.note || undefined,
              }, 'Proposta de remarcação enviada ao cliente.');
              setRescheduleDialog(null);
            }}
          >
            Enviar proposta
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
