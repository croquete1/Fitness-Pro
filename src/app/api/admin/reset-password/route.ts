import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, newPassword, token } = await req.json();
    if (!process.env.ADMIN_RESET_TOKEN) {
      return NextResponse.json({ error: "ADMIN_RESET_TOKEN não configurado" }, { status: 500 });
    }
    if (token !== process.env.ADMIN_RESET_TOKEN) {
      return NextResponse.json({ error: "Token inválido" }, { status: 403 });
    }
    if (!email || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (!user) return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Falha no reset" }, { status: 500 });
  }
}