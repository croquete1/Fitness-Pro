// src/app/api/dashboard/messages/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock inicial – depois ligamos ao Prisma
  const items = [
    {
      id: "m1",
      from: "sistema@fitnesspro.app",
      subject: "Bem-vindo à Fitness Pro",
      preview: "A tua conta foi criada com sucesso.",
      createdAt: new Date().toISOString(),
      unread: true,
    },
    {
      id: "m2",
      from: "andre@fitnesspro.app",
      subject: "Plano atualizado",
      preview: "Já tens o plano de perna com foco em extensão...",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      unread: false,
    },
  ];

  return NextResponse.json({ items });
}
