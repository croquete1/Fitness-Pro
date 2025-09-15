// src/app/page.tsx
import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';

// Evita cache estática
export const dynamic = 'force-dynamic';

export default async function RootPage() {
  // Lê a sessão de forma segura (compatível com o shape “flat” e o antigo `.user`)
  const sessionUser = await getSessionUserSafe().catch(() => null);
  const userId =
    (sessionUser as any)?.id ??
    (sessionUser as any)?.user?.id ??
    null;

  // Se autenticado → dashboard; caso contrário → login
  redirect(userId ? '/dashboard' : '/login');
}
