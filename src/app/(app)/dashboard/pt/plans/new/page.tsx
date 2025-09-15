export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import PlanEditor from '@/components/pt/PlanEditor';

export default async function Page() {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login' as Route);
  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard' as Route);

  const sb = createServerClient();
  // Cria rascunho mínimo (PT como owner)
  const { data: created, error } = await sb
    .from('training_plans')
    .insert({ title: 'Novo plano', trainer_id: user.id })
    .select('id, title')
    .maybeSingle();

  if (error || !created) redirect('/dashboard/pt/plans' as Route);

  return (
    <main className="p-4 md:p-6">
      <PlanEditor planId={created.id} initialTitle={created.title ?? 'Plano'} />
    </main>
  );
}
