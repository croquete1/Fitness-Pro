export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KpiCard from '@/components/dashboard/KpiCard';
import GreetingBanner from '@/components/GreetingBanner';
import MiniSpark from '@/components/charts/MiniSpark';
import TaskListCard from '@/components/dashboard/TaskListCard';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type SB = ReturnType<typeof createServerClient>;
async function safeCount(sb: SB, table: string, build?: (q:any)=>any){ try{ let q:any=sb.from(table).select('*',{count:'exact',head:true}); if(build) q=build(q); const {count}=await q; return count??0; }catch{return 0;} }

export default async function PtHome() {
  const session = await getSessionUserSafe();
  const me = session?.user; if (!me?.id) redirect('/login');
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role!=='PT' && role!=='ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  const now = new Date();
  const in7 = new Date(now); in7.setDate(now.getDate()+7);
  const since14 = new Date(now); since14.setDate(now.getDate()-13); since14.setHours(0,0,0,0);

  // Clientes do PT (via planos + sessões)
  const ids = new Set<string>();
  try{ const {data}=await sb.from('training_plans').select('client_id').eq('trainer_id', me.id); (data??[]).forEach((r:any)=>r?.client_id && ids.add(r.client_id)); }catch{}
  try{ const {data}=await sb.from('sessions').select('client_id').eq('trainer_id', me.id); (data??[]).forEach((r:any)=>r?.client_id && ids.add(r.client_id)); }catch{}
  const clients = ids.size;

  const upcoming = await safeCount(sb, 'sessions', (q:any)=> q.eq('trainer_id', me.id).gte('scheduled_at', now.toISOString()).lt('scheduled_at', in7.toISOString()));
  const plans = await safeCount(sb, 'training_plans', (q:any)=> q.eq('trainer_id', me.id));
  const { data: reg } = await sb.from('sessions').select('id, created_at').eq('trainer_id', me.id).gte('created_at', since14.toISOString());
  const daily = new Array<number>(14).fill(0);
  (reg??[]).forEach((r:any)=>{ const d=new Date(r.created_at); d.setHours(0,0,0,0); const idx=Math.round((+d - +since14)/86400000); if(idx>=0&&idx<14) daily[idx]++; });

  return (
    <div className="p-4 grid gap-3">
      <GreetingBanner name={me.name ?? me.email ?? 'Utilizador'} roleTag="PT" />
      <section className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))' }}>
        <KpiCard label="Meus clientes" value={clients} variant="accent" icon="🧑‍🤝‍🧑"
          footer={<Link href="/dashboard/pt/clients" className="text-xs">ver clientes</Link>} />
        <KpiCard label="Os meus planos" value={plans} variant="primary" icon="🗂️"
          footer={<Link href="/dashboard/pt/plans" className="text-xs">gerir planos</Link>} />
        <KpiCard label="Sessões (7d)" value={upcoming} variant="success" icon="📅" />
        <div className="card p-2 flex items-center justify-between">
          <div className="pl-2">
            <div className="font-semibold text-sm">Atividade (14d)</div>
            <div className="text-xs opacity-70">sessões criadas</div>
          </div>
          <MiniSpark data={daily}/>
        </div>
      </section>
      <TaskListCard items={[
        'Rever planos ativos',
        'Confirmar horários das próximas sessões',
        'Enviar mensagem a clientes inativos',
      ]}/>
    </div>
  );
}
