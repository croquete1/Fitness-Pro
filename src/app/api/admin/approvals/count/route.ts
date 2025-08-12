// src/app/api/admin/approvals/count/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as "ADMIN" | "TRAINER" | "CLIENT" | undefined;
  if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const pending = await prisma.user.count({ where: { status: Status.PENDING } });
  return NextResponse.json({ pending });
}
