import { Alert, Container, Paper, Grid } from '@mui/material';
import Greeting from '@/components/client/Greeting';
import QuestionOfTheDayCard from '@/components/client/QuestionOfTheDayCard';
import TreinoDoDiaCard from '@/components/dashboard/TreinoDoDiaCard';
import CheckinsHistoryCard from '@/components/client/CheckinsHistoryCard';
import { createServerClient } from '@/lib/supabaseServer';

export const revalidate = 0;

export default async function ClientDashboardPage() {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const { data: profile } = await sb.from('profiles').select('full_name, trainer_id').eq('id', user.id).single();

  const { data: lastArr } = await sb
    .from('sessions')
    .select('id, title, start_at, core_exercise, kind')
    .eq('client_id', user.id)
    .order('start_at', { ascending: false })
    .limit(1);
  const last = Array.isArray(lastArr) && lastArr[0] ? lastArr[0] : null;

  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date(); end.setHours(23,59,59,999);
  const { data: todayArr } = await sb
    .from('sessions')
    .select('id, title, start_at, kind, core_exercise, exercises')
    .eq('client_id', user.id)
    .gte('start_at', start.toISOString())
    .lte('start_at', end.toISOString())
    .order('start_at', { ascending: true })
    .limit(1);
  const today = Array.isArray(todayArr) && todayArr[0] ? (todayArr as any)[0] : null;

  const sessionForCard = today ? {
    title: today.title ?? 'Sessão de hoje',
    items: Array.isArray(today.exercises) ? today.exercises as string[] :
           today.core_exercise ? [String(today.core_exercise)] : []
  } : undefined;

  const hasPresencialToday = today?.kind && String(today.kind).toLowerCase().includes('presencial');
  const when = today?.start_at ? new Date(today.start_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : null;

  return (
    <Container maxWidth="lg" sx={{ display:'grid', gap: 2 }}>
      <Greeting name={profile?.full_name} />

      {hasPresencialToday && (
        <Alert severity="info" icon={false}>
          🔔 Tens uma sessão <b>presencial</b> hoje {when ? `às ${when}` : ''}. Prepara-te! 💪
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <QuestionOfTheDayCard
            lastCore={last?.core_exercise ?? null}
            lastDate={last?.start_at ?? null}
            todayCore={today?.core_exercise ?? null}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <TreinoDoDiaCard session={sessionForCard} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <CheckinsHistoryCard />
        </Grid>
      </Grid>
    </Container>
  );
}
