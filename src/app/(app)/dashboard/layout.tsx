// src/app/(app)/dashboard/layout.tsx
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import DashboardFrame from '@/components/layout/DashboardFrame';
import type { Role } from '@/components/header/HeaderCountsContext';
import {
  getAdminCounts,
  getClientCounts,
  getTrainerPtsCounts,
} from '@/lib/server/getInitialCounts';
import type { DashboardCountsSnapshot } from '@/types/dashboard-counts';

// (Opcional) se quiseres tentar puxar o nome do perfil da BD:
// import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // ✅ Gate unificado: NextAuth
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const role = normalizeRole((session.user as any)?.role);

  // Label básico a partir da sessão (sem depender de Supabase auth)
  let userLabel: string | undefined =
    session.user?.name || session.user?.email?.split('@')[0] || undefined;

  // (Opcional) tenta enriquecer com "profiles.full_name" sem exigir sessão Supabase
  // try {
  //   const userId = (session.user as any)?.id;
  //   if (userId) {
  //     const { data } = await supabaseAdmin
  //       .from('profiles')
  //       .select('full_name')
  //       .eq('id', userId) // ajusta se o teu profiles mapear para outro id
  //       .maybeSingle();
  //     if ((data as any)?.full_name) userLabel = (data as any).full_name;
  //   }
  // } catch {}

  const initialCounts = await resolveInitialCounts(role);

  return (
    <DashboardFrame role={role} userLabel={userLabel} initialCounts={initialCounts}>
      {children}
    </DashboardFrame>
  );
}

function normalizeRole(role: unknown): Role {
  const value = String(role ?? 'CLIENT').toUpperCase();
  if (value === 'ADMIN' || value === 'TRAINER' || value === 'CLIENT') {
    return value;
  }
  return 'CLIENT';
}

async function resolveInitialCounts(role: Role): Promise<DashboardCountsSnapshot> {
  if (role === 'ADMIN') {
    const admin = await getAdminCounts();
    return { admin };
  }

  if (role === 'TRAINER') {
    const [client, trainer] = await Promise.all([
      getClientCounts().catch(() => ({ messagesCount: 0, notificationsCount: 0 })),
      getTrainerPtsCounts(),
    ]);
    return { client, trainer };
  }

  const client = await getClientCounts();
  return { client };
}
