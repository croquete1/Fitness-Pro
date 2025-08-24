// src/app/api/notifications/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import type { Role } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

    const me = session.user as any;
    const myId = me.id as string;
    const myRole = (me.role as Role) ?? "CLIENT";

    const url = new URL(req.url);
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || 10)));
    const since = url.searchParams.get("since");
    const sinceDate = since ? new Date(since) : null;

    let where: any = {};
    if (myRole === "ADMIN") {
      where = { action: { in: ["USER_REGISTERED", "CLIENT_ASSIGNED_TO_TRAINER"] } };
    } else if (myRole === "TRAINER") {
      where = { action: "CLIENT_ASSIGNED_TO_TRAINER", target: myId };
    } else {
      // CLIENTS (neste momento não há feed especial)
      where = { action: "CLIENT_ASSIGNED_TO_TRAINER", meta: { path: ["clientId"], equals: myId } };
    }

    if (sinceDate && !isNaN(+sinceDate)) {
      where.createdAt = { gt: sinceDate };
    }

    const rows = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Normalização p/ UI de toasts
    const out = await Promise.all(
      rows.map(async (r) => {
        let title = r.message;
        let body = "";
        let href = "/dashboard";

        if (r.message === "USER_REGISTERED") {
          title = "Novo registo";
          const email = (r.diff as any)?.email;
          const wantsTrainer = !!(r.diff as any)?.wantsTrainer;
          body = email ? email + (wantsTrainer ? " · pretende ser PT" : "") : "";
          href = "/dashboard/admin/approvals";
        }
        if (r.message === "CLIENT_ASSIGNED_TO_TRAINER") {
          title = "Cliente atribuído";
          const clientName = (r.diff as any)?.clientName || (r.diff as any)?.clientEmail || "Cliente";
          body = `${clientName} foi atribuído a ti.`;
          href = "/dashboard/pt/clients";
        }

        return {
          id: r.id,
          action: r.message,
          createdAt: r.createdAt,
          title,
          body,
          href,
        };
      })
    );

    return NextResponse.json({ ok: true, data: out });
  } catch (e: any) {
    console.error("[notifications][GET]", e?.message ?? e);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
