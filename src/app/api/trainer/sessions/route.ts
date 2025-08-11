// src/app/api/trainer/sessions/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { canAccessTrainer, isAdmin } from "@/lib/rbac";
import type { $Enums } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // evita static/prerender p/ API

type Role3 = "ADMIN" | "TRAINER" | "CLIENT";

// --- Helpers ---
function normalizeStatus(input?: string | null): $Enums.SessionStatus | undefined {
  if (!input) return undefined;
  switch (input.toLowerCase()) {
    case "pendente":
    case "aceite":
    case "recusada":
    case "cancelada":
    case "realizada":
      // Cast necessário porque $Enums.SessionStatus é um union interno do Prisma
      return input.toLowerCase() as $Enums.SessionStatus;
    default:
      return undefined;
  }
}

function safeDate(d: string | Date | undefined): Date | undefined {
  if (!d) return undefined;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? undefined : dt;
}

function computeRange(now = new Date(), range?: string) {
  const start = new Date(now);
  start.setSeconds(0, 0);
  let end: Date;

  switch ((range || "7d").toLowerCase()) {
    case "today": {
      const e = new Date(start);
      e.setHours(23, 59, 59, 999);
      end = e;
      break;
    }
    case "30d": {
      const e = new Date(start);
      e.setDate(e.getDate() + 30);
      end = e;
      break;
    }
    case "7d":
    default: {
      const e = new Date(start);
      e.setDate(e.getDate() + 7);
      end = e;
      break;
    }
  }
  return { start, end };
}

// --- GET ---
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role as Role3;
    if (!canAccessTrainer(role) && role !== "CLIENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const trainerIdParam = searchParams.get("trainerId");
    const range = searchParams.get("range") || undefined;
    const meId = (session.user as any).id as string;

    const { start, end } = computeRange(new Date(), range);

    const where: any = {
      scheduledAt: { gte: start, lt: end },
    };

    if (role === "TRAINER") where.trainerId = meId;
    else if (role === "CLIENT") where.clientId = meId;
    else if (isAdmin(role) && trainerIdParam) where.trainerId = trainerIdParam;

    const sessions = await prisma.session.findMany({
      where,
      include: {
        trainer: { select: { id: true, name: true, email: true } },
        client: { select: { id: true, name: true, email: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 50,
    });

    return NextResponse.json({ sessions });
  } catch {
    return NextResponse.json({ error: "Erro ao obter sessões" }, { status: 500 });
  }
}

// --- POST ---
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role as Role3;
    if (!canAccessTrainer(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 422 });

    const { trainerId, clientId, scheduledAt, status, notes } = body as {
      trainerId?: string;
      clientId?: string;
      scheduledAt?: string | Date;
      status?: string | null;
      notes?: string | null;
    };

    const meId = (session.user as any).id as string;

    if (!clientId || !scheduledAt) {
      return NextResponse.json(
        { error: "clientId e scheduledAt são obrigatórios" },
        { status: 400 }
      );
    }

    const when = safeDate(scheduledAt);
    if (!when) return NextResponse.json({ error: "scheduledAt inválido" }, { status: 400 });

    // TRAINER só cria para si próprio
    const effectiveTrainerId = role === "TRAINER" ? meId : (trainerId ?? meId);
    if (role === "TRAINER" && trainerId && trainerId !== meId) {
      return NextResponse.json(
        { error: "Sem permissão para criar para outro treinador" },
        { status: 403 }
      );
    }

    await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: effectiveTrainerId } }),
      prisma.user.findUniqueOrThrow({ where: { id: clientId } }),
    ]);

    const created = await prisma.session.create({
      data: {
        trainerId: effectiveTrainerId,
        clientId,
        scheduledAt: when,
        status: normalizeStatus(status),
        notes: notes ?? null,
      },
    });

    return NextResponse.json({ session: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar sessão" }, { status: 500 });
  }
}

// --- PATCH ---
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role as Role3;
    if (!canAccessTrainer(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 422 });

    const { id, scheduledAt, status } = body as {
      id?: string;
      scheduledAt?: string | Date;
      status?: string | null;
    };

    if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });

    const existing = await prisma.session.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });

    const meId = (session.user as any).id as string;
    if (role === "TRAINER" && existing.trainerId !== meId) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const when = safeDate(scheduledAt);

    const updated = await prisma.session.update({
      where: { id },
      data: {
        scheduledAt: when ?? undefined,
        status: normalizeStatus(status),
      },
    });

    return NextResponse.json({ session: updated });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar sessão" }, { status: 500 });
  }
}
