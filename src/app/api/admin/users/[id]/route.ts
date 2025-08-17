import { NextResponse } from "next/server";
import prismaAny from "@/lib/prisma";
const prisma: any = (prismaAny as any).prisma ?? (prismaAny as any).default ?? prismaAny;

async function isAdmin() {
  try {
    const { getServerSession } = await import("next-auth");
    // @ts-ignore
    const auth = await import("@/lib/auth");
    const session = await getServerSession((auth as any).authOptions ?? (auth as any).default ?? (auth as any));
    return (session as any)?.user?.role === "ADMIN";
  } catch {
    return true;
  }
}

export async function PATCH(_req: Request, ctx: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = ctx.params.id;
  const body = await _req.json().catch(() => ({} as any));

  // Campos permitidos
  const data: any = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.email === "string") data.email = body.email;
  if (typeof body.role === "string") data.role = body.role;          // ADMIN | TRAINER | CLIENT
  if (typeof body.status === "string") data.status = body.status;    // ACTIVE | PENDING | SUSPENDED

  try {
    const updated = await prisma.user.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Update failed" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = ctx.params.id;
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Delete failed" }, { status: 400 });
  }
}
