// src/app/(app)/dashboard/admin/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import GreetingBanner from '@/components/GreetingBanner';
import LiveBanners from '@/components/dashboard/LiveBanners';
import KpiCard from '@/components/dashboard/KpiCard';
import PushBootstrap from '@/components/dashboard/PushBootstrap';
import MiniSpark from '@/components/charts/MiniSpark';
import TaskListCard from '@/components/dashboard/TaskListCard';
import MotivationAdminCard from '@/components/admin/MotivationAdminCard';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type SB = ReturnType<typeof createServerClient>;

async function safeCount(sb: SB, table: string, build?: (q: any) => any) {
  try {
    let q: any = sb.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q);
    const { count } = await q;
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function countRole(sb: SB, role: 'CLIENT' | 'PT' | 'ADMIN') {
  // tenta em users, depois profiles (fallback)
  const dbRole = role === 'PT' ? 'TRAINER' : role;
  const inUsers = await safeCount(sb, 'users', (q: any) => q.eq('role', dbRole));
  if (inUsers > 0) return inUsers;
  return safeCount(sb, 'profiles', (q: any) => q.eq('role', dbRole));
}

export default async function AdminDashboard() {
  const sessionUser = await getSessionUserSafe();
  const id = sessionUser?.user?.id;
  if (!id) redirect('/login');

  const role = toAppRole(sessionUser.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  const { data: prof } = await sb
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', id)
    .maybeSingle();

  // Datas “imutáveis”
  const now = new Date();
  const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
  const in7 = new Date(startToday); in7.setDate(startToday.getDate() + 7);
  const last14 = new Date(startToday); last14.setDate(startToday.getDate() - 13);
  const prev14 = new Date(last14); prev14.setDate(last14.getDate() - 14);

  // KPIs (robustos)
  const [clients, pts, admins, sessions7d, pending, newToday] = await Promise.all([
    countRole(sb, 'CLIENT'),
    countRole(sb, 'PT'),
    countRole(sb, 'ADMIN'),
    safeCount(sb, 'sessions', (q: any) =>
      q.gte('scheduled_at', startToday.toISOString()).lt('scheduled_at', in7.toISOString())
    ),
    (async () => {
      let c = await safeCount(sb, 'users', (q: any) => q.eq('approved', false));
      if (c === 0) c = await safeCount(sb, 'users', (q: any) => q.eq('status', 'PENDING'));
      return c;
    })(),
    safeCount(sb, 'users', (q: any) => q.gte('created_at', startToday.toISOString())),
  ]);

  // Novos registos últimos 14d + anteriores 14d (trend)
  const { data: regRows } = await sb
    .from('users')
    .select('id, created_at')
    .gte('created_at', prev14.toISOString());

  const last = new Array<number>(14).fill(0);
  const prev = new Array<number>(14).fill(0);
  (regRows ?? []).forEach((u: any) => {
    const d = new Date(u.created_at);
    d.setHours(0, 0, 0, 0);
    if (d >= last14) {
      const idx = Math.round((+d - +last14) / 86400000);
      if (idx >= 0 && idx < 14) last[idx] += 1;
    } else if (d >= prev14) {
      const idx = Math.round((+d - +prev14) / 86400000);
      if (idx >= 0 && idx < 14) prev[idx] += 1;
    }
  });
  const lastSum = last.reduce((a, b) => a + b, 0);
  const prevSum = prev.reduce((a, b) => a + b, 0);
  const trendDir: 'up' | 'down' | 'flat' =
    lastSum > prevSum ? 'up' : lastSum < prevSum ? 'down' : 'flat';
  const trendVal = (lastSum - prevSum) >= 0 ? `+${lastSum - prevSum}` : String(lastSum - prevSum);

  // Sessões por PT (próx. 7d)
  const { data: rawWeek } = await sb
    .from('sessions')
    .select('trainer_id, scheduled_at')
    .gte('scheduled_at', startToday.toISOString())
    .lt('scheduled_at', in7.toISOString());

  const byPT = new Map<string, number>();
  (rawWeek ?? []).forEach((s: any) => {
    if (!s.trainer_id) return;
    byPT.set(s.trainer_id, (byPT.get(s.trainer_id) || 0) + 1);
  });

  const trainerIds = Array.from(byPT.keys());
  let trainerNames = new Map<string, string>();
  if (trainerIds.length) {
    const { data } = await sb
      .from('users')
      .select('id,name,email')
      .in('id', trainerIds);
    trainerNames = new Map((data ?? []).map((u: any) => [u.id, u.name ?? u.email ?? u.id]));
  }

  const weekRows = Array.from(byPT.entries())
    .map(([uid, c]) => ({ id: uid, name: trainerNames.get(uid) ?? uid, count: c }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const name =
    prof?.name ?? sessionUser.user.name ?? sessionUser.user.email ?? 'Utilizador';

  return (
    <div className="p-4 grid gap-3">
      <GreetingBanner name={name} roleTag="ADMIN" />
      <LiveBanners />
      <PushBootstrap />

      {/* KPIs + spark */}
      <section
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))' }}
      >
        <KpiCard label="Clientes"          value={clients}    variant="accent"  icon="🧑‍🤝‍🧑" />
        <KpiCard label="Treinadores"       value={pts}        variant="info"    icon="🏋️" />
        <KpiCard label="Admins"            value={admins}     variant="primary" icon="🛡️" />
        <KpiCard label="Sessões (7d)"      value={sessions7d} variant="success" icon="📅" />
        <KpiCard
          label="Pendentes"
          value={pending}
          variant="warning"
          icon="⏳"
          footer={<Link href="/dashboard/admin/approvals" className="text-xs">ver aprovações</Link>}
        />
        <div className="card p-2 flex items-center justify-between">
          <div className="pl-2">
            <div className="font-semibold text-sm">Novos registos (14d)</div>
            <div className="text-xs opacity-70">por dia</div>
          </div>
          <MiniSpark data={last} />
        </div>
        <KpiCard
          label="Hoje vs 14d-1"
          value={lastSum}
          variant="accent"
          icon="📈"
          trend={trendDir}
          trendValue={trendVal}
          trendLabel="vs. período anterior"
        />
      </section>

      {/* Sessões por PT */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
          Sessões por PT (próx. 7 dias)
        </Typography>
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>PT</TableCell>
                <TableCell align="right">Sessões</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {weekRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell align="right">{r.count}</TableCell>
                </TableRow>
              ))}
              {weekRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    Sem dados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* Tarefas do dia */}
      <TaskListCard
        items={[
          pending > 0 ? `Rever ${pending} pedido(s) pendentes` : 'Sem aprovações pendentes',
          'Validar catálogo de exercícios',
          'Verificar saúde do sistema',
        ]}
      />

      {/* Gestão de frases motivadoras (ADMIN) */}
      <MotivationAdminCard />
    </div>
  );
}
