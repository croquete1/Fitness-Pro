import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) return new NextResponse('Unauthorized', { status: 401 });

  const appRole = toAppRole(user.role) || 'CLIENT';
  const sb = createServerClient();

  const banners: Array<{ id: string; kind: 'info' | 'warning' | 'success'; title: string; body?: string; link?: string }> = [];

  if (appRole === 'CLIENT') {
    // pacote a expirar < 7 dias
    const today = new Date(); today.setHours(0,0,0,0);
    const in7 = new Date(today); in7.setDate(in7.getDate() + 7);
    const { data: packs = [] } = await sb
      .from('client_packages')
      .select('id,package_name,end_date')
      .eq('client_id', user.id)
      .gte('end_date', today.toISOString())
      .lte('end_date', in7.toISOString())
      .order('end_date', { ascending: true })
      .limit(1);
    if (packs.length) {
      banners.push({
        id: `pkg-${packs[0].id}`,
        kind: 'warning',
        title: 'O teu pacote está a expirar',
        body: `Expira em breve: ${packs[0].package_name}`,
        link: '/dashboard/pt/packages' as any,
      });
    }
  }

  if (appRole === 'PT') {
    // próxima sessão hoje
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(end.getDate()+1);
    const { data: sessions = [] } = await sb
      .from('pt_sessions')
      .select('id,start')
      .eq('trainer_id', user.id)
      .gte('start', start.toISOString())
      .lt('start', end.toISOString())
      .order('start', { ascending: true })
      .limit(1);
    if (sessions.length) {
      banners.push({
        id: `sess-${sessions[0].id}`,
        kind: 'info',
        title: 'Tens sessão marcada hoje',
        body: `Próxima: ${new Date(sessions[0].start).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`,
        link: '/dashboard/pt/sessions/calendar' as any,
      });
    }
  }

  return NextResponse.json({ banners });
}
