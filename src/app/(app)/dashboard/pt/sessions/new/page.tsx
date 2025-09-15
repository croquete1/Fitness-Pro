export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';

export default async function NewSessionPage() {
  const session = await getSessionUserSafe();
  const user = (session as any)?.user;
  if (!user?.id) redirect('/login');

  const role = toAppRole(user.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') redirect('/dashboard');

  return (
    <main className="p-6 space-y-6">
      <PageHeader title="Nova Sessão" subtitle="Cria uma sessão com um cliente" />
      <Card>
        <CardContent>
          {/* Coloca aqui o teu formulário (client component) */}
          <div className="text-muted small">
            (Formulário de criação de sessão — client component a integrar)
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
