// src/app/(app)/dashboard/pt/profile/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';
import ProfileForm from '@/app/(app)/dashboard/admin/profile/ProfileForm.client';

export default async function PTProfilePage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  const sb = createServerClient();

  const { data: prof } = await sb
    .from('profiles')
    .select('name, username, bio, avatar_url')
    .eq('id', session.user.id)
    .maybeSingle();

  const { data: priv } = await sb
    .from('profile_private')
    .select('phone')
    .eq('user_id', session.user.id)
    .maybeSingle();

  const initial = {
    name: prof?.name ?? null,
    username: prof?.username ?? null,
    bio: prof?.bio ?? null,
    avatar_url: prof?.avatar_url ?? null,
    phone: priv?.phone ?? null,
  };

  return (
    <main className="p-4 md:p-6 space-y-4">
      <PageHeader title="O meu perfil (PT)" />
      <Card>
        <CardContent className="space-y-4">
          <ProfileForm userId={String(session.user.id)} initial={initial} canEditPrivate />
        </CardContent>
      </Card>
    </main>
  );
}
