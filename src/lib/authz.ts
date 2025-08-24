// src/lib/authz.ts
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { authOptions } from '@/lib/auth';

type SessionUser = {
  id?: string | null;
  role?: string | Role | null; // pode vir "admin" | "pt" | "client" ou já como enum
  [key: string]: any;
};

function toRoleEnum(val?: string | Role | null): Role | undefined {
  if (!val) return undefined;
  if (typeof val !== 'string') return val;

  const up = val.toUpperCase();
  if (up === 'ADMIN') return Role.ADMIN;
  if (up === 'TRAINER' || up === 'PT') return Role.TRAINER; // aceita "pt"
  if (up === 'CLIENT') return Role.CLIENT;
  return undefined;
}

/**
 * Garante sessão válida e (opcionalmente) role permitido.
 * Devolve { user } OU { error } (NextResponse).
 */
export async function requireUser(allowed?: Role[]) {
  const session = await getServerSession(authOptions);
  const sUser = (session?.user ?? {}) as SessionUser;
  const roleEnum = toRoleEnum(sUser.role);

  // precisa de utilizador autenticado com id
  if (!sUser?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  // se foi pedido um conjunto de roles, tem de cumprir
  if (allowed && (!roleEnum || !allowed.includes(roleEnum))) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  // devolve o user, normalizando role para enum
  return { user: { ...sUser, role: roleEnum } };
}

export function requireAdmin() {
  return requireUser([Role.ADMIN]);
}

export function requireTrainer() {
  return requireUser([Role.TRAINER]);
}

export function requireAdminOrTrainer() {
  return requireUser([Role.ADMIN, Role.TRAINER]);
}
