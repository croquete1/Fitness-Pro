import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { canAccessTrainer, isAdmin } from "@/lib/rbac";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";
  if (!canAccessTrainer(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 422 });

  const existing = await prisma.session.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });

  // TRAINER só pode editar se for o dono
  const meId = (session.user as any).id as string;
  if (!isAdmin(role) && existing.trainerId !== meId) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { trainerId, clientId, scheduledAt, status, notes } = body as {
    trainerId?: string;
    clientId?: string;
    scheduledAt?: string | Date;
    status?: any;
    notes?: string | null;
  };

  // TRAINER não pode “mudar de dono” da sessão
  if (!isAdmin(role) && trainerId && trainerId !== existing.trainerId) {
    return NextResponse.json(
      { error: "Não pode alterar o treinador responsável" },
      { status: 403 }
    );
  }

  const updated = await prisma.session.update({
    where: { id: params.id },
    data: {
      trainerId: isAdmin(role) ? trainerId ?? existing.trainerId : existing.trainerId,
      clientId: clientId ?? existing.clientId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : existing.scheduledAt,
      status: status ?? existing.status,
      notes: typeof notes === "undefined" ? existing.notes : notes,
    },
  });

  return NextResponse.json({ session: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";
  if (!canAccessTrainer(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.session.findUnique({
    where: { id: params.id },
    select: { id: true, trainerId: true },
  });
  if (!existing) return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 });

  const meId = (session.user as any).id as string;
  if (!isAdmin(role) && existing.trainerId !== meId) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  await prisma.session.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
