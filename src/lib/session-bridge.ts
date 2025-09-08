export type SessionUser = { id: string; email?: string | null; name?: string | null; role?: 'ADMIN' | 'PT' | 'CLIENT' };

export async function getSessionUserSafe(): Promise<SessionUser | null> {
  try {
    const { getServerSession } = await import('next-auth');
    const authMod: any = await import('@/lib/auth');
    const session: any = await getServerSession(authMod.authOptions ?? authMod.default ?? authMod);
    return session?.user ?? null;
  } catch {
    try {
      const authMod: any = await import('@/lib/auth');
      if (authMod?.auth) {
        const session: any = await authMod.auth();
        return session?.user ?? null;
      }
    } catch {}
  }
  return null;
}

export function assertRole(user: SessionUser | null, roles: Array<'ADMIN' | 'PT' | 'CLIENT'>) {
  return !!user && !!user.role && roles.includes(user.role);
}
