// src/app/(app)/dashboard/admin/plans/new/page.tsx
export const dynamic = 'force-dynamic';

import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import AdminPlanForm from '@/components/plan/AdminPlanForm';

export default async function NewAdminPlanPage() {
  const me = await getSessionUser();
  if (!me) redirect('/login');
  if (toAppRole(me.role) !== 'ADMIN') redirect('/dashboard');

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div className="card" style={{ padding: 12 }}>
        <h1 style={{ margin: 0 }}>Novo plano de treino</h1>
        <p style={{ marginTop: 6, opacity: .7, fontSize: 14 }}>
          Cria um plano e disponibiliza-o aos Personal Trainers.
        </p>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <AdminPlanForm />
      </div>
    </div>
  );
}