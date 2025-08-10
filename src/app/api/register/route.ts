// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role, AccountStatus } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password são obrigatórios" },
        { status: 400 }
      );
    }

    const normalized = String(email).toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email: normalized } });
    if (exists) {
      return NextResponse.json({ error: "Email já registado" }, { status: 409 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name ?? null,
        email: normalized,
        passwordHash,
        role: Role.CLIENT,                 // força CLIENT
        status: AccountStatus.PENDING,     // fica pendente
      },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao registar utilizador" }, { status: 500 });
  }
}
