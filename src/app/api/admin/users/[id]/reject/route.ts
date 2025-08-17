import { NextResponse } from "next/server";
import prismaAny from "@/lib/prisma";
const prisma: any = (prismaAny as any).prisma ?? (prismaAny as any).default ?? prismaAny;

// ?delete=1 -> elimina; por omissão marca como SUSPENDED
export async function POST(req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;
  const { searchParams } = new URL(req.url);
  const del = searchParams.get("delete") === "1";

  try {
    if (del) {
      await prisma.user.delete({ where: { id } });
      return NextResponse.json({ ok: true, deleted: true });
    }
    const user = await prisma.user.update({
      where: { id },
      data: { status: "SUSPENDED" },
      select: { id: true, status: true },
    });
    return NextResponse.json(user);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Reject failed" }, { status: 400 });
  }
}
