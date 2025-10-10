import { NextResponse } from "next/server";
import prismaAny from "@/lib/prisma";
import { appendPlanHistory, upsertPlanAssignment, writeEvent } from "@/lib/events";

const prisma: any =
  (prismaAny as any).prisma ??
  (prismaAny as any).default ??
  prismaAny;

const PLAN_MODELS = ["plan", "Plan", "trainingPlan", "TrainingPlan"];
function firstModel(cands: string[]) {
  for (const n of cands) {
    const m = (prisma as any)[n];
    if (m?.update) return n;
  }
  return null;
}

async function getSession() {
  try {
    const { getServerSession } = await import("next-auth");
    // @ts-ignore
    const auth = await import("@/lib/auth");
    return await getServerSession((auth as any).authOptions ?? (auth as any).default ?? (auth as any));
  } catch { return null; }
}

type Ctx = { params: Promise<{ planId: string }> };

// POST /api/pt/plans/:id/assign
// body: { clientId, trainerId? }
export async function POST(req: Request, ctx: Ctx) {
  const { planId } = await ctx.params;
  const body = await req.json().catch(() => ({} as any));
  const model = firstModel(PLAN_MODELS);
  if (!model) return NextResponse.json({ error: "Plan model not found" }, { status: 500 });

  const session = await getSession();
  const actorId = (session as any)?.user?.id ?? null;

  try {
    // atualiza campos diretos se existirem
    const updated = await (prisma as any)[model].update({
      where: { id: planId },
      data: {
        clientId: body.clientId ?? undefined,
        trainerId: body.trainerId ?? undefined,
      },
    });

    // mantém tabela de atribuições se existir
    await upsertPlanAssignment({
      planId: String(updated.id),
      clientId: body.clientId ?? updated.clientId ?? null,
      trainerId: body.trainerId ?? updated.trainerId ?? null,
    });

    await writeEvent({
      type: "PLAN_ASSIGNED",
      actorId,
      planId: updated.id,
      userId: body.clientId ?? updated.clientId ?? null,
      trainerId: body.trainerId ?? updated.trainerId ?? null,
    });

    await appendPlanHistory(String(updated.id), {
      kind: "PLAN_ASSIGNED",
      text: "Plano atribuído",
      by: actorId,
      extra: { clientId: body.clientId ?? updated.clientId ?? null },
    });

    return NextResponse.json({ data: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Assign failed" }, { status: 400 });
  }
}
