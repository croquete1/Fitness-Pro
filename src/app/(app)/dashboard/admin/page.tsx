// src/app/(app)/dashboard/admin/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import GreetingBanner from '@/components/GreetingBanner';
import LiveBanners from '@/components/dashboard/LiveBanners';
import KpiCard from '@/components/dashboard/KpiCard';
import PushBootstrap from '@/components/dashboard/PushBootstrap';
import MotivationAdminCard from '@/components/admin/MotivationAdminCard';
import Sparkline from '@/components/charts/Sparkline';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type SB = ReturnType<typeof createServerClient>;
async function safeCount(sb: SB, table: string, build?: (q: any) => any) {
  try { let q = sb.from(table).select('*', { count: 'exact', head: true }); if (build) q = build(q); const { count } = await q; return count ?? 0; }
  catch { return 0; }
}

export default async function AdminDashboard() {
  const sessionUser = await getSessionUserSafe();
  const id = sessionUser?.user?.id;
  if (!id) redirect('/login');
  const role = toAppRole(sessionUser.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  const { data: prof } = await sb.from('profiles').select('name, avatar_url').eq('id', id).maybeSingle();

  const now = new Date();
  const in7 = new Date(now); in7.setDate(now.getDate() + 7);
  const last7 = new Date(now); last7.setDate(now.getDate() - 7);
  const startToday = new Date(now); startToday.setHours(0,0,0,0);

  // KPIs
  const [clients, trainers, admins, sessions7d, unreadNotifs, pending, newToday] = await Promise.all([
    safeCount(sb, 'users', (q) => q.eq('role', 'CLIENT')),
    safeCount(sb, 'users', (q) => q.in('role', ['PT','TRAINER'])),
    safeCount(sb, 'users', (q) => q.eq('role', 'ADMIN')),
    safeCount(sb, 'sessions', (q) => q.gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())),
    safeCount(sb, 'notifications', (q) => q.eq('user_id', id).eq('read', false)),
    (async () => {
      let c = await safeCount(sb, 'users', (q) => q.eq('approved', false));
      if (c === 0) c = await safeCount(sb, 'users', (q) => q.eq('status', 'PENDING'));
      return c;
    })(),
    safeCount(sb, 'users', (q) => q.gte('created_at', startToday.toISOString())),
  ]);

  // 1) Sessões por PT (semana) — agrupamos em memória
  const { data: rawWeek } = await sb
    .from('sessions')
    .select('id,trainer_id,scheduled_at')
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
    const { data: trows } = await sb.from('users').select('id,name,email').in('id', trainerIds);
    trainerNames = new Map((trows ?? []).map((u: any) => [u.id, u.name ?? u.email ?? u.id]));
  }
  const weekRows = Array.from(byPT.entries())
    .map(([id, c]) => ({ id, name: trainerNames.get(id) ?? id, count: c }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // 2) Clientes inativos ≥14d  (sem sessão recente)
  const since14 = new Date(now); since14.setDate(now.getDate() - 14);
  const totalClients = await safeCount(sb, 'users', (q) => q.eq('role', 'CLIENT'));
  const { data: actives } = await sb
    .from('sessions')
    .select('client_id')
    .gte('scheduled_at', since14.toISOString());
  const activeIds = new Set((actives ?? []).map((s: any) => s.client_id).filter(Boolean));
  const inactiveCount = Math.max(0, totalClients - activeIds.size);

  // 3) Novos registos por dia (últimos 14)
  const since14d = new Date(now); since14d.setDate(now.getDate() - 13); since14d.setHours(0,0,0,0);
  const { data: regRows } = await sb
    .from('users')
    .select('id, created_at')
    .gte('created_at', since14d.toISOString());
  const perDay = new Array<number>(14).fill(0);
  (regRows ?? []).forEach((u: any) => {
    const d = new Date(u.created_at); d.setHours(0,0,0,0);
    const idx = Math.round((+d - +since14d) / 86400000);
    if (idx >= 0 && idx < 14) perDay[idx] += 1;
  });

  const name = prof?.name ?? sessionUser.user.name ?? sessionUser.user.email ?? 'Utilizador';

  return (
    <div className="p-4 grid gap-3">
      <GreetingBanner name={name} roleTag="ADMIN" />
      <LiveBanners />
      <PushBootstrap />

      {/* KPIs */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))' }}>
        <KpiCard label="Clientes" value={clients} variant="primary" icon="🧑‍🤝‍🧑" />
        <KpiCard label="Treinadores" value={trainers} variant="accent" icon="🏋️" />
        
        <KpiCard label="Pendentes" value={pending} variant="warning" icon="⏳"
          footer={<Link href="/dashboard/admin/approvals" className="text-xs">ver aprovações</Link>} />
        <KpiCard label="Novos hoje" value={newToday} variant="info" icon="📈" />
        <KpiCard label="Sessões (7d)" value={sessions7d} variant="success" icon="📅" />
        <KpiCard label="Notificações" value={unreadNotifs} variant="warning" icon="🔔"
          footer={<span className="text-xs opacity-70">por ler</span>} />
        <KpiCard label="Clientes inativos ≥14d" value={inactiveCount} variant="danger" icon="⚠️"
          footer={<Link href="/dashboard/history" className="text-xs">ver histórico</Link>} />
        <div className="card p-2 flex items-center justify-between">
          <div className="pl-2">
            <div className="font-semibold text-sm">Novos registos (14d)</div>
            <div className="text-xs opacity-70">por dia</div>
          </div>
          <Sparkline points={perDay} />
        </div>
      </div>

      {/* Sessões por PT (semana) */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Sessões por PT (próx. 7 dias)</Typography>
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
                <TableRow><TableCell colSpan={2} align="center">Sem dados.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* Gestão de frases motivadoras */}
      <MotivationAdminCard />
    </div>
  );
}
