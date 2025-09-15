;
import type { Role as DbRole, Status as DbStatus } from '@prisma/client'; // Se já não usares Prisma, troca para os teus types locais
// Se não tiveres estes types, cria um fallback:
type FallbackRole = 'ADMIN' | 'PT' | 'CLIENT';
type FallbackStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

type Role = DbRole extends string ? DbRole : FallbackRole;
type Status = DbStatus extends string ? DbStatus : FallbackStatus;

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: Role | null;
  status?: Status | null;
};

export async function getSessionUserSafe(): Promise<SessionUser | null> {
  // getServerSession sem options funciona na App Router se tens a rota /api/auth/[...nextauth]
  // Se precisares, importa aqui as options:  const { authOptions } = await import('@/app/api/auth/[...nextauth]/authOptions');
  const session = await getServerSession();
  return (session?.user as any as SessionUser) ?? null;
}

export function assertRole(user: SessionUser | null, roles: Role[]) {
  if (!user) return false;
  if (!user.role) return false;
  return roles.includes(user.role);
}
