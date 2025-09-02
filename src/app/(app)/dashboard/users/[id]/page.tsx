import ClientProfileClient from './profile.client';
import { createServerClient } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ClientProfilePage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users_view')
    .select('id,name,email,role,status,createdAt')
    .eq('id', params.id)
    .single();

  if (!user) notFound();

  // PTs disponíveis (para dropdown)
  const { data: trainers } = await supabase
    .from('users_view')
    .select('id,name,email')
    .eq('role', 'TRAINER')
    .order('name', { ascending: true });

  // vínculo atual
  const { data: link } = await supabase
    .from('trainer_clients')
    .select('id,trainer_id,client_id')
    .eq('client_id', params.id)
    .maybeSingle();

  return (
    <ClientProfileClient
      user={{
        id: user.id, name: user.name ?? null, email: user.email,
        role: user.role, status: user.status, createdAt: user.createdAt ?? null
      }}
      trainers={(trainers ?? []).map(t => ({ id: t.id, name: t.name ?? t.email }))}
      currentTrainerId={link?.trainer_id ?? null}
    />
  );
}