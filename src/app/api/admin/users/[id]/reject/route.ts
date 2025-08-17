import { NextResponse } from "next/server";
import prismaAny from "@/lib/prisma";

const prisma: any =
  (prismaAny as any).prisma ??
  (prismaAny as any).default ??
  prismaAny;

const CANDIDATE_USER_MODELS = ["user", "User", "accountUser", "AccountUser"];

function firstModel(names: string[]) {
  for (const n of names) {
    const m = (prisma as any)[n];
    if (m && typeof m.update === "function") return n;
  }
  return null;
}

// POST /api/admin/users/:id/reject
export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const idRaw = ctx.params.id;
  const model = firstModel(CANDIDATE_USER_MODELS);
  if (!model) return NextResponse.json({ error: "User model not found" }, { status: 500 });

  const data: any = { status: "SUSPENDED" };
  try { data.rejectedAt = new Date(); } catch {}

  try {
    const updated = await (prisma as any)[model].update({ where: { id: idRaw }, data });
    return NextResponse.json({ data: updated });
  } catch {
    const n = Number(idRaw);
    if (!Number.isNaN(n)) {
      try {
        const updated = await (prisma as any)[model].update({ where: { id: n }, data });
        return NextResponse.json({ data: updated });
      } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? "Reject failed" }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "Reject failed" }, { status: 400 });
  }
}
