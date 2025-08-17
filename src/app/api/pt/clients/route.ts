import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prismaAny from "@/lib/prisma";

const prisma: any = (prismaAny as any).prisma ?? (prismaAny as any).default ?? prismaAny;
const CANDIDATE_USER_MODELS = ["user", "User", "accountUser", "AccountUser", "client", "Client"];

function like(q: string) {
  return { contains: q, mode: "insensitive" as const };
}
function firstModel(names: string[]) {
  for (const n of names) {
    const m = (prisma as any)[n];
    if (m && typeof m.findMany === "function") return n;
  }
  return null;
}

export async function GET(req: Request) {
  const session = await auth();
  const trainerId = (session?.user as any)?.id ?? null;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));

  const model = firstModel(CANDIDATE_USER_MODELS);
  if (!model) return NextResponse.json({ data: [] });

  const where: any = {};

  // tenta filtrar por role=CLIENT se existir
  try { where.role = "CLIENT"; } catch {}

  // se existir relacionamento com treinador, tenta usa-lo
  if (trainerId) {
    // tenta automaticamente campos comuns
    const trainerFieldCandidates = ["trainerId", "personalTrainerId", "assignedTrainerId"];
    for (const f of trainerFieldCandidates) {
      try {
        where[f] = trainerId;
        break;
      } catch {}
    }
  }

  if (q) {
    where.OR = [{ name: like(q) }, { email: like(q) }, { fullName: like(q) }];
  }

  let items: any[] = [];
  try {
    items = await (prisma as any)[model].findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    items = await (prisma as any)[model].findMany({ where, take: limit });
  }

  const data = items.map((u: any) => ({
    id: String(u.id ?? ""),
    name: u.name ?? u.fullName ?? null,
    email: u.email ?? null,
    status: (u.status ?? "ACTIVE").toString().toUpperCase(),
    createdAt: u.createdAt ?? null,
  }));

  return NextResponse.json({ data });
}
