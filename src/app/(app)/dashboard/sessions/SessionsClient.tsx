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
  MenuItem,
  CircularProgress,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

export type AttendanceStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | null;

export type ClientSession = {
  id: string;
  startISO: string | null;
  endISO: string | null;
  durationMin: number | null;
  location: string | null;
  notes: string | null;
  trainerName: string | null;
  trainerEmail: string | null;
  status: string | null;
  attendanceStatus: AttendanceStatus;
  attendanceAt: string | null;
};

export type SessionRequestStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'cancelled'
  | 'reschedule_pending'
  | 'reschedule_declined';

export type SessionRequest = {
  id: string;
  sessionId: string | null;
  status: SessionRequestStatus;
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
  trainer: { id: string; name: string | null; email: string | null } | null;
};

type TrainerOption = {
  id: string;
  name: string | null;
  email: string | null;
  status: string | null;
};

type Props = {
  initialSessions: ClientSession[];
  initialRequests: SessionRequest[];
};

function attendanceChip(status: AttendanceStatus) {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmada', color: 'success' as const };
    case 'completed':
      return { label: 'Concluída', color: 'primary' as const };
    case 'cancelled':
      return { label: 'Cancelada', color: 'default' as const };
    case 'no_show':
      return { label: 'Faltou', color: 'warning' as const };
    default:
      return { label: 'Por confirmar', color: 'default' as const };
  }
}

function requestStatusChip(status: SessionRequestStatus) {
  switch (status) {
    case 'pending':
      return { label: 'Aguardando aprovação', color: 'warning' as const };
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

function toDate(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(value: string | null) {
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

function formatRange(startISO: string | null, endISO: string | null) {
  if (!startISO) return 'Data por definir';
  const start = formatDate(startISO);
  if (!endISO) return start;
  const end = formatTime(endISO);
  return `${start} — ${end}`;
}

function trainerDisplay(trainer: SessionRequest['trainer']) {
  if (!trainer) return 'Personal trainer';
  if (trainer.name && trainer.email) return `${trainer.name} (${trainer.email})`;
  return trainer.name ?? trainer.email ?? 'Personal trainer';
}

export default function SessionsClient({ initialSessions, initialRequests }: Props) {
  const [sessions, setSessions] = React.useState<ClientSession[]>(initialSessions);
  const [requests, setRequests] = React.useState<SessionRequest[]>(initialRequests);
  const [sessionError, setSessionError] = React.useState<string | null>(null);
  const [requestError, setRequestError] = React.useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = React.useState<string | null>(null);
  const [busySessionId, setBusySessionId] = React.useState<string | null>(null);
  const [actionBusy, setActionBusy] = React.useState<string | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = React.useState(false);
  const [requestBusy, setRequestBusy] = React.useState(false);
  const [trainerOptions, setTrainerOptions] = React.useState<TrainerOption[]>([]);
  const [loadingTrainers, setLoadingTrainers] = React.useState(false);
  const [requestForm, setRequestForm] = React.useState({ trainerId: '', start: '', duration: 60, note: '' });

  const sortedSessions = React.useMemo(() => {
    return [...sessions].sort((a, b) => {
      const aTime = toDate(a.startISO)?.getTime() ?? 0;
      const bTime = toDate(b.startISO)?.getTime() ?? 0;
      return aTime - bTime;
    });
  }, [sessions]);

  const now = Date.now();
  const upcoming = sortedSessions.filter((s) => {
    const start = toDate(s.startISO);
    if (!start) return true;
    return start.getTime() >= now - 30 * 60 * 1000;
  });
  const past = sortedSessions.filter((s) => {
    const start = toDate(s.startISO);
    if (!start) return false;
    return start.getTime() < now - 30 * 60 * 1000;
  });

  const sortedRequests = React.useMemo(() => {
    return [...requests].sort((a, b) => {
      const aTime = toDate(a.createdAt)?.getTime() ?? toDate(a.requestedStart)?.getTime() ?? 0;
      const bTime = toDate(b.createdAt)?.getTime() ?? toDate(b.requestedStart)?.getTime() ?? 0;
      return bTime - aTime;
    });
  }, [requests]);

  const openRequests = sortedRequests.filter((r) => r.status === 'pending' || r.status === 'reschedule_pending');
  const historyRequests = sortedRequests.filter((r) => !openRequests.includes(r));

  async function updateAttendance(sessionId: string, status: NonNullable<AttendanceStatus>) {
    setBusySessionId(sessionId);
    setSessionError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/attendance`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Falha ao atualizar presença');
      }
      const json = await res.json().catch(() => ({}));
      setSessions((prev) => prev.map((s) => (
        s.id === sessionId
          ? { ...s, attendanceStatus: status, attendanceAt: json.at ?? new Date().toISOString() }
          : s
      )));
    } catch (e: any) {
      setSessionError(e?.message || 'Não foi possível atualizar a presença');
    } finally {
      setBusySessionId(null);
    }
  }

  React.useEffect(() => {
    if (!requestDialogOpen || trainerOptions.length > 0 || loadingTrainers) return;
    setLoadingTrainers(true);
    fetch('/api/client/trainers?limit=50', { cache: 'no-store' })
      .then((res) => res.json().catch(() => ({})))
      .then((json) => {
        if (Array.isArray(json?.trainers)) {
          setTrainerOptions(json.trainers as TrainerOption[]);
        } else {
          setTrainerOptions([]);
        }
      })
      .catch(() => setTrainerOptions([]))
      .finally(() => setLoadingTrainers(false));
  }, [requestDialogOpen, trainerOptions.length, loadingTrainers]);

  async function submitRequest() {
    if (!requestForm.trainerId) {
      setRequestError('Selecciona o personal trainer.');
      return;
    }
    if (!requestForm.start) {
      setRequestError('Indica data e hora pretendidas.');
      return;
    }
    const duration = Number(requestForm.duration);
    if (!duration || duration <= 0) {
      setRequestError('Define uma duração válida (minutos).');
      return;
    }

    const startDate = new Date(requestForm.start);
    if (Number.isNaN(startDate.getTime())) {
      setRequestError('Data/hora inválida.');
      return;
    }
    const endDate = new Date(startDate.getTime() + duration * 60000);

    setRequestBusy(true);
    setRequestError(null);
    setRequestSuccess(null);
    try {
      const res = await fetch('/api/client/session-requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          trainerId: requestForm.trainerId,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          note: requestForm.note?.trim() || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.details || json?.error || 'Não foi possível criar o pedido.');
      }
      if (json?.request) {
        setRequests((prev) => [json.request as SessionRequest, ...prev]);
      }
      setRequestSuccess('Pedido enviado — o PT será notificado.');
      setRequestDialogOpen(false);
      setRequestForm({ trainerId: '', start: '', duration: 60, note: '' });
    } catch (e: any) {
      setRequestError(e?.message || 'Não foi possível criar o pedido.');
    } finally {
      setRequestBusy(false);
    }
  }

  async function mutateRequest(id: string, action: 'cancel' | 'accept_reschedule' | 'decline_reschedule', successMsg: string) {
    setActionBusy(`${id}:${action}`);
    setRequestError(null);
    setRequestSuccess(null);
    try {
      const res = await fetch(`/api/client/session-requests/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const text = await res.text();
      let json: any = {};
      try { json = text ? JSON.parse(text) : {}; } catch { json = {}; }
      if (!res.ok) {
        throw new Error(json?.details || json?.error || text || 'Falha ao actualizar pedido.');
      }
      if (json?.request) {
        setRequests((prev) => prev.map((req) => (req.id === id ? (json.request as SessionRequest) : req)));
      }
      if (successMsg) setRequestSuccess(successMsg);
    } catch (e: any) {
      setRequestError(e?.message || 'Não foi possível actualizar o pedido.');
    } finally {
      setActionBusy(null);
    }
  }

  function renderSession(session: ClientSession) {
    const attendance = attendanceChip(session.attendanceStatus);
    const start = formatDate(session.startISO);
    return (
      <Paper key={session.id} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'grid', gap: 1.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" fontWeight={700}>{start}</Typography>
            {session.location && (
              <Typography variant="body2" color="text.secondary">Local: {session.location}</Typography>
            )}
            {session.trainerName && (
              <Typography variant="body2" color="text.secondary">Personal Trainer: {session.trainerName}</Typography>
            )}
            {session.notes && (
              <Typography variant="body2" color="text.secondary">Notas: {session.notes}</Typography>
            )}
          </Stack>
          <Chip
            size="small"
            label={attendance.label}
            color={attendance.color}
            variant={attendance.color === 'default' ? 'outlined' : 'filled'}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CalendarMonthOutlinedIcon fontSize="small" />}
            component="a"
            href={`/api/sessions/${session.id}/ics`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Adicionar ao calendário
          </Button>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {session.attendanceStatus !== 'confirmed' && session.attendanceStatus !== 'completed' && (
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlineIcon fontSize="small" />}
                disabled={busySessionId === session.id}
                onClick={() => updateAttendance(session.id, 'confirmed')}
              >
                Confirmar presença
              </Button>
            )}
            {session.attendanceStatus !== 'completed' && (
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<DoneAllIcon fontSize="small" />}
                disabled={busySessionId === session.id}
                onClick={() => updateAttendance(session.id, 'completed')}
              >
                Marcar como concluída
              </Button>
            )}
          </Stack>
        </Stack>
        {session.attendanceAt && (
          <Typography variant="caption" color="text.secondary">
            Última atualização: {formatDate(session.attendanceAt)}
          </Typography>
        )}
      </Paper>
    );
  }

  function renderRequest(request: SessionRequest) {
    const status = requestStatusChip(request.status);
    const actionKey = (suffix: string) => `${request.id}:${suffix}`;
    return (
      <Paper key={request.id} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'grid', gap: 1.25 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} alignItems={{ sm: 'center' }}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" fontWeight={700}>{trainerDisplay(request.trainer)}</Typography>
            <Typography variant="body2" color="text.secondary">
              Pedido original: {formatRange(request.requestedStart, request.requestedEnd)}
            </Typography>
            {request.status === 'reschedule_pending' && (
              <Typography variant="body2" color="info.main">
                Proposta do PT: {formatRange(request.proposedStart, request.proposedEnd)}
              </Typography>
            )}
            {request.message && (
              <Typography variant="body2" color="text.secondary">Mensagem enviada: {request.message}</Typography>
            )}
            {request.trainerNote && (
              <Typography variant="body2" color="text.secondary">Nota do PT: {request.trainerNote}</Typography>
            )}
            {request.rescheduleNote && (
              <Typography variant="body2" color="text.secondary">Nota da remarcação: {request.rescheduleNote}</Typography>
            )}
            {request.respondedAt && (
              <Typography variant="caption" color="text.secondary">Atualizado: {formatDate(request.respondedAt)}</Typography>
            )}
          </Stack>
          <Chip label={status.label} color={status.color} variant={status.color === 'default' ? 'outlined' : 'filled'} />
        </Stack>
        {(request.status === 'pending' || request.status === 'reschedule_pending') && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {request.status === 'pending' && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelOutlinedIcon fontSize="small" />}
                disabled={actionBusy === actionKey('cancel')}
                onClick={() => mutateRequest(request.id, 'cancel', 'Pedido cancelado.')}
              >
                Cancelar pedido
              </Button>
            )}
            {request.status === 'reschedule_pending' && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<EventAvailableOutlinedIcon fontSize="small" />}
                  disabled={actionBusy === actionKey('accept_reschedule')}
                  onClick={() => mutateRequest(request.id, 'accept_reschedule', 'Remarcação aceite com sucesso.')}
                >
                  Aceitar proposta
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<HighlightOffIcon fontSize="small" />}
                  disabled={actionBusy === actionKey('decline_reschedule')}
                  onClick={() => mutateRequest(request.id, 'decline_reschedule', 'Remarcação recusada.')}
                >
                  Recusar proposta
                </Button>
              </Stack>
            )}
          </Stack>
        )}
      </Paper>
    );
  }

  const availableTrainers = React.useMemo(() => {
    return trainerOptions.filter((trainer) => (trainer.status ?? '').toUpperCase() !== 'SUSPENDED');
  }, [trainerOptions]);

  return (
    <Paper elevation={0} sx={{ p: 2, display: 'grid', gap: 3 }}>
      <Typography variant="h6" fontWeight={800}>As minhas sessões</Typography>

      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5}>
          <Typography variant="subtitle1" fontWeight={700}>Pedidos de sessão</Typography>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => {
              setRequestDialogOpen(true);
              setRequestError(null);
              setRequestSuccess(null);
            }}
          >
            Solicitar sessão
          </Button>
        </Stack>
        {requestError && (
          <Alert severity="error" onClose={() => setRequestError(null)}>{requestError}</Alert>
        )}
        {requestSuccess && (
          <Alert severity="success" onClose={() => setRequestSuccess(null)}>{requestSuccess}</Alert>
        )}
        <Stack spacing={1.5}>
          <Typography variant="subtitle2" fontWeight={700}>Pendentes</Typography>
          {openRequests.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Nenhum pedido pendente neste momento.</Typography>
          ) : (
            <Stack spacing={1.25}>{openRequests.map(renderRequest)}</Stack>
          )}
        </Stack>
        <Divider />
        <Stack spacing={1.5}>
          <Typography variant="subtitle2" fontWeight={700}>Histórico</Typography>
          {historyRequests.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Sem pedidos anteriores registados.</Typography>
          ) : (
            <Stack spacing={1.25}>{historyRequests.map(renderRequest)}</Stack>
          )}
        </Stack>
      </Stack>

      <Divider />

      {sessionError && <Alert severity="error" onClose={() => setSessionError(null)}>{sessionError}</Alert>}

      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={700}>Próximas sessões</Typography>
        {upcoming.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Não tens sessões marcadas para os próximos dias.</Typography>
        ) : (
          <Stack spacing={1.5}>{upcoming.map(renderSession)}</Stack>
        )}
      </Stack>
      <Divider />
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={700}>Histórico recente</Typography>
        {past.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Ainda sem sessões passadas registadas.</Typography>
        ) : (
          <Stack spacing={1.5}>{past.map(renderSession)}</Stack>
        )}
      </Stack>

      <Dialog
        open={requestDialogOpen}
        onClose={() => {
          if (!requestBusy) setRequestDialogOpen(false);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Solicitar nova sessão</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 1 }}>
          <TextField
            select
            label="Personal trainer"
            value={requestForm.trainerId}
            onChange={(event) => setRequestForm((prev) => ({ ...prev, trainerId: event.target.value }))}
            helperText={loadingTrainers ? 'A carregar treinadores…' : 'Escolhe o profissional com quem queres treinar.'}
            disabled={requestBusy || loadingTrainers}
            required
          >
            {availableTrainers.map((trainer) => (
              <MenuItem key={trainer.id} value={trainer.id}>
                {trainer.name ?? trainer.email ?? trainer.id}
              </MenuItem>
            ))}
            {availableTrainers.length === 0 && !loadingTrainers && (
              <MenuItem disabled value="">
                Nenhum treinador disponível.
              </MenuItem>
            )}
          </TextField>
          <TextField
            type="datetime-local"
            label="Data e hora"
            value={requestForm.start}
            onChange={(event) => setRequestForm((prev) => ({ ...prev, start: event.target.value }))}
            required
            disabled={requestBusy}
          />
          <TextField
            type="number"
            label="Duração (minutos)"
            value={requestForm.duration}
            onChange={(event) => setRequestForm((prev) => ({ ...prev, duration: Number(event.target.value) }))}
            inputProps={{ min: 15, step: 5 }}
            disabled={requestBusy}
          />
          <TextField
            label="Notas para o PT"
            multiline
            minRows={3}
            value={requestForm.note}
            onChange={(event) => setRequestForm((prev) => ({ ...prev, note: event.target.value }))}
            placeholder="Objetivo da sessão, local preferido, etc."
            disabled={requestBusy}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRequestDialogOpen(false)} disabled={requestBusy}>Cancelar</Button>
          <Button onClick={submitRequest} disabled={requestBusy} variant="contained">
            {requestBusy ? 'A enviar…' : 'Enviar pedido'}
          </Button>
        </DialogActions>
        {loadingTrainers && (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ pb: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="caption" color="text.secondary">A carregar lista de treinadores…</Typography>
          </Stack>
        )}
      </Dialog>
    </Paper>
  );
}
