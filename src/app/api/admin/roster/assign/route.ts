// src/app/api/admin/roster/assign/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { trainerId?: string; clientId?: string };

async function readBody(req: Request): Promise<Body> {
  try {
    const json = await req.json();
    if (json && typeof json === "object") return json as Body;
  } catch {}
  try {
    const fd = await req.formData();
    return {
      trainerId: (fd.get("trainerId") as string) ?? undefined,
      clientId: (fd.get("clientId") as string) ?? undefined,
    };
  } catch {}
  return {};
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const actorId = (session?.user as any)?.id ?? null;

    const { trainerId, clientId } = await readBody(req);
    if (!trainerId || !clientId) {
      return NextResponse.json({ ok: false, error: "MISSING_PARAMS" }, { status: 400 });
    }

    // Validar existência de utilizadores
    const [trainer, client] = await Promise.all([
      prisma.user.findUnique({ where: { id: trainerId }, select: { id: true, email: true, name: true, role: true } }),
      prisma.user.findUnique({ where: { id: clientId }, select: { id: true, email: true, name: true, role: true } }),
    ]);
    if (!trainer || !client) {
      return NextResponse.json({ ok: false, error: "USER_NOT_FOUND" }, { status: 404 });
    }

    // Atribuição idempotente (chave única composta)
    const assigned = await prisma.trainerClient.upsert({
      where: { trainerId_clientId: { trainerId, clientId } },
      update: {},
      create: { trainerId, clientId },
      select: { id: true, trainerId: true, clientId: true, createdAt: true },
    });

    // Audit log para notificações do treinador
    await prisma.auditLog.create({
      data: {
        actorId,
        message: "CLIENT_ASSIGNED_TO_TRAINER",
        target: trainerId, // <- o "destinatário" da notificação é o trainer
        diff: {
          assignedId: assigned.id,
          trainerId,
          clientId,
        },
      },
    });

    return NextResponse.json({ ok: true, data: assigned });
  } catch (e: any) {
    console.error("[admin/roster/assign][POST]", e?.message ?? e);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
