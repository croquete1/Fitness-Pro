import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { toAppRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  const role = toAppRole((session?.user as any)?.role);
  if (role !== 'admin') redirect('/dashboard');

  return (
    <section style={{ padding: 16 }}>
      <h1>Utilizadores</h1>
      <p>Gestão de utilizadores aparecerá aqui.</p>
    </section>
  );
}
