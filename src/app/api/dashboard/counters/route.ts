// src/app/api/dashboard/counters/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Role } from "@prisma/client";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  const u = session?.user as any;

  // Sem sessão → devolve zeros para não rebentar o cliente
  if (!u?.id) {
    return NextResponse.json({ ok: true, data: { notificationsUnread: 0 } }, { status: 200 });
  }

  const userId = String(u.id);
  const role = (u.role ?? "CLIENT") as Role;

  // Usamos SQL direto para não depender de colunas novas no Prisma (is_read/read_at)
  const rows =
    (await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `
      select count(*)::bigint as count
      from public.notifications n
      where coalesce(n.is_read, false) = false
        and (
          n.target_user_id = $1::uuid
          or n.target_role = $2::"Role"
        )
      `,
      userId,
      role
    )) ?? [];

  const notificationsUnread = Number(rows[0]?.count ?? 0);

  return NextResponse.json(
    {
      ok: true,
      data: {
        notificationsUnread,
      },
    },
    { status: 200 }
  );
}
