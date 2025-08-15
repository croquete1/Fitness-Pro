// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logUserSignedUp } from "@/lib/logger";
import { Role, Status } from "@prisma/client";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password, role } = body as { email: string; name?: string; password: string; role?: string };

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Email e password são obrigatórios." }, { status: 400 });
    }

    const passwordHash = await hash(password, 10);
    const normRole = ((): Role => {
      const key = String(role ?? "CLIENT").trim().toUpperCase();
      return (["ADMIN", "TRAINER", "CLIENT"] as const).includes(key as any) ? (key as Role) : Role.CLIENT;
    })();

    const user = await prisma.user.create({
      data: {
        email,
        name: name ?? null,
        passwordHash,
        role: normRole,
        status: Status.PENDING,
      },
    });

    await logUserSignedUp({ userId: user.id, role: user.role, email: user.email });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Erro inesperado" }, { status: 500 });
  }
}
