export const dynamic = 'force-dynamic';

import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import AdminExerciseCatalog from '@/components/exercise/AdminExerciseCatalog';

export default async function Page() {
  const me = await getSessionUser();
  if (!me) redirect('/login');
  if (toAppRole(me.role) !== 'ADMIN') redirect('/dashboard');

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Catálogo de Exercícios</h1>
      </div>
      <AdminExerciseCatalog />
    </div>
  );
}