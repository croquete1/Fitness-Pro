// src/app/(app)/api/admin/roster/assign/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.trainerId || !body?.clientId) {
    return NextResponse.json({ error: "trainerId e clientId são obrigatórios" }, { status: 400 });
    }

  const { trainerId, clientId } = body as { trainerId: string; clientId: string };

  // valida existências básicas
  await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: trainerId } }),
    prisma.user.findUniqueOrThrow({ where: { id: clientId } }),
  ]);

  // cria se não existir (unique composite em [trainerId, clientId] no modelo)
  const link = await prisma.trainerClient.upsert({
    where: { trainerId_clientId: { trainerId, clientId } },
    update: {},
    create: { trainerId, clientId },
    select: { trainerId: true, clientId: true },
  });

  return NextResponse.json({ link, status: "ok" }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.trainerId || !body?.clientId) {
    return NextResponse.json({ error: "trainerId e clientId são obrigatórios" }, { status: 400 });
  }

  const { trainerId, clientId } = body as { trainerId: string; clientId: string };

  await prisma.trainerClient.delete({
    where: { trainerId_clientId: { trainerId, clientId } },
  });

  return NextResponse.json({ status: "ok" });
}
