// src/app/(app)/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabaseServer';

// Garante execução no servidor em cada pedido (evita cache/flash)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Redireciona o utilizador para o dashboard certo, com base no perfil.
 * Preferimos Supabase (perfil.profiles.role). Se não houver role definido,
 * assume cliente por defeito para não deixar o utilizador “em branco”.
 */
export default async function DashboardIndex() {
  const sb = createServerClient();
  let role: string | null = null;

  try {
    const { data: { user } } = await sb.auth.getUser();

    if (user) {
      const { data: profile } = await sb
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      role = (profile as any)?.role ?? null;
    }
  } catch {
    // silencioso: seguimos para fallback
  }

  if (role === 'ADMIN')  redirect('/dashboard/admin');
  if (role === 'TRAINER') redirect('/dashboard/pt');
  // fallback seguro
  redirect('/dashboard/clients');
}
