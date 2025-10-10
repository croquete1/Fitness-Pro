'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PersonIcon from '@mui/icons-material/Person';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export type SearchResults = {
  query: string;
  supabase: boolean;
  users: Array<{ id: string; name: string; role: string; email: string | null }>;
  sessions: Array<{ id: string; when: string | null; trainer: string; client: string; location: string | null }>;
  approvals: Array<{ id: string; name: string | null; email: string | null; status: string }>;
};

type Props = {
  initialQuery: string;
  results: SearchResults;
};

export default function SearchClient({ initialQuery, results }: Props) {
  const [term, setTerm] = React.useState(initialQuery);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const submit = React.useCallback(() => {
    const query = term.trim();
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }, [term, router, pathname, searchParams]);

  React.useEffect(() => {
    setTerm(initialQuery);
  }, [initialQuery]);

  const empty = !results.users.length && !results.sessions.length && !results.approvals.length;

  return (
    <Stack spacing={3} sx={{ pb: 6 }}>
      <Card variant="outlined" sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={800}>
              Pesquisa global
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Procura utilizadores, sessões agendadas ou pedidos de aprovação. Os resultados são {results.supabase ? 'baseados na base de dados actual.' : 'carregados a partir de amostras locais porque o Supabase não está configurado.'}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
              <TextField
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    submit();
                  }
                }}
                placeholder="Pesquisar por nome, email ou local..."
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ opacity: 0.6 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={submit}
                disabled={isPending}
                startIcon={<SearchIcon />}
              >
                {isPending ? 'A pesquisar…' : 'Pesquisar'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {empty ? (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Sem resultados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ajusta o termo de pesquisa ou tenta outros critérios. Procura por nomes de clientes, emails ou locais de sessão.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card variant="outlined" sx={{ borderRadius: 4, height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <PersonIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Utilizadores ({results.users.length})
                  </Typography>
                </Stack>
                <List dense disablePadding sx={{ display: 'grid', gap: 1 }}>
                  {results.users.map((user) => (
                    <ListItem
                      key={user.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        px: 1.5,
                        py: 1,
                      }}
                    >
                      <ListItemText
                        primaryTypographyProps={{ fontWeight: 600 }}
                        primary={user.name}
                        secondary={
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                            <Chip size="small" label={user.role} color={user.role === 'ADMIN' ? 'error' : user.role === 'TRAINER' ? 'primary' : 'success'} variant="outlined" />
                            {user.email && (
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                  {!results.users.length && (
                    <Typography variant="body2" color="text.secondary">
                      Nenhum utilizador corresponde à pesquisa.
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card variant="outlined" sx={{ borderRadius: 4 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <EventAvailableIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Sessões ({results.sessions.length})
                  </Typography>
                </Stack>
                <List dense disablePadding sx={{ display: 'grid', gap: 1 }}>
                  {results.sessions.map((session) => (
                    <ListItem
                      key={session.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        px: 1.5,
                        py: 1,
                      }}
                    >
                      <ListItemText
                        primaryTypographyProps={{ fontWeight: 600 }}
                        primary={
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                            <Typography variant="body2" fontWeight={700}>
                              {session.when ? new Date(session.when).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Data a definir'}
                            </Typography>
                            <Chip size="small" label={session.location || 'Local por definir'} variant="outlined" />
                          </Stack>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {session.trainer} · {session.client}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                  {!results.sessions.length && (
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma sessão encontrada para o termo indicado.
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card variant="outlined" sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <PendingActionsIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={700}>
              Aprovações ({results.approvals.length})
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={1.5}>
            {results.approvals.map((approval) => (
              <Grid item xs={12} md={4} key={approval.id}>
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1.5,
                    display: 'grid',
                    gap: 0.75,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    {approval.name ?? 'Utilizador'}
                  </Typography>
                  {approval.email && (
                    <Typography variant="caption" color="text.secondary">
                      {approval.email}
                    </Typography>
                  )}
                  <Chip
                    size="small"
                    label={approval.status.toUpperCase()}
                    color={approval.status === 'approved' ? 'success' : approval.status === 'pending' ? 'warning' : 'default'}
                    variant="outlined"
                  />
                </Box>
              </Grid>
            ))}
            {!results.approvals.length && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum pedido de aprovação corresponde à pesquisa.
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}
