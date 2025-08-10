// src/app/api/admin/users/[id]/approve/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;

    if (!session?.user || role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { status: Status.APPROVED },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao aprovar utilizador" }, { status: 500 });
  }
}
