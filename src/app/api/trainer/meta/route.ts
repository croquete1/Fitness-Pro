// src/app/api/trainer/meta/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meId = (session.user as any).id as string;
    const role = (session.user as any).role as "ADMIN" | "TRAINER" | "CLIENT";

    const [me, clients, trainers] = await Promise.all([
      prisma.user.findUnique({
        where: { id: meId },
        select: { id: true, name: true, email: true },
      }),
      prisma.user.findMany({
        where: { role: Role.CLIENT },
        orderBy: [{ name: "asc" }, { email: "asc" }],
        select: { id: true, name: true, email: true },
      }),
      role === "ADMIN"
        ? prisma.user.findMany({
            where: { role: Role.TRAINER },
            orderBy: [{ name: "asc" }, { email: "asc" }],
            select: { id: true, name: true, email: true },
          })
        : prisma.user.findMany({
            where: { id: meId },
            select: { id: true, name: true, email: true },
          }),
    ]);

    return NextResponse.json({
      role,
      me,
      clients,
      trainers,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar meta" }, { status: 500 });
  }
}
