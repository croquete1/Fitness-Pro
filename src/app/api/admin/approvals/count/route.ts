import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Role, Status } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const pending = await prisma.user.count({
    where: { status: Status.PENDING, NOT: { role: Role.ADMIN } },
  });

  return NextResponse.json({ ok: true, data: { pending } });
}
