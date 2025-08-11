// src/app/api/trainer/sessions/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { canAccessTrainer, isAdmin } from "@/lib/rbac";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";
  if (!canAccessTrainer(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const _mine = searchParams.get("mine") === "true"; // variável não usada: prefixo _ para satisfazer ESLint
  const trainerIdParam = searchParams.get("trainerId");
  const meId = (session.user as any).id as string;

  const where: any = {};
  if (role === "TRAINER") {
    // Trainer: por defeito, só vê as próprias
    where.trainerId = meId;
  } else if (isAdmin(role)) {
    // Admin: pode filtrar por treinador se quiser
    if (trainerIdParam) where.trainerId = trainerIdParam;
  }

  const sessions = await prisma.session.findMany({
    where,
    include: {
      trainer: { select: { id: true, name: true, email: true } },
      client: { select: { id: true, name: true, email: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({ sessions });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";
  if (!canAccessTrainer(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 422 });

  const { trainerId, clientId, scheduledAt, status, notes } = body as {
    trainerId?: string;
    clientId?: string;
    scheduledAt?: string | Date;
    status?: any; // mantém livre para não acoplar ao enum
    notes?: string | null;
  };

  const meId = (session.user as any).id as string;

  if (!clientId || !scheduledAt) {
    return NextResponse.json(
      { error: "clientId e scheduledAt são obrigatórios" },
      { status: 400 }
    );
  }

  // TRAINER só pode criar para si próprio
  const effectiveTrainerId = role === "TRAINER" ? meId : (trainerId ?? meId);
  if (role === "TRAINER" && trainerId && trainerId !== meId) {
    return NextResponse.json(
      { error: "Sem permissão para criar para outro treinador" },
      { status: 403 }
    );
  }

  // (opcional) validar existência dos utilizadores
  await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: effectiveTrainerId } }),
    prisma.user.findUniqueOrThrow({ where: { id: clientId } }),
  ]);

  const created = await prisma.session.create({
    data: {
      trainerId: effectiveTrainerId,
      clientId,
      scheduledAt: new Date(scheduledAt),
      status: status ?? undefined,
      notes: notes ?? null,
    },
  });

  return NextResponse.json({ session: created }, { status: 201 });
}
