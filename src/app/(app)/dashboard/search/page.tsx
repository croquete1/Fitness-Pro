import { Typography, Box, Card, CardContent, List, ListItem, ListItemText, Button, Stack, Divider } from '@mui/material';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabaseServer';

type U = { id: string; name?: string | null; email?: string | null; role?: string | null };
type P = { id: string; title?: string | null; status?: string | null };
type E = { id: string; name?: string | null; muscle?: string | null; difficulty?: string | null };
type S = { id: string; title?: string | null; start_at?: string | null; client?: string | null };

function cleanQ(q?: string | null) {
  return (q ?? '').trim();
}
function tokens(q: string) {
  return q.split(/\s+/).filter(Boolean);
}

export default async function GlobalSearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = cleanQ(searchParams?.q);
  const sb = createServerClient();

  // Papel (role) via Supabase (perfil)
  let role: 'ADMIN'|'TRAINER'|'CLIENT'|'UNKNOWN' = 'UNKNOWN';
  let uid: string | null = null;
  try {
    const { data: { user } } = await sb.auth.getUser();
    if (user) {
      uid = user.id;
      const { data: prof } = await sb.from('profiles').select('role').eq('id', user.id).single();
      role = (prof?.role as any)?.toUpperCase?.() ?? 'UNKNOWN';
    }
  } catch {}

  if (!q) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" fontWeight={800} gutterBottom>Pesquisar</Typography>
        <Typography color="text.secondary">Escreve no campo do topo para pesquisar. Dica: usa várias palavras; pesquisamos por nome/título/email.</Typography>
      </Box>
    );
  }

  // Monta OR dinâmico por tokens (ilike) – simples e eficaz
  const tks = tokens(q);
  const orUsers     = tks.map(t => `name.ilike.%${t}%,email.ilike.%${t}%`).join(',');
  const orPlans     = tks.map(t => `title.ilike.%${t}%`).join(',');
  const orExercises = tks.map(t => `name.ilike.%${t}%,muscle_group.ilike.%${t}%`).join(',');
  const orSessions  = tks.map(t => `title.ilike.%${t}%`).join(',');

  // Grupos
  let users: U[] = [];
  let plans: P[] = [];
  let exercises: E[] = [];
  let sessions: S[] = [];

  // USERS (apenas admin)
  if (role === 'ADMIN') {
    try {
      const qUsers = sb.from('users' as any)
        .select('id, name, email, role')
        .order('created_at', { ascending: false })
        .limit(5);
      if (orUsers) qUsers.or(orUsers);
      const { data } = await qUsers;
      users = (data ?? []).map((u: any) => ({ id: String(u.id), name: u.name, email: u.email, role: String(u.role ?? '').toUpperCase() }));
    } catch {}
  }

  // PLANS
  try {
    const qPlans = sb.from('plans' as any)
      .select('id, title, status, owner_id, trainer_id')
      .order('updated_at', { ascending: false })
      .limit(5);
    if (orPlans) qPlans.or(orPlans);
    if (role === 'TRAINER' && uid) qPlans.eq('trainer_id', uid);
    if (role === 'CLIENT'  && uid) qPlans.eq('owner_id', uid);
    const { data } = await qPlans;
    plans = (data ?? []).map((p: any) => ({ id: String(p.id), title: p.title, status: String(p.status ?? 'DRAFT').toUpperCase() }));
  } catch {}

  // EXERCISES
  try {
    const qEx = sb.from('exercises' as any)
      .select('id, name, muscle_group, difficulty')
      .order('name', { ascending: true })
      .limit(5);
    if (orExercises) qEx.or(orExercises);
    // se quiseres escopo por PT/CLIENTE, coloca colunas created_by/public etc.
    const { data } = await qEx;
    exercises = (data ?? []).map((e: any) => ({ id: String(e.id), name: e.name, muscle: e.muscle_group, difficulty: String(e.difficulty ?? 'MEDIUM').toUpperCase() }));
  } catch {}

  // SESSIONS
  try {
    const qSess = sb.from('sessions' as any)
      .select('id, title, start_at, client_id')
      .order('start_at', { ascending: false })
      .limit(5);
    if (orSessions) qSess.or(orSessions);
    if (role === 'TRAINER' && uid) qSess.eq('trainer_id', uid);
    if (role === 'CLIENT'  && uid) qSess.eq('client_id', uid);
    const { data } = await qSess;
    sessions = (data ?? []).map((s: any) => ({ id: String(s.id), title: s.title, start_at: s.start_at, client: s.client_id ?? null }));
  } catch {}

  const isAdmin = role === 'ADMIN';

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={800}>Resultados para “{q}”</Typography>

      {isAdmin && (
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" alignItems="baseline" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight={700}>Utilizadores</Typography>
              <Button component={Link} href={`/dashboard/admin/users?q=${encodeURIComponent(q)}`} size="small">Ver mais</Button>
            </Stack>
            <List dense>
              {users.length === 0 && <ListItem><ListItemText primary="Sem resultados." /></ListItem>}
              {users.map((u) => (
                <ListItem key={u.id} secondaryAction={<span style={{ opacity:.7 }}>{u.role ?? ''}</span>}>
                  <ListItemText primary={u.name || u.email || '(sem nome)'} secondary={u.email || ''} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="baseline" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={700}>Planos</Typography>
            <Button component={Link} href={`/dashboard/admin/plans?q=${encodeURIComponent(q)}`} size="small">Ver mais</Button>
          </Stack>
          <List dense>
            {plans.length === 0 && <ListItem><ListItemText primary="Sem resultados." /></ListItem>}
            {plans.map((p) => (
              <ListItem key={p.id} secondaryAction={<span style={{ opacity:.7 }}>{p.status ?? ''}</span>}>
                <ListItemText primary={p.title || '(sem título)'} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="baseline" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={700}>Exercícios</Typography>
            <Button component={Link} href={`/dashboard/admin/exercises?q=${encodeURIComponent(q)}`} size="small">Ver mais</Button>
          </Stack>
          <List dense>
            {exercises.length === 0 && <ListItem><ListItemText primary="Sem resultados." /></ListItem>}
            {exercises.map((e) => (
              <ListItem key={e.id} secondaryAction={<span style={{ opacity:.7 }}>{e.difficulty ?? ''}</span>}>
                <ListItemText primary={e.name || '(sem nome)'} secondary={e.muscle || ''} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="baseline" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={700}>Sessões</Typography>
            <Button component={Link} href={`/dashboard/pt/sessions?q=${encodeURIComponent(q)}`} size="small">Ver mais</Button>
          </Stack>
          <List dense>
            {sessions.length === 0 && <ListItem><ListItemText primary="Sem resultados." /></ListItem>}
            {sessions.map((s) => (
              <ListItem key={s.id} secondaryAction={<span style={{ opacity:.7 }}>{s.start_at ? new Date(s.start_at).toLocaleString() : ''}</span>}>
                <ListItemText primary={s.title || '(sessão)'} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Divider />
      <Typography variant="caption" color="text.secondary">
        Dica: podes abrir “Ver mais” para usar os filtros completos do DataGrid e exportar resultados.
      </Typography>
    </Stack>
  );
}
