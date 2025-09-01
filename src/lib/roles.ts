// src/lib/roles.ts
import { Role } from '@prisma/client';

/**
 * Papel "de aplicação" — simples string literal, útil para componentes e guards.
 * Mantém paridade com o enum Prisma Role, mas tolera aliases vindos da sessão.
 */
export type AppRole = 'ADMIN' | 'TRAINER' | 'CLIENT';

/**
 * Normaliza um valor qualquer (string/enum) para o enum Prisma Role.
 * Aceita aliases em qualquer casing (ex: 'pt', 'coach', 'user', 'aluno').
 * Retorna null se não conseguir mapear.
 */
export function normalizeRole(input: unknown): Role | null {
  if (!input) return null;

  // Já é o enum Prisma Role?
  if (Object.values(Role).includes(input as Role)) {
    return input as Role;
  }

  if (typeof input === 'string') {
    const v = input.trim().toUpperCase();
    switch (v) {
      case 'ADMIN':
        return Role.ADMIN;
      case 'TRAINER':
      case 'PT':
      case 'COACH':
        return Role.TRAINER;
      case 'CLIENT':
      case 'USER':
      case 'CUSTOMER':
      case 'ALUNO':
      case 'STUDENT':
        return Role.CLIENT;
      default:
        return null;
    }
  }

  return null;
}

/**
 * Converte um valor qualquer para AppRole (ADMIN | TRAINER | CLIENT).
 * Útil em componentes que esperam strings simples e não o enum Prisma.
 */
export function toAppRole(input: unknown): AppRole | null {
  const r = normalizeRole(input);
  if (!r) return null;
  switch (r) {
    case Role.ADMIN:
      return 'ADMIN';
    case Role.TRAINER:
      return 'TRAINER';
    case Role.CLIENT:
      return 'CLIENT';
    default:
      return null;
  }
}

/** Helpers booleanos diretos */
export function isAdmin(input: unknown): boolean {
  const r = normalizeRole(input);
  return r === Role.ADMIN;
}

export function isTrainer(input: unknown): boolean {
  const r = normalizeRole(input);
  return r === Role.TRAINER;
}

export function isClient(input: unknown): boolean {
  const r = normalizeRole(input);
  return r === Role.CLIENT;
}

/**
 * Quem pode gerir/alocar clientes (PT e ADMIN).
 * Aceita Role (Prisma), AppRole (string) ou string arbitrária (ex: da sessão).
 */
export function canManageClients(input: unknown): boolean {
  const r = normalizeRole(input);
  return r === Role.ADMIN || r === Role.TRAINER;
}

/**
 * Quem tem acesso a faturação/pagamentos (normalmente ADMIN e TRAINER).
 * Exportada porque é usada pela SidebarPT e afins.
 */
export function hasBillingAccess(input: unknown): boolean {
  const r = normalizeRole(input);
  return r === Role.ADMIN || r === Role.TRAINER;
}

/**
 * Quem tem acesso a funcionalidades de treinador (treinos, planos, carteira).
 */
export function hasTrainerFeatures(input: unknown): boolean {
  const r = normalizeRole(input);
  return r === Role.ADMIN || r === Role.TRAINER;
}

/**
 * Cast seguro para Role (Prisma). Lança erro se não conseguir mapear.
 * Útil em rotas/API onde prefiras "fail fast".
 */
export function assertPrismaRole(input: unknown): Role {
  const r = normalizeRole(input);
  if (!r) throw new Error('Invalid role');
  return r;
}