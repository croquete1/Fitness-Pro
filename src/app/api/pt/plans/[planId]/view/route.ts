import { NextResponse } from "next/server";
import { markPlanViewed, writeEvent } from "@/lib/events";

async function getSession() {
  try {
    const { getServerSession } = await import("next-auth");
    // @ts-ignore
    const auth = await import("@/lib/auth");
    return await getServerSession(
      (auth as any).authOptions ?? (auth as any).default ?? (auth as any)
    );
  } catch {
    return null;
  }
}

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const planId = ctx.params.id;
  const session = await getSession();
  const user = (session as any)?.user ?? null;
  const role = (user?.role ?? "").toString().toUpperCase();

  // Só conta como “visto” para CLIENT
  if (role !== "CLIENT") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    await markPlanViewed(planId, user?.id ?? null);
    await writeEvent({
      type: "PLAN_VIEWED",
      actorId: user?.id ?? null,
      userId: user?.id ?? null,
      planId,
      meta: { source: "plan-detail" },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 400 });
  }
}
