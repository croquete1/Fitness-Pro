// src/app/(app)/dashboard/pt/clients/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PackageEditor from '@/components/packages/PackageEditor';

export default async function PtClientsPage() {
  const session = await getServerSession(authOptions);
  const me = session?.user as any;
  if (!me) redirect('/login');

  return (
    <div className="card" style={{ padding: 16 }}>
      <h1 style={{ margin: 0 }}>Minha carteira</h1>

      {/* Inline dialog de criação */}
      <PackageEditor
        initial={{ trainerId: me.id }}
        mode="create"
        onClose={() => {}}
      />
    </div>
  );
}