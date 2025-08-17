import { NextResponse } from "next/server";
import prismaAny from "@/lib/prisma";
const prisma: any = (prismaAny as any).prisma ?? (prismaAny as any).default ?? prismaAny;

function like(q: string) {
  return { contains: q, mode: "insensitive" as const };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const q     = (searchParams.get("q") ?? "").trim();
  const role  = searchParams.get("role");   // optional
  const status= searchParams.get("status"); // optional

  // 1) tentar com where "rico"; se falhar (colunas não existem), cai para um where simples
  const whereRich: any = {};
  if (q) whereRich.OR = [{ name: like(q) }, { email: like(q) }, { role: like(q) }];
  if (role && role !== "ALL") whereRich.role = role;
  if (status && status !== "ALL") whereRich.status = status;

  let items: any[] = [];
  let total = 0;

  try {
    total = await prisma.user.count({ where: whereRich });
    items = await prisma.user.findMany({
      where: whereRich,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  } catch {
    // Fallback — schema sem role/status/createdAt
    const whereSimple: any = q ? { OR: [{ name: like(q) }, { email: like(q) }] } : {};
    total = await prisma.user.count({ where: whereSimple });
    items = await prisma.user.findMany({
      where: whereSimple,
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  // Normalização de campos ausentes (status/role)
  items = items.map((u: any) => ({
    ...u,
    status: u.status ?? (u.emailVerified ? "ACTIVE" : "PENDING"),
    role:   u.role   ?? "CLIENT",
  }));

  const res = NextResponse.json({ data: items, total });
  res.headers.set("x-total-count", String(total));
  return res;
}
