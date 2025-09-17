// src/app/(app)/dashboard/admin/profile/page.tsx
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';

export default async function AdminProfilePage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const sb = createServerClient();
  const { data: prof } = await sb
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', session.user.id)
    .maybeSingle();

  return (
    <main className="p-4 md:p-6 space-y-4">
      <PageHeader title="⚙️ O meu perfil" subtitle="Atualiza os teus dados." />
      <Card>
        <CardContent>
          <form action="/api/account/profile" method="post" className="grid gap-3 max-w-lg">
            <input type="hidden" name="id" defaultValue={session.user.id} />
            <label className="text-sm">Nome</label>
            <input name="name" defaultValue={prof?.name ?? ''} placeholder="O teu nome" />
            <label className="text-sm">Avatar URL</label>
            <input name="avatar_url" defaultValue={prof?.avatar_url ?? ''} placeholder="https://…" />
            <button className="btn primary w-fit">Guardar</button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
