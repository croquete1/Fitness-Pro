// src/lib/roles.ts
import { Role } from '@prisma/client';

/**
 * Converte qualquer valor vindo da sessão/BD para o enum Role do Prisma.
 * Aceita strings em qualquer casing e alguns alias comuns.
 * Retorna null se não conseguir mapear.
 */
export function normalizeRole(input: unknown): Role | null {
  if (!input) return null;

  // Se já vier como enum válido
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
 * Helper de autorização simples: ADMIN ou TRAINER podem gerir/alocar clientes.
 */
export function canManageClients(role: Role | null | undefined): boolean {
  return role === Role.ADMIN || role === Role.TRAINER;
}