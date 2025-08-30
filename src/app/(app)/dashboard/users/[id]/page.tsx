export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { createServerClient } from '@/lib/supabaseServer';
import UserProfileTabs from '@/components/users/UserProfileTabs';

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const me: any = session.user;
  const isAdminOrTrainer =
    me?.role === 'ADMIN' || me?.role === 'TRAINER' || me?.role === Role.ADMIN || me?.role === Role.TRAINER;

  const id = params.id;

  const u = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, status: true, phone: true, createdAt: true },
  });
  if (!u) {
    return <div className="card" style={{ padding: 16 }}>Utilizador não encontrado.</div>;
  }

  const sb = createServerClient();
  const plans =
    (
      await sb
        .from('training_plans')
        .select('id,title,status,updated_at,trainer_id,client_id')
        .or(`trainer_id.eq.${id},client_id.eq.${id}`)
        .order('updated_at', { ascending: false })
        .limit(50)
    ).data ?? [];

  const packages =
    (
      await sb
        .from('client_packages')
        .select('id,package_name,status,start_date,end_date,client_id,trainer_id')
        .or(`client_id.eq.${id},trainer_id.eq.${id}`)
        .order('start_date', { ascending: false })
        .limit(50)
    ).data ?? [];

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>{u.name || 'Utilizador'} <span className="chip">{String(u.role)}</span></h1>
      <UserProfileTabs user={u as any} plans={plans as any} packages={packages as any} isAdminOrTrainer={isAdminOrTrainer} />
    </div>
  );
}
