// src/app/api/admin/users/[id]/approve/route.ts
/* Aprovar utilizador:
   - POST: body opcional { role?: "TRAINER" | "CLIENT" | "ADMIN" }
           define status = ACTIVE e, se enviado, atualiza role.
*/
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Role, Status } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MaybeRole = keyof typeof Role;

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ ok: false, error: "MISSING_ID" }, { status: 400 });
    }

    // Tentar obter role do body OU querystring (?role=TRAINER)
    let desiredRole: MaybeRole | undefined;
    try {
      const url = new URL(req.url);
      const qRole = url.searchParams.get("role")?.toUpperCase() as MaybeRole | null;
      desiredRole = qRole ?? undefined;
    } catch {}

    let bodyRole: MaybeRole | undefined;
    try {
      const body = (await req.json()) as any;
      if (body?.role) bodyRole = String(body.role).toUpperCase() as MaybeRole;
    } catch {
      // ignorar se não houver JSON
    }

    const roleToSet = (bodyRole ?? desiredRole) && Role[(bodyRole ?? desiredRole)!]
      ? (Role[(bodyRole ?? desiredRole)!] as Role)
      : undefined;

    const data: any = { status: Status.ACTIVE };
    if (roleToSet) data.role = roleToSet;

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, status: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e: any) {
    console.error("[admin/users/[id]/approve][POST]", e?.message ?? e);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
