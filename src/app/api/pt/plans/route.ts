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
    if (m?.create) return n;
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

// POST /api/pt/plans
// body: { title, status?, trainerId?, clientId?, content?, meta? }
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const model = firstModel(PLAN_MODELS);
  if (!model) return NextResponse.json({ error: "Plan model not found" }, { status: 500 });

  const session = await getSession();
  const actorId = (session as any)?.user?.id ?? null;

  const data: any = {
    title: body.title ?? `Plano ${new Date().toLocaleDateString()}`,
    status: body.status ?? "ACTIVE",
    trainerId: body.trainerId ?? null,
    clientId: body.clientId ?? null,
    content: body.content ?? null,
    meta: body.meta ?? {},
  };

  let created: any;
  try {
    created = await (prisma as any)[model].create({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Create failed" }, { status: 400 });
  }

  // ► EVENTOS & HISTORY
  await writeEvent({ type: "PLAN_CREATED", actorId, trainerId: data.trainerId, userId: data.clientId, planId: created.id });
  await appendPlanHistory(String(created.id), { kind: "PLAN_CREATED", text: `Plano de treino criado`, by: actorId });

  if (data.clientId) {
    await upsertPlanAssignment({ planId: String(created.id), clientId: data.clientId, trainerId: data.trainerId ?? null });
    await writeEvent({ type: "PLAN_ASSIGNED", actorId, trainerId: data.trainerId, userId: data.clientId, planId: created.id });
    await appendPlanHistory(String(created.id), { kind: "PLAN_ASSIGNED", text: `Atribuído ao cliente`, by: actorId, extra: { clientId: data.clientId } });
  }

  return NextResponse.json({ data: created });
}
