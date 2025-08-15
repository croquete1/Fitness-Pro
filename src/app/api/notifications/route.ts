import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const uid = (session.user as any).id as string;
  const role = (session.user as any).role as Role;

  const limit = Math.max(1, Math.min(25, Number(req.nextUrl.searchParams.get("limit") || "5")));
  const sinceParam = req.nextUrl.searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : null;

  const where: any = {
    OR: [
      { targetUserId: uid },
      { targetRole: role },
      { targetRole: null }, // broadcast (ALL)
    ],
  };
  if (!Number.isNaN(since?.getTime() ?? NaN)) {
    where.createdAt = { gt: since };
  }

  const list = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true, title: true, body: true, href: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, data: list });
}
