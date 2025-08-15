// src/app/(app)/api/admin/roster/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // filtros opcionais
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  const whereTrainer: Prisma.UserWhereInput = {
    role: "TRAINER",
    ...(q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] } : {}),
  };

  const trainers = await prisma.user.findMany({
    where: whereTrainer,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      trainerClientsAsTrainer: {
        include: {
          client: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  const data = trainers.map(t => ({
    id: t.id,
    name: t.name,
    email: t.email,
    clients: t.trainerClientsAsTrainer.map(tc => tc.client),
  }));

  return NextResponse.json({ trainers: data });
}
