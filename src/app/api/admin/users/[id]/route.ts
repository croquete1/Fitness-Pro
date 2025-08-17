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

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const idRaw = ctx.params.id;
  const body = await req.json().catch(() => ({} as any));
  const model = firstModel(CANDIDATE_USER_MODELS);
  if (!model) return NextResponse.json({ error: "User model not found" }, { status: 500 });

  // só inclui campos fornecidos
  const data: any = {};
  if (typeof body.name !== "undefined") data.name = body.name;
  if (typeof body.email !== "undefined") data.email = body.email;
  if (typeof body.role !== "undefined") data.role = String(body.role).toUpperCase();
  if (typeof body.status !== "undefined") data.status = String(body.status).toUpperCase();

  // tenta id string; se falhar, tenta numérico
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
        return NextResponse.json({ error: e?.message ?? "Update failed" }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}
