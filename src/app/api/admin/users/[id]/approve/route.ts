import { NextResponse } from "next/server";
import prismaAny from "@/lib/prisma";
const prisma: any = (prismaAny as any).prisma ?? (prismaAny as any).default ?? prismaAny;

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { status: "ACTIVE" },
      select: { id: true, status: true },
    });
    return NextResponse.json(user);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Approve failed" }, { status: 400 });
  }
}
