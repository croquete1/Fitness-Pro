import { NextResponse } from "next/server";
import prismaAny from "@/lib/prisma";
import { appendPlanHistory, writeEvent, upsertPlanAssignment } from "@/lib/events";

const prisma: any =
  (prismaAny as any).prisma ??
  (prismaAny as any).default ??
  prismaAny;

const PLAN_MODELS = ["plan", "Plan", "trainingPlan", "TrainingPlan"];
function firstModel(cands: string[]) {
  for (const n of cands) {
    const m = (prisma as any)[n];
    if (m?.findUnique) return n;
  }
  return null;
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  // (mesma versão que já te enviei; mantida para não partir nada)
  const id = ctx.params.id;
  const model = firstModel(PLAN_MODELS);
  if (!model) return NextResponse.json({ error: "Plan model not found" }, { status: 500 });

  let plan = null;
  try { plan = await (prisma as any)[model].findUnique({ where: { id } }); }
  catch {
    const n = Number(id);
    if (!Number.isNaN(n)) plan = await (prisma as any)[model].findUnique({ where: { id: n } }).catch(() => null);
  }
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: plan });
}

async function getSession() {
  try {
    const { getServerSession } = await import("next-auth");
    // @ts-ignore
    const auth = await import("@/lib/auth");
    return await getServerSession((auth as any).authOptions ?? (auth as any).default ?? (auth as any));
  } catch { return null; }
}

// PATCH /api/pt/plans/:id
// body: campos a alterar; se mudar clientId/trainerId, regista ASSIGNED
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const id = ctx.params.id;
  const model = firstModel(PLAN_MODELS);
  if (!model) return NextResponse.json({ error: "Plan model not found" }, { status: 500 });

  const body = await req.json().catch(() => ({} as any));
  const session = await getSession();
  const actorId = (session as any)?.user?.id ?? null;

  // obter estado anterior para diffs simples
  const prev = await (prisma as any)[model].findUnique({ where: { id } }).catch(() => null);

  try {
    const updated = await (prisma as any)[model].update({ where: { id }, data: body });

    // ► EVENTO DE UPDATE
    await writeEvent({ type: "PLAN_UPDATED", actorId, planId: updated.id, trainerId: updated.trainerId ?? null, userId: updated.clientId ?? null });
    await appendPlanHistory(String(updated.id), { kind: "PLAN_UPDATED", text: "Plano alterado", by: actorId });

    // ► Se mudou atribuição (cliente/PT), regista também ASSIGNED
    const changedClient = typeof body.clientId !== "undefined" && body.clientId !== prev?.clientId;
    const changedTrainer = typeof body.trainerId !== "undefined" && body.trainerId !== prev?.trainerId;

    if (changedClient || changedTrainer) {
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
        text: "Atribuição atualizada",
        by: actorId,
        extra: { clientId: body.clientId ?? updated.clientId ?? null, trainerId: body.trainerId ?? updated.trainerId ?? null },
      });
    }

    return NextResponse.json({ data: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Update failed" }, { status: 400 });
  }
}
