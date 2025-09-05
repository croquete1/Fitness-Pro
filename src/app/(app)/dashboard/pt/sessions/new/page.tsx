// src/app/(app)/dashboard/pt/sessions/new/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import SchedulerClient from '../ui/SchedulerClient';

export default async function NewSessionPage() {
  const session = await getServerSession(authOptions);
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login');

  const role = toAppRole((user as any).role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();
  // clientes ligados a este PT
  const { data: links } = await sb
    .from('trainer_clients')
    .select('client_id')
    .eq('trainer_id', String(user.id));
  const clientIds = Array.from(new Set((links ?? []).map((l: any) => l.client_id)));

  let clients: { id: string; name?: string|null; email: string }[] = [];
  if (clientIds.length > 0) {
    const { data } = await sb
      .from('users')
      .select('id,name,email')
      .in('id', clientIds);
    clients = (data ?? []) as any[];
  }

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Agendar sessão</h1>
      <SchedulerClient clients={clients} />
    </div>
  );
}
