export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import GreetingBanner from '@/components/GreetingBanner';
import LiveBanners from '@/components/dashboard/LiveBanners';
import PushBootstrap from '@/components/dashboard/PushBootstrap';
import KpiCard from '@/components/dashboard/KpiCard';
import MotivationCard from '@/components/dashboard/MotivationCard';
import ProgressMini from '@/components/dashboard/ProgressMini';
import MiniSpark from '@/components/charts/MiniSpark';
import TaskListCard from '@/components/dashboard/TaskListCard';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

type SB = ReturnType<typeof createServerClient>;
async function safeCount(sb: SB, table: string, build?: (q:any)=>any){ try{ let q:any=sb.from(table).select('*',{count:'exact',head:true}); if(build) q=build(q); const {count}=await q; return count??0; }catch{return 0;} }

export default async function ClientDashboard() {
  const sessionUser = await getSessionUserSafe();
  if (!sessionUser?.user?.id) redirect('/login');

  const role = toAppRole(sessionUser.user.role) ?? 'CLIENT';
  if (role !== 'CLIENT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  const { data: prof } = await sb.from('profiles').select('name, avatar_url').eq('id', sessionUser.user.id).maybeSingle();
  const now = new Date(); const in7 = new Date(now); in7.setDate(now.getDate()+7);

  const [myPlans, myUpcoming, unread, upcomingRows] = await Promise.all([
    safeCount(sb, 'training_plans', (q:any)=> q.eq('client_id', sessionUser.user.id)),
    safeCount(sb, 'sessions', (q:any)=> q.eq('client_id', sessionUser.user.id).gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString())),
    safeCount(sb, 'notifications', (q:any)=> q.eq('user_id', sessionUser.user.id).eq('read', false)),
    sb.from('sessions').select('id,scheduled_at,location,status,trainer_id').eq('client_id', sessionUser.user.id).gte('scheduled_at', now.toISOString()).order('scheduled_at', { ascending: true }).limit(6).then(({ data }) => data ?? []),
  ]);

  // progresso (14d) – nº logs de exercício por dia
  const last14 = new Date(); last14.setDate(last14.getDate()-13); last14.setHours(0,0,0,0);
  const { data: logs } = await sb.from('exercise_logs' as any).select('id, created_at').eq('user_id', sessionUser.user.id).gte('created_at', last14.toISOString());
  const daily = new Array<number>(14).fill(0);
  (logs ?? []).forEach((r:any)=>{ const d=new Date(r.created_at); d.setHours(0,0,0,0); const idx=Math.round((+d - +last14)/86400000); if(idx>=0&&idx<14) daily[idx]++; });

  const points = await (async function loadHistory(){
    try {
      const { data } = await sb.from('profile_metrics_history' as any).select('user_id, measured_at, weight_kg').eq('user_id', sessionUser.user.id).order('measured_at', { ascending: true }).limit(24);
      if (data?.length) return (data as any[]).map((r)=>({ date: r.measured_at, weight: r.weight_kg ?? null }));
    } catch {}
    try {
      const { data } = await sb.from('profile_metrics' as any).select('weight_kg, updated_at').eq('user_id', sessionUser.user.id).maybeSingle();
      if (data) return [{ date: data.updated_at ?? new Date().toISOString(), weight: data.weight_kg ?? null }];
    } catch {}
    return [];
  })();

  const name = prof?.name ?? sessionUser.user.name ?? sessionUser.user.email ?? 'Utilizador';

  return (
    <div className="p-4 grid gap-3">
      <GreetingBanner name={name} />
      <LiveBanners />
      <PushBootstrap />

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        <KpiCard label="Os meus planos" value={myPlans} variant="accent" icon="📝" />
        <KpiCard label="Sessões (7d)" value={myUpcoming} variant="success" icon="📅" />
        <KpiCard label="Notificações" value={unread} variant="warning" icon="🔔" footer={<span className="small text-muted">por ler</span>} />
        <div className="card p-2 flex items-center justify-between">
          <div className="pl-2">
            <div className="font-semibold text-sm">Atividade (14d)</div>
            <div className="text-xs opacity-70">logs de exercício</div>
          </div>
          <MiniSpark data={daily} />
        </div>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
        <MotivationCard />
        <ProgressMini points={points} />
        <TaskListCard items={['Concluir sessão de hoje', 'Rever plano', 'Atualizar antropometria']} />
      </div>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Próximas sessões</Typography>
        <Table size="small">
          <TableHead>
            <TableRow><TableCell>Data</TableCell><TableCell>Local</TableCell><TableCell>Estado</TableCell><TableCell>PT</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {upcomingRows.map((s:any)=>(
              <TableRow key={s.id}>
                <TableCell>{s.scheduled_at ? new Date(s.scheduled_at).toLocaleString('pt-PT') : '—'}</TableCell>
                <TableCell>{s.location ?? '—'}</TableCell>
                <TableCell>{s.status ?? '—'}</TableCell>
                <TableCell>{s.trainer_id ?? '—'}</TableCell>
              </TableRow>
            ))}
            {upcomingRows.length===0 && <TableRow><TableCell colSpan={4} align="center">Sem sessões marcadas.</TableCell></TableRow>}
          </TableBody>
        </Table>
        <div className="mt-2 text-right"><Link href="/dashboard/sessions" className="text-sm">ver todas</Link></div>
      </Paper>
    </div>
  );
}
