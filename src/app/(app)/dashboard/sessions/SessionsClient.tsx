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
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

type AttendanceStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | null;

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

type Props = {
  initialSessions: ClientSession[];
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

export default function SessionsClient({ initialSessions }: Props) {
  const [sessions, setSessions] = React.useState<ClientSession[]>(initialSessions);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  const sorted = React.useMemo(() => {
    return [...sessions].sort((a, b) => {
      const aTime = toDate(a.startISO)?.getTime() ?? 0;
      const bTime = toDate(b.startISO)?.getTime() ?? 0;
      return aTime - bTime;
    });
  }, [sessions]);

  const now = Date.now();
  const upcoming = sorted.filter((s) => {
    const start = toDate(s.startISO);
    if (!start) return true;
    return start.getTime() >= now - 30 * 60 * 1000;
  });
  const past = sorted.filter((s) => {
    const start = toDate(s.startISO);
    if (!start) return false;
    return start.getTime() < now - 30 * 60 * 1000;
  });

  async function updateAttendance(sessionId: string, status: NonNullable<AttendanceStatus>) {
    setBusy(sessionId);
    setError(null);
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
      setError(e?.message || 'Não foi possível atualizar a presença');
    } finally {
      setBusy(null);
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
                disabled={busy === session.id}
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
                disabled={busy === session.id}
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

  return (
    <Paper elevation={0} sx={{ p: 2, display: 'grid', gap: 3 }}>
      <Typography variant="h6" fontWeight={800}>As minhas sessões</Typography>
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
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
    </Paper>
  );
}
