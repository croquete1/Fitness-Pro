// src/lib/logger.ts
import prisma from "@/lib/prisma";

type LogBase = {
  actorId?: string | null;     // quem executou
  target?: string | null;      // id do utilizador alvo
  meta?: Record<string, any>;  // dados adicionais
  message?: string;            // mensagem legível (fica em meta.message)
};

export async function writeLog(action: string, input: LogBase) {
  const { actorId = null, target = null, meta = {}, message } = input;
  const mergedMeta = message ? { ...meta, message } : meta;

  return prisma.auditLog.create({
    data: {
      action,
      actorId: actorId ?? undefined,
      target: target ?? undefined,
      meta: Object.keys(mergedMeta).length ? mergedMeta : undefined,
      createdAt: new Date(),
    },
  });
}

// Conveniências semânticas
export async function logUserSignedUp(params: { userId: string; email?: string; role: string }) {
  const { userId, email, role } = params;
  return writeLog("USER_SIGNED_UP", {
    target: userId,
    message: `Utilizador inscrito (role inicial: ${role})${email ? ` — ${email}` : ""}`,
    meta: { role, email },
  });
}

export async function logUserApproved(params: { adminId?: string | null; userId: string; toRole: string }) {
  const { adminId = null, userId, toRole } = params;
  return writeLog("USER_APPROVED", {
    actorId: adminId ?? null,
    target: userId,
    message: `Utilizador aprovado — novo role: ${toRole}`,
    meta: { toRole },
  });
}

export async function logUserRejected(params: { adminId?: string | null; userId: string; reason?: string }) {
  const { adminId = null, userId, reason } = params;
  return writeLog("USER_REJECTED", {
    actorId: adminId ?? null,
    target: userId,
    message: `Utilizador rejeitado${reason ? ` — motivo: ${reason}` : ""}`,
    meta: { reason },
  });
}
