export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import GreetingBanner from '@/components/GreetingBanner';
import LiveBanners from '@/components/dashboard/LiveBanners';
import PushBootstrap from '@/components/dashboard/PushBootstrap';
import KpiCard from '@/components/dashboard/KpiCard';
import MotivationCard from '@/components/dashboard/MotivationCard';
import ProgressMini from '@/components/dashboard/ProgressMini';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Link from 'next/link';

type SB = ReturnType<typeof createServerClient>;
async function safeCount(sb: SB, table: string, build?: (q: any) => any) {
  try { let q: any = sb.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q); const { count } = await q; return count ?? 0;
  } catch { return 0; }
}

export default async function ClientDashboard() {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.user?.id) redirect('/login');

  const role = toAppRole(sessionUser.user.role) ?? 'CLIENT';
  if (role !== 'CLIENT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  const { data: prof } = await sb
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', sessionUser.user.id)
    .maybeSingle();

  const now = new Date(); const in7 = new Date(now); in7.setDate(now.getDate() + 7);

  const [myPlans, myUpcoming, unread, upcomingRows] = await Promise.all([
    safeCount(sb, 'training_plans', (q) => q.eq('client_id', sessionUser.user.id)),
    safeCount(sb, 'sessions', (q) => q.eq('client_id', sessionUser.user.id).gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())),
    safeCount(sb, 'notifications', (q) => q.eq('user_id', sessionUser.user.id).eq('read', false)),
    sb.from('sessions').select('id,scheduled_at,location,status,trainer_id').eq('client_id', sessionUser.user.id).gte('scheduled_at', now.toISOString()).order('scheduled_at', { ascending: true }).limit(6).then(({ data }) => data ?? []),
  ]);

  async function loadHistory() {
    const candidates = [
      ['profile_metrics_history', 'measured_at'],
      ['metrics_history', 'measured_at'],
      ['metrics_log', 'created_at'],
    ] as const;
    for (const [table, dateCol] of candidates) {
      try {
        const { data } = await sb.from(table as any).select(`user_id, ${dateCol}, weight_kg`).eq('user_id', sessionUser.user.id).order(dateCol as any, { ascending: true }).limit(24);
        if (data?.length) return (data as any[]).map((r) => ({ date: r[dateCol], weight: r.weight_kg ?? null }));
      } catch {}
    }
    try {
      const { data } = await sb.from('profile_metrics').select('weight_kg, updated_at').eq('user_id', sessionUser.user.id).maybeSingle();
      if (data) return [{ date: data.updated_at ?? new Date().toISOString(), weight: data.weight_kg ?? null }];
    } catch {}
    return [];
  }
  const points = await loadHistory();

  const name = prof?.name ?? sessionUser.user.name ?? sessionUser.user.email ?? 'Utilizador';

  return (
    <div className="p-4 grid gap-3">
      <GreetingBanner name={name} /> {/* sem role */}
      <LiveBanners />
      <PushBootstrap />

      {/* KPIs */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        <KpiCard label="Os meus planos" value={myPlans} variant="accent" icon="📝" />
        <KpiCard label="Sessões (7d)" value={myUpcoming} variant="success" icon="📅" />
        <KpiCard label="Notificações" value={unread} variant="warning" icon="🔔" footer={<span className="small text-muted">por ler</span>} />
      </div>

      {/* Motivação + Progresso */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
        <MotivationCard />
        <ProgressMini points={points} />
      </div>

      {/* Próximas sessões */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Próximas sessões</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell><TableCell>Local</TableCell><TableCell>Estado</TableCell><TableCell>PT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {upcomingRows.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell>{s.scheduled_at ? new Date(s.scheduled_at).toLocaleString('pt-PT') : '—'}</TableCell>
                <TableCell>{s.location ?? '—'}</TableCell>
                <TableCell>{s.status ?? '—'}</TableCell>
                <TableCell>{s.trainer_id ?? '—'}</TableCell>
              </TableRow>
            ))}
            {upcomingRows.length === 0 && <TableRow><TableCell colSpan={4} align="center">Sem sessões marcadas.</TableCell></TableRow>}
          </TableBody>
        </Table>
        <div className="mt-2 text-right">
          <Link href="/dashboard/sessions" className="text-sm">ver todas</Link>
        </div>
      </Paper>
    </div>
  );
}
