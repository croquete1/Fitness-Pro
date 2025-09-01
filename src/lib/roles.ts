import { Role } from '@prisma/client';

/** Converte valores vindos do NextAuth/session para o enum Prisma Role */
export function normalizeRole(input: unknown): Role | null {
  if (!input) return null;

  if (typeof input === 'string') {
    const up = input.toUpperCase();
    if (up === 'PT' || up === 'TRAINER' || up === 'COACH') return Role.TRAINER;
    if (up === 'ADMIN') return Role.ADMIN;
    if (up === 'CLIENT' || up === 'USER' || up === 'CUSTOMER' || up === 'ALUNO') return Role.CLIENT;
    return null;
  }

  // Já é Role válido?
  if ((Object.values(Role) as string[]).includes(input as string)) {
    return input as Role;
  }

  return null;
}