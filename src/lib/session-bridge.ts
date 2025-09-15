// src/lib/session-bridge.ts
// Ponte única para ler sessão (NextAuth v5/v4 compat) e validar perfis/roles.
// NÃO usa Prisma.

import { getServerSession, type DefaultSession } from "next-auth";
import type { NextRequest } from "next/server";
import { authConfig } from "@/lib/auth";

export type AppRole = "ADMIN" | "USER";
export type SessionUser = (DefaultSession["user"] & { role?: AppRole }) | undefined | null;

function toArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val];
}

/**
 * Obtém sessão e utilizador de forma segura (server-side).
 * Retorna sempre um objeto com { session, user }.
 */
export async function getSessionUserSafe() {
  // getServerSession funciona no App Router com NextAuth config.
  const session = await getServerSession(authConfig as any);
  const user = (session?.user ?? null) as SessionUser;
  return { session, user };
}

/**
 * Verifica se o utilizador tem o(s) role(s) exigido(s).
 * Lança erro 401 se não autenticado, 403 se autenticado mas sem permissão.
 * Retorna o utilizador (tipado) quando a validação passa.
 */
export async function assertRole(required: AppRole | AppRole[]) {
  const { user } = await getSessionUserSafe();

  if (!user) {
    const err = new Error("UNAUTHORIZED");
    // @ts-ignore – útil em handlers para definir status
    err.status = 401;
    throw err;
  }

  const need = toArray(required);
  const has = !!user.role && need.includes(user.role as AppRole);

  if (!has) {
    const err = new Error("FORBIDDEN");
    // @ts-ignore
    err.status = 403;
    throw err;
  }

  return user;
}

/**
 * Útil em handlers quando basta garantir sessão (sem validar role).
 */
export async function requireAuth() {
  const { session, user } = await getSessionUserSafe();
  if (!user) {
    const err = new Error("UNAUTHORIZED");
    // @ts-ignore
    err.status = 401;
    throw err;
  }
  return { session, user };
}

/**
 * Helper opcional para usar em middlewares/handlers que recebem NextRequest,
 * caso precises em algum endpoint (mantém assinatura simples).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function assertRoleFromRequest(
  _req: NextRequest,
  required: AppRole | AppRole[]
) {
  return assertRole(required);
}