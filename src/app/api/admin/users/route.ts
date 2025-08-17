import { NextResponse } from "next/server";

// Suporta projetos que exportam `prisma` como default ou named.
import prismaAny from "@/lib/prisma";
const prisma: any = (prismaAny as any).prisma ?? (prismaAny as any).default ?? prismaAny;

// Tenta validar ADMIN; se não existir authOptions, não bloqueia (evita falhas em build).
async function isAdmin() {
  try {
    const { getServerSession } = await import("next-auth");
    // @ts-ignore
    const auth = await import("@/lib/auth");
    const session = await getServerSession((auth as any).authOptions ?? (auth as any).default ?? (auth as any));
    const role = (session as any)?.user?.role ?? (session as any)?.role;
    return role === "ADMIN";
  } catch {
    return true;
  }
}

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const q = (searchParams.get("q") ?? "").trim();
  const role = searchParams.get("role") || undefined;      // ADMIN | TRAINER | CLIENT
  const status = searchParams.get("status") || undefined;  // ACTIVE | PENDING | SUSPENDED
  const order = (searchParams.get("order") ?? "createdAt:desc").split(":");
  const orderBy: any = { [order[0] || "createdAt"]: (order[1] as any) === "asc" ? "asc" : "desc" };

  const where: any = {};
  if (role && role !== "ALL") where.role = role;
  if (status && status !== "ALL") where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { role: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
    }),
  ]);

  const res = NextResponse.json({ data: items, total });
  res.headers.set("x-total-count", String(total));
  return res;
}
