import { auth } from '@/lib/auth';
import Link from 'next/link';
import { canManageExercises } from '@/lib/authz';

export default async function AdminExercisesPage() {
  const session = await auth();
  const canCreate = canManageExercises(session?.user?.role as any);

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Catálogo de exercícios</h1>
        {canCreate && (
          <Link href="/dashboard/admin/exercises/new" className="btn primary">
            ➕ Novo exercício
          </Link>
        )}
      </div>
      {/* ... resto da listagem ... */}
    </div>
  );
}
