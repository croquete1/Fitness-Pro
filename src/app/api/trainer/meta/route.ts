// src/app/api/trainer/meta/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Role, Status } from "@prisma/client";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = {
    id: (session.user as any).id as string,
    role: (session.user as any).role as Role,
  };

  if (me.role === "CLIENT") {
    // Cliente não cria sessões
    return NextResponse.json({ me, trainers: [], clients: [] });
  }

  const [trainers, clients] = await Promise.all([
    me.role === "ADMIN"
      ? prisma.user.findMany({
          where: { role: Role.TRAINER, status: Status.APPROVED },
          select: { id: true, name: true, email: true },
          orderBy: { name: "asc" },
        })
      : prisma.user.findMany({
          where: { id: me.id },
          select: { id: true, name: true, email: true },
        }),
    prisma.user.findMany({
      where: { role: Role.CLIENT, status: Status.APPROVED },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({ me, trainers, clients });
}
