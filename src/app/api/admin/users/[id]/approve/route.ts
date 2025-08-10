// src/app/api/admin/users/[id]/approve/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { AccountStatus, Role } from "@prisma/client";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as Role | undefined;

  if (!session?.user || role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = params;

  await prisma.user.update({
    where: { id },
    data: { status: AccountStatus.APPROVED },
  });

  return NextResponse.json({ ok: true });
}
