'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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
  };
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
                Personal trainer: {session.trainerName}
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

  const measurementSummary = summarizeMeasurement(measurement);

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
      toast.success('Personal trainer atualizado com sucesso');
    } catch (error: any) {
      toast.error(error?.message ?? 'Falha ao atualizar personal trainer');
    } finally {
      setSavingTrainer(false);
    }
  }

  const currentTrainerName = React.useMemo(() => {
    const match = trainer.options.find((t) => t.id === trainerId);
    return match?.name ?? trainer.current?.name ?? null;
  }, [trainer.options, trainerId, trainer.current]);

  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 3, md: 6 },
        px: { xs: 1.5, md: 4 },
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, rgba(22,30,45,0.95) 0%, rgba(11,16,28,0.98) 100%)'
          : 'linear-gradient(180deg, #f5f7fb 0%, #ffffff 65%)',
      }}
    >
      <Grid container spacing={{ xs: 3, md: 4 }}>
        <Grid item xs={12} md={4}>
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
                      Último acesso
                    </Typography>
                    <Typography variant="body2">{formatDate(user.lastSignInAt)}</Typography>
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
                  <Stack spacing={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        {metricCard('Peso', measurementSummary.weight ? `${measurementSummary.weight} kg` : '—', theme.palette.info.main)}
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        {metricCard('Altura', measurementSummary.height ? `${measurementSummary.height} cm` : '—', theme.palette.info.main)}
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        {metricCard('IMC', measurementSummary.bmi ? measurementSummary.bmi : '—', theme.palette.secondary.main)}
                      </Grid>
                    </Grid>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        Gordura corporal: {measurementSummary.bodyFat != null ? `${measurementSummary.bodyFat}%` : '—'}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
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
                title="Gestão de personal trainer"
                subheader={trainer.current ? `Atual: ${trainer.current.name}` : 'Nenhum personal trainer associado'}
                action={savingTrainer ? <LinearProgress sx={{ width: 120, borderRadius: 999 }} /> : null}
              />
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                  <TextField
                    select
                    label="Personal trainer"
                    value={trainerId}
                    disabled={!trainer.allowEdit}
                    onChange={(event) => setTrainerId(event.target.value)}
                    sx={{ minWidth: { xs: '100%', sm: 260 } }}
                  >
                    <MenuItem value="">— Sem personal trainer —</MenuItem>
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

            <Accordion defaultExpanded sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>Notas e observações</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {measurement?.notes || recentSessions.some((s) => s.notes) ? (
                  <Stack spacing={2}>
                    {measurement?.notes ? (
                      <Box sx={{ p: 2, borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                          Observação da avaliação física
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {measurement.notes}
                        </Typography>
                      </Box>
                    ) : null}
                    {recentSessions.filter((s) => s.notes).map((session) => (
                      <Box key={`note-${session.id}`} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                          {`Sessão de ${formatDate(session.scheduledAt)}`}
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {session.notes}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Sem notas registadas para este cliente.
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Grid>
      </Grid>
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
