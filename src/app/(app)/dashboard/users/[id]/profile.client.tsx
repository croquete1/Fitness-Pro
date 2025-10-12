'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Link as MuiLink,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import NotesIcon from '@mui/icons-material/Notes';
import LaunchIcon from '@mui/icons-material/Launch';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import { alpha, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { useToast } from '@/components/ui/ToastProvider';

type Role = 'ADMIN' | 'PT' | 'CLIENT';

export type TrainerOption = {
  id: string;
  name: string;
  email: string | null;
};

export type PlanSummary = {
  id: string;
  title: string | null;
  status: string | null;
  updatedAt: string | null;
  trainerName: string | null;
};

export type SessionSummary = {
  id: string;
  scheduledAt: string | null;
  durationMin: number | null;
  location: string | null;
  notes: string | null;
  trainerName: string | null;
};

export type MeasurementSnapshot = {
  id: string;
  date: string | null;
  weight: number | null;
  height: number | null;
  bodyFatPct: number | null;
  notes: string | null;
  waist: number | null;
  hip: number | null;
  chest: number | null;
  shoulders: number | null;
  neck: number | null;
  arm: number | null;
  thigh: number | null;
  calf: number | null;
};

export type ActivitySnapshot = {
  totalPlans: number;
  activePlans: number;
  draftPlans: number;
  archivedPlans: number;
  upcomingSessions: number;
  lastPlanUpdate: string | null;
  lastSession: string | null;
  lastActivity: string | null;
};

export type ProfileUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  status: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  lastSeenAt: string | null;
  online: boolean;
  avatarUrl: string | null;
  phone: string | null;
  username: string | null;
};

export type Viewer = {
  id: string;
  role: Role;
};

export type TrainerState = {
  current: TrainerOption | null;
  options: TrainerOption[];
  allowEdit: boolean;
};

export type ClientProfilePayload = {
  viewer: Viewer;
  user: ProfileUser;
  trainer: TrainerState;
  plans: PlanSummary[];
  upcomingSessions: SessionSummary[];
  recentSessions: SessionSummary[];
  measurement: MeasurementSnapshot | null;
  activity: ActivitySnapshot;
};

type NoteEntry = {
  id: string;
  createdAt: string;
  author: string;
  text: string;
};

type PackageRecord = {
  id: string;
  name?: string | null;
  status?: string | null;
  startedAt?: string | null;
  endsAt?: string | null;
  sessionsTotal?: number | null;
  sessionsUsed?: number | null;
  notes?: string | null;
};

type PackageState = {
  current: PackageRecord | null;
  history: PackageRecord[];
};

function roleDisplay(role: Role) {
  switch (role) {
    case 'ADMIN':
      return 'Administrador';
    case 'PT':
      return 'Personal Trainer';
    default:
      return 'Cliente';
  }
}

function statusDisplay(status: string | null) {
  if (!status) return '—';
  const normalized = status.toUpperCase();
  switch (normalized) {
    case 'ACTIVE':
      return 'Ativo';
    case 'SUSPENDED':
      return 'Suspenso';
    case 'PENDING':
      return 'Pendente';
    default:
      return normalized;
  }
}

function formatDate(value: string | null, opts?: Intl.DateTimeFormatOptions) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('pt-PT', {
      dateStyle: 'short',
      timeStyle: opts?.timeStyle ?? 'short',
      ...opts,
    }).format(new Date(value));
  } catch {
    return '—';
  }
}

function initialsFromName(name: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

function bmi(weight: number | null, height: number | null) {
  if (!weight || !height || height === 0) return null;
  const hMeters = height >= 3 ? height / 100 : height;
  const val = weight / (hMeters * hMeters);
  return Number.isFinite(val) ? Math.round(val * 10) / 10 : null;
}

function bmiClassification(value: number | null) {
  if (!value) return null;
  if (value < 18.5) return 'Abaixo do peso';
  if (value < 25) return 'Peso saudável';
  if (value < 30) return 'Pré-obesidade';
  if (value < 35) return 'Obesidade grau I';
  if (value < 40) return 'Obesidade grau II';
  return 'Obesidade grau III';
}

function summarizeMeasurement(measurement: MeasurementSnapshot | null) {
  if (!measurement) return null;
  const bmiValue = bmi(measurement.weight ?? null, measurement.height ?? null);
  return {
    bmi: bmiValue,
    weight: measurement.weight,
    height: measurement.height,
    bodyFat: measurement.bodyFatPct,
    notes: measurement.notes,
    date: measurement.date,
    waist: measurement.waist,
    hip: measurement.hip,
    chest: measurement.chest,
    shoulders: measurement.shoulders,
    neck: measurement.neck,
    arm: measurement.arm,
    thigh: measurement.thigh,
    calf: measurement.calf,
  };
}

function formatMeasurementValue(value: number | null, unit: string) {
  if (value == null) return '—';
  return `${value}${unit}`;
}

function packageStatusLabel(status?: string | null) {
  if (!status) return 'Sem estado';
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'Ativo';
    case 'PAUSED':
      return 'Em pausa';
    case 'ENDED':
    case 'CANCELLED':
      return 'Terminado';
    case 'UPCOMING':
      return 'Agendado';
    default:
      return status;
  }
}

function formatSessionsProgress(total?: number | null, used?: number | null) {
  if (total == null && used == null) return null;
  if (total == null) return used == null ? null : `${used} sessões registadas`;
  const safeUsed = Math.max(0, Math.min(used ?? 0, total));
  return `${safeUsed}/${total} sessões utilizadas`;
}

function packageStatusIcon(status?: string | null) {
  if (!status) return null;
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return <CheckCircleOutlineIcon fontSize="small" color="success" />;
    case 'PAUSED':
      return <HourglassBottomIcon fontSize="small" color="warning" />;
    case 'UPCOMING':
      return <HourglassBottomIcon fontSize="small" color="info" />;
    case 'ENDED':
    case 'CANCELLED':
      return <CheckCircleOutlineIcon fontSize="small" color="disabled" />;
    default:
      return null;
  }
}

function packageStatusColor(status?: string | null): 'default' | 'success' | 'warning' | 'info' | 'error' {
  if (!status) return 'default';
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'success';
    case 'PAUSED':
      return 'warning';
    case 'UPCOMING':
      return 'info';
    default:
      return 'default';
  }
}

function metricCard(
  label: string,
  value: React.ReactNode,
  accent: string,
  helper?: React.ReactNode,
) {
  return (
    <Box
      sx={({ palette }) => ({
        background: alpha(accent, palette.mode === 'dark' ? 0.25 : 0.12),
        border: '1px solid',
        borderColor: alpha(accent, palette.mode === 'dark' ? 0.7 : 0.3),
        borderRadius: 3,
        px: 2.25,
        py: 2,
        display: 'grid',
        gap: 0.5,
      })}
    >
      <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.8 }}>
        {label}
      </Typography>
      <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
      {helper ? (
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {helper}
        </Typography>
      ) : null}
    </Box>
  );
}

function sessionLine(session: SessionSummary) {
  return (
    <ListItem
      key={session.id}
      sx={{
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        mb: 1.5,
        alignItems: 'flex-start',
      }}
    >
      <ListItemAvatar sx={{ minWidth: 48 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          <EventAvailableIcon fontSize="small" />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {formatDate(session.scheduledAt)}
            </Typography>
            {session.durationMin ? (
              <Chip
                size="small"
                icon={<AccessTimeIcon fontSize="inherit" />}
                label={`${session.durationMin} min`}
              />
            ) : null}
            {session.location ? (
              <Chip size="small" label={session.location} />
            ) : null}
          </Stack>
        }
        secondary={
          <Stack spacing={0.5} sx={{ mt: 0.75 }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {session.notes ?? 'Sessão sem notas adicionais'}
            </Typography>
            {session.trainerName ? (
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Personal Trainer: {session.trainerName}
              </Typography>
            ) : null}
          </Stack>
        }
      />
    </ListItem>
  );
}

export default function ClientProfileClient({
  viewer,
  user,
  trainer,
  plans,
  upcomingSessions,
  recentSessions,
  measurement,
  activity,
}: ClientProfilePayload) {
  const theme = useTheme();
  const toast = useToast();
  const [trainerId, setTrainerId] = React.useState<string>(trainer.current?.id ?? '');
  const [savingTrainer, setSavingTrainer] = React.useState(false);
  const [packageState, setPackageState] = React.useState<PackageState>({ current: null, history: [] });
  const [loadingPackages, setLoadingPackages] = React.useState(true);
  const [notes, setNotes] = React.useState<NoteEntry[]>([]);
  const [loadingNotes, setLoadingNotes] = React.useState(true);
  const [noteText, setNoteText] = React.useState('');
  const [savingNote, setSavingNote] = React.useState(false);
  const noteTextTrimmed = noteText.trim();

  const measurementSummary = summarizeMeasurement(measurement);
  const currentPackage = packageState.current;
  const packageHistory = packageState.history;
  const circumferenceMetrics = React.useMemo(
    () =>
      measurementSummary
        ? (
            [
              { key: 'waist', label: 'Cintura', value: measurementSummary.waist },
              { key: 'hip', label: 'Anca', value: measurementSummary.hip },
              { key: 'chest', label: 'Peito', value: measurementSummary.chest },
              { key: 'shoulders', label: 'Ombros', value: measurementSummary.shoulders },
              { key: 'neck', label: 'Pescoço', value: measurementSummary.neck },
              { key: 'arm', label: 'Braço', value: measurementSummary.arm },
              { key: 'thigh', label: 'Coxa', value: measurementSummary.thigh },
              { key: 'calf', label: 'Barriga da perna', value: measurementSummary.calf },
            ] as const
          )
        : [],
    [measurementSummary],
  );
  const hasCircumferenceData = circumferenceMetrics.some((metric) => metric.value != null);
  const sessionNotes = React.useMemo(() => recentSessions.filter((session) => session.notes), [recentSessions]);
  const hasAutoNotes = Boolean(measurement?.notes || sessionNotes.length);

  async function saveTrainerLink() {
    if (!trainer.allowEdit) return;
    setSavingTrainer(true);
    try {
      const res = await fetch('/api/admin/trainer-clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: user.id, trainerId: trainerId || null }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Não foi possível atualizar o vínculo');
      }
      toast.success('Personal Trainer atualizado com sucesso');
    } catch (error: any) {
      toast.error(error?.message ?? 'Falha ao atualizar Personal Trainer');
    } finally {
      setSavingTrainer(false);
    }
  }

  const currentTrainerName = React.useMemo(() => {
    const match = trainer.options.find((t) => t.id === trainerId);
    return match?.name ?? trainer.current?.name ?? null;
  }, [trainer.options, trainerId, trainer.current]);

  React.useEffect(() => {
    let active = true;
    async function loadPackages() {
      try {
        setLoadingPackages(true);
        const res = await fetch(`/api/users/${user.id}/packages`);
        if (!res.ok) throw new Error('Não foi possível carregar os pacotes');
        const json = await res.json().catch(() => null);
        if (!active) return;
        const data = (json?.data ?? json ?? { current: null, history: [] }) as PackageState;
        setPackageState({
          current: data.current ?? null,
          history: Array.isArray(data.history) ? data.history : [],
        });
      } catch (error) {
        if (active) {
          setPackageState({ current: null, history: [] });
          toast.error('Não foi possível carregar os pacotes deste cliente');
        }
      } finally {
        if (active) setLoadingPackages(false);
      }
    }
    loadPackages();
    return () => {
      active = false;
    };
  }, [toast, user.id]);

  React.useEffect(() => {
    let active = true;
    async function loadNotes() {
      try {
        setLoadingNotes(true);
        const res = await fetch(`/api/users/${user.id}/notes`);
        if (!res.ok) throw new Error('Falha ao carregar notas');
        const json = await res.json().catch(() => null);
        if (!active) return;
        const list = (json?.data ?? json ?? []) as NoteEntry[];
        setNotes(Array.isArray(list) ? list : []);
      } catch (error) {
        if (active) {
          toast.error('Não foi possível carregar as notas do cliente');
          setNotes([]);
        }
      } finally {
        if (active) setLoadingNotes(false);
      }
    }
    loadNotes();
    return () => {
      active = false;
    };
  }, [toast, user.id]);

  async function submitNote(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const value = noteTextTrimmed;
    if (!value) {
      toast.error('Escreva uma nota antes de guardar');
      return;
    }
    try {
      setSavingNote(true);
      const body = new FormData();
      body.append('text', value);
      const res = await fetch(`/api/users/${user.id}/notes`, {
        method: 'POST',
        body,
      });
      if (!res.ok) throw new Error('Não foi possível guardar a nota');
      const json = await res.json().catch(() => null);
      const note = (json?.data ?? json) as NoteEntry | null;
      if (note) {
        setNotes((prev) => [note, ...prev]);
        setNoteText('');
        toast.success('Nota adicionada');
      }
    } catch (error) {
      toast.error('Falha ao guardar a nota');
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100%',
        py: { xs: 2, md: 4 },
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, rgba(22,30,45,0.95) 0%, rgba(11,16,28,0.98) 100%)'
          : 'linear-gradient(180deg, #f5f7fb 0%, #ffffff 65%)',
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 1.5, sm: 3, lg: 4 }, py: { xs: 2, md: 3 }, width: '100%' }}>
        <Grid container spacing={{ xs: 3, md: 4, xl: 5 }} alignItems="stretch">
          <Grid item xs={12} lg={4} xl={3}>
          <Stack spacing={3}>
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Stack spacing={2.5} alignItems="center" textAlign="center">
                  <Avatar
                    src={user.avatarUrl ?? undefined}
                    sx={{ width: 92, height: 92, bgcolor: 'primary.main', fontSize: 32, fontWeight: 700 }}
                  >
                    {initialsFromName(user.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {user.name ?? user.email ?? 'Utilizador'}
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                      <Chip size="small" label={roleDisplay(user.role)} color={user.role === 'ADMIN' ? 'secondary' : user.role === 'PT' ? 'primary' : 'default'} />
                      <Chip
                        size="small"
                        label={statusDisplay(user.status)}
                        color={user.status?.toUpperCase() === 'ACTIVE' ? 'success' : user.status?.toUpperCase() === 'PENDING' ? 'warning' : 'default'}
                      />
                    </Stack>
                  </Box>

                  <Divider flexItem sx={{ borderStyle: 'dashed' }} />

                  <Stack spacing={1.5} sx={{ width: '100%' }}>
                    <InfoRow icon={<EmailOutlinedIcon fontSize="small" />} label="Email" value={user.email ?? '—'} href={user.email ? `mailto:${user.email}` : undefined} />
                    <InfoRow icon={<PhoneOutlinedIcon fontSize="small" />} label="Telefone" value={user.phone ?? '—'} href={user.phone ? `tel:${user.phone}` : undefined} />
                    <InfoRow icon={<PersonOutlineIcon fontSize="small" />} label="Username" value={user.username ?? '—'} />
                    <InfoRow icon={<AssignmentIndIcon fontSize="small" />} label="ID do utilizador" value={user.id} copyable />
                  </Stack>

                  <Divider flexItem sx={{ borderStyle: 'dashed' }} />

                  <Stack spacing={0.5} sx={{ width: '100%' }}>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Estado atual
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                      <Chip
                        size="small"
                        label={user.online ? 'Online agora' : 'Offline'}
                        color={user.online ? 'success' : 'default'}
                        variant={user.online ? 'filled' : 'outlined'}
                      />
                      {!user.online && user.lastSeenAt ? (
                        <Typography variant="body2" color="text.secondary">
                          Visto {formatDate(user.lastSeenAt, { timeStyle: 'short' })}
                        </Typography>
                      ) : null}
                    </Stack>
                    <Typography variant="caption" sx={{ opacity: 0.7, mt: 1 }}>
                      Último acesso
                    </Typography>
                    <Typography variant="body2">{formatDate(user.lastSignInAt)}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, mt: 1 }}>
                      Última vez online
                    </Typography>
                    <Typography variant="body2">{formatDate(user.lastSeenAt)}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, mt: 1 }}>
                      Conta criada em
                    </Typography>
                    <Typography variant="body2">{formatDate(user.createdAt)}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <CardHeader
                avatar={<FitnessCenterIcon color="primary" />}
                title="Resumo de atividade"
                subheader={activity.lastActivity ? `Última atualização: ${formatDate(activity.lastActivity)}` : 'Sem atividade recente'}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    {metricCard('Planos de treino', activity.totalPlans, theme.palette.primary.main, `Ativos: ${activity.activePlans} · Rascunhos: ${activity.draftPlans}`)}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {metricCard('Sessões futuras', activity.upcomingSessions, theme.palette.success.main, activity.lastSession ? `Última sessão: ${formatDate(activity.lastSession)}` : 'Sem sessões realizadas')}
                  </Grid>
                  <Grid item xs={12}>
                    {metricCard('Planos arquivados', activity.archivedPlans, theme.palette.warning.main, activity.lastPlanUpdate ? `Última atualização: ${formatDate(activity.lastPlanUpdate)}` : undefined)}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <CardHeader
                avatar={<NotesIcon color="primary" />}
                title="Última avaliação física"
                subheader={measurementSummary?.date ? formatDate(measurementSummary.date) : 'Sem registos ainda'}
              />
            <CardContent>
              {measurementSummary ? (
                <Stack spacing={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      {metricCard(
                        'Peso',
                        measurementSummary.weight ? `${measurementSummary.weight} kg` : '—',
                        theme.palette.info.main,
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      {metricCard(
                        'Altura',
                        measurementSummary.height ? `${measurementSummary.height} cm` : '—',
                        theme.palette.info.main,
                        measurementSummary.height && measurementSummary.height >= 3
                          ? `${Math.round((measurementSummary.height / 100) * 100) / 100} m`
                          : undefined,
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      {metricCard(
                        'IMC',
                        measurementSummary.bmi ?? '—',
                        theme.palette.secondary.main,
                        bmiClassification(measurementSummary.bmi ?? null) ?? undefined,
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      {metricCard(
                        'Gordura corporal',
                        measurementSummary.bodyFat != null ? `${measurementSummary.bodyFat}%` : '—',
                        theme.palette.success.main,
                      )}
                    </Grid>
                  </Grid>

                  {hasCircumferenceData ? (
                    <Stack spacing={2}>
                      <Divider flexItem sx={{ opacity: 0.5 }}>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
                          Medidas corporais
                        </Typography>
                      </Divider>
                      <Grid container spacing={2}>
                        {circumferenceMetrics.map((metric) => (
                          <Grid item xs={6} sm={4} md={3} key={metric.key}>
                            {metricCard(
                              metric.label,
                              formatMeasurementValue(metric.value, ' cm'),
                              theme.palette.primary.light,
                            )}
                          </Grid>
                        ))}
                      </Grid>
                    </Stack>
                  ) : null}

                  <Stack spacing={1.5}>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Registo efetuado em {formatDate(measurementSummary.date)}
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {measurementSummary.notes ?? 'Sem notas adicionais.'}
                    </Typography>
                  </Stack>

                  <Button
                    component={Link}
                    href={`/dashboard/profile?tab=metrics&user=${encodeURIComponent(user.id)}`}
                    endIcon={<LaunchIcon />}
                    variant="outlined"
                  >
                    Abrir histórico completo
                  </Button>
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  Ainda não existem medições registadas para este cliente.
                </Typography>
              )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <CardHeader
                title="Gestão de Personal Trainer"
                subheader={trainer.current ? `Atual: ${trainer.current.name}` : 'Nenhum Personal Trainer associado'}
                action={savingTrainer ? <LinearProgress sx={{ width: 120, borderRadius: 999 }} /> : null}
              />
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                  <TextField
                    select
                    label="Personal Trainer"
                    value={trainerId}
                    disabled={!trainer.allowEdit}
                    onChange={(event) => setTrainerId(event.target.value)}
                    sx={{ minWidth: { xs: '100%', sm: 260 } }}
                  >
                    <MenuItem value="">— Sem Personal Trainer —</MenuItem>
                    {trainer.options.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name}
                        {option.email ? <Typography component="span" variant="caption" sx={{ ml: 1, opacity: 0.65 }}>({option.email})</Typography> : null}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      disabled={!trainer.allowEdit || savingTrainer || trainerId === (trainer.current?.id ?? '')}
                      onClick={saveTrainerLink}
                    >
                      Guardar alterações
                    </Button>
                    <Tooltip title="Repor seleção">
                      <span>
                        <IconButton
                          onClick={() => setTrainerId(trainer.current?.id ?? '')}
                          disabled={!trainer.allowEdit || savingTrainer || trainerId === (trainer.current?.id ?? '')}
                          size="large"
                        >
                          <RefreshIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </Stack>
              </CardContent>
              {currentTrainerName ? (
                <CardActions sx={{ justifyContent: 'space-between', px: 3 }}>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    {`Última definição: ${formatDate(activity.lastPlanUpdate)}`}
                  </Typography>
                  <MuiLink component={Link} href={`/dashboard/pt/clients/${user.id}`} underline="hover">
                    Abrir vista do PT
                  </MuiLink>
                </CardActions>
              ) : null}
            </Card>

            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <CardHeader
                avatar={<Inventory2Icon color="primary" />}
                title="Pacotes de sessões"
                subheader={
                  loadingPackages
                    ? 'A carregar pacotes…'
                    : currentPackage
                      ? `${currentPackage.name ?? 'Pacote sem título'} · ${packageStatusLabel(currentPackage.status)}`
                      : 'Nenhum pacote ativo'
                }
              />
              <CardContent>
                {loadingPackages ? (
                  <LinearProgress sx={{ borderRadius: 999 }} />
                ) : currentPackage ? (
                  <Stack spacing={3}>
                    <Box
                      sx={{
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.4 : 0.2),
                        background: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                        p: 2.5,
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {currentPackage.name ?? 'Pacote sem título'}
                          </Typography>
                          <Chip
                            size="small"
                            icon={packageStatusIcon(currentPackage.status)}
                            label={packageStatusLabel(currentPackage.status)}
                            color={packageStatusColor(currentPackage.status)}
                          />
                        </Stack>
                        <Stack spacing={0.5}>
                          {formatSessionsProgress(currentPackage.sessionsTotal, currentPackage.sessionsUsed) ? (
                            <Typography variant="body2">
                              {formatSessionsProgress(currentPackage.sessionsTotal, currentPackage.sessionsUsed)}
                            </Typography>
                          ) : null}
                          <Typography variant="body2" sx={{ opacity: 0.75 }}>
                            Iniciado em {formatDate(currentPackage.startedAt)}
                            {currentPackage.endsAt ? ` · Expira em ${formatDate(currentPackage.endsAt)}` : ''}
                          </Typography>
                          {currentPackage.notes ? (
                            <Typography variant="body2" sx={{ opacity: 0.85, whiteSpace: 'pre-line' }}>
                              {currentPackage.notes}
                            </Typography>
                          ) : null}
                        </Stack>
                      </Stack>
                    </Box>

                    {packageHistory.length ? (
                      <Stack spacing={1.5}>
                        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
                          Histórico recente
                        </Typography>
                        <List disablePadding>
                          {packageHistory.map((pkg) => (
                            <ListItem
                              key={pkg.id}
                              sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1.5, alignItems: 'flex-start' }}
                            >
                              <ListItemText
                                primary={
                                  <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={1.5}
                                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                                  >
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                      {pkg.name ?? 'Pacote sem título'}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      icon={packageStatusIcon(pkg.status)}
                                      label={packageStatusLabel(pkg.status)}
                                      color={packageStatusColor(pkg.status)}
                                    />
                                  </Stack>
                                }
                                secondary={
                                  <Stack spacing={0.5} sx={{ mt: 0.75 }}>
                                    <Typography variant="body2">
                                      {formatDate(pkg.startedAt)}
                                      {pkg.endsAt ? ` → ${formatDate(pkg.endsAt)}` : ''}
                                    </Typography>
                                    {formatSessionsProgress(pkg.sessionsTotal, pkg.sessionsUsed) ? (
                                      <Typography variant="caption">
                                        {formatSessionsProgress(pkg.sessionsTotal, pkg.sessionsUsed)}
                                      </Typography>
                                    ) : null}
                                    {pkg.notes ? (
                                      <Typography variant="caption" sx={{ opacity: 0.7, whiteSpace: 'pre-line' }}>
                                        {pkg.notes}
                                      </Typography>
                                    ) : null}
                                  </Stack>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Stack>
                    ) : null}
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ opacity: 0.75 }}>
                    Ainda não existem pacotes de sessões registados.
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <CardHeader
                title="Planos de treino ativos"
                subheader={plans.length ? `${plans.length} planos recentes` : 'Sem planos registados'}
                action={
                  <Button component={Link} href={`/dashboard/plans`} endIcon={<LaunchIcon />} size="small">
                    Ver todos
                  </Button>
                }
              />
              <CardContent>
                {plans.length === 0 ? (
                  <Typography variant="body2" sx={{ opacity: 0.75 }}>
                    Ainda não existem planos de treino para este cliente. Cria um novo plano para acompanhares a jornada.
                  </Typography>
                ) : (
                  <List sx={{ width: '100%', p: 0 }}>
                    {plans.map((plan) => (
                      <React.Fragment key={plan.id}>
                        <ListItem
                          secondaryAction={
                            <Button component={Link} href={`/dashboard/pt/plans/${plan.id}`} size="small" variant="outlined">
                              Abrir
                            </Button>
                          }
                          sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3,
                            mb: 1.5,
                            alignItems: 'flex-start',
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                              <FitnessCenterIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {plan.title ?? 'Plano sem título'}
                                </Typography>
                                {plan.status ? <Chip size="small" label={plan.status} /> : null}
                              </Stack>
                            }
                            secondary={
                              <Stack spacing={0.5} sx={{ mt: 0.75 }}>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                  Atualizado em {formatDate(plan.updatedAt)}
                                </Typography>
                                {plan.trainerName ? (
                                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                    Responsável: {plan.trainerName}
                                  </Typography>
                                ) : null}
                              </Stack>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <CardHeader title="Sessões" subheader="Próximas marcações e histórico recente" />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Próximas sessões
                    </Typography>
                    {upcomingSessions.length === 0 ? (
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        Não existem sessões agendadas.
                      </Typography>
                    ) : (
                      <List disablePadding>
                        {upcomingSessions.map((session) => sessionLine(session))}
                      </List>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Últimas sessões
                    </Typography>
                    {recentSessions.length === 0 ? (
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        Ainda não existem sessões concluídas.
                      </Typography>
                    ) : (
                      <List disablePadding>
                        {recentSessions.map((session) => sessionLine(session))}
                      </List>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <CardHeader
                avatar={<HistoryEduIcon color="primary" />}
                title="Notas e observações"
                subheader={
                  loadingNotes
                    ? 'A carregar notas…'
                    : notes.length
                      ? `${notes.length} nota${notes.length > 1 ? 's' : ''} registada${notes.length > 1 ? 's' : ''}`
                      : 'Sem notas personalizadas'
                }
              />
              <CardContent>
                <Stack spacing={3}>
                  <Box component="form" onSubmit={submitNote}>
                    <Stack spacing={1.5}>
                      <TextField
                        label="Adicionar nova nota"
                        placeholder="Registe feedback, progresso ou alertas importantes"
                        multiline
                        minRows={3}
                        fullWidth
                        value={noteText}
                        onChange={(event) => setNoteText(event.target.value)}
                      />
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button type="submit" variant="contained" disabled={savingNote || !noteTextTrimmed}>
                          {savingNote ? 'A guardar…' : 'Guardar nota'}
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>

                  {loadingNotes ? (
                    <LinearProgress sx={{ borderRadius: 999 }} />
                  ) : notes.length ? (
                    <Stack spacing={2}>
                      {notes.map((note) => (
                        <Box key={note.id} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={1}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                          >
                            <Typography variant="subtitle2">{note.author || 'Equipa'}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {formatDate(note.createdAt)}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ mt: 1.25, whiteSpace: 'pre-line' }}>
                            {note.text}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" sx={{ opacity: 0.75 }}>
                      Ainda não existem notas registadas para este cliente.
                    </Typography>
                  )}

                  {hasAutoNotes ? (
                    <Stack spacing={1.5}>
                      <Divider textAlign="left">
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
                          Observações automáticas
                        </Typography>
                      </Divider>
                      {measurement?.notes ? (
                        <Box sx={{ p: 2, borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                            Avaliação física ({formatDate(measurement.date)})
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                            {measurement.notes}
                          </Typography>
                        </Box>
                      ) : null}
                      {sessionNotes.map((session) => (
                        <Box key={`auto-note-${session.id}`} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                            Sessão de {formatDate(session.scheduledAt)}
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                            {session.notes}
                          </Typography>
                          {session.trainerName ? (
                            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mt: 0.75 }}>
                              Personal Trainer: {session.trainerName}
                            </Typography>
                          ) : null}
                        </Box>
                      ))}
                    </Stack>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
      </Container>
    </Box>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
  copyable,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const content = (
    <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
        <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>{icon}</Box>
        <Stack sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
            {value || '—'}
          </Typography>
        </Stack>
      </Stack>
      {copyable && value ? (
        <Tooltip title={copied ? 'Copiado!' : 'Copiar valor'}>
          <IconButton size="small" onClick={copy}>
            <ContentCopyIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      ) : null}
    </Stack>
  );

  if (href && value && value !== '—') {
    return (
      <MuiLink href={href} underline="hover" target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        {content}
      </MuiLink>
    );
  }

  return content;
}

function RefreshIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" /><path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14" /></svg>;
}

function ContentCopyIcon(props: { fontSize?: 'inherit' }) {
  return (
    <svg
      width={props.fontSize === 'inherit' ? '1em' : 20}
      height={props.fontSize === 'inherit' ? '1em' : 20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
