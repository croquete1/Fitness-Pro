// src/app/(app)/dashboard/layout.tsx
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import DashboardFrame from '@/components/layout/DashboardFrame';

// (Opcional) se quiseres tentar puxar o nome do perfil da BD:
// import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // ✅ Gate unificado: NextAuth
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const role = String((session.user as any)?.role ?? 'CLIENT').toUpperCase();

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

  return (
    <DashboardFrame role={role} userLabel={userLabel}>
      {children}
    </DashboardFrame>
  );
}
