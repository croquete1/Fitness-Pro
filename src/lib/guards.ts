import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

export async function requireSession() {
  const session = await getSessionUserSafe();
  const user = session?.user;
  if (!user?.id) redirect('/login');
  const role = toAppRole(user.role) ?? 'CLIENT';
  return { session, user, role };
}

export function ensureRole(role: 'ADMIN' | 'PT' | 'CLIENT', actual: 'ADMIN' | 'PT' | 'CLIENT') {
  if (role === 'ADMIN' && actual !== 'ADMIN') redirect('/dashboard');
  if (role === 'PT' && actual !== 'PT') redirect('/dashboard');
  if (role === 'CLIENT' && actual !== 'CLIENT') redirect('/dashboard');
}
