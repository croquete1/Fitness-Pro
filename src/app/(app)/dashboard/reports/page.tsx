import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ReportsDashboardClient from "./ReportsDashboardClient";
import { getSessionUserSafe } from "@/lib/session-bridge";
import { tryCreateServerClient } from "@/lib/supabaseServer";
import { getSampleReportsData } from "@/lib/fallback/reports";
import type { ReportsData } from "@/lib/reports/types";

export const metadata: Metadata = { title: "Relatórios" };
export const dynamic = "force-dynamic";

function cleanName(value: any): string {
  const candidate =
    value?.name ??
    value?.full_name ??
    value?.display_name ??
    value?.user_name ??
    value?.username ??
    value?.email ??
    value?.userEmail ??
    value?.profile_name ??
    value?.profileName ??
    null;
  if (candidate && String(candidate).trim()) return String(candidate);
  const id = value?.id ?? value?.user_id ?? value?.userId ?? null;
  return id ? String(id) : "Utilizador";
}

async function loadReportsData(): Promise<{ data: ReportsData; supabase: boolean }> {
  const sb = tryCreateServerClient();
  if (!sb) {
    return { data: getSampleReportsData(), supabase: false };
  }

  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);
  const sinceISO = since.toISOString();

  try {
    const [entriesRes, walletRes, sessionsRes, measurementsRes, trainersRes, clientsRes] = await Promise.all([
      sb
        .from("client_wallet_entries")
        .select("id,user_id,amount,desc,created_at")
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: false })
        .limit(1000),
      sb.from("client_wallet").select("user_id,balance,currency"),
      sb
        .from("pt_sessions")
        .select("id,trainer_id,client_id,status,starts_at,ends_at,duration_min,created_at")
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: false })
        .limit(1000),
      sb
        .from("anthropometry")
        .select("id,user_id,measured_at,weight_kg,body_fat_pct")
        .gte("measured_at", sinceISO)
        .order("measured_at", { ascending: false })
        .limit(1000),
      sb.from("users").select("id,name,email").in("role", ["TRAINER", "PT"]),
      sb.from("users").select("id,name,email").eq("role", "CLIENT"),
    ]);

    const error =
      entriesRes.error ||
      walletRes.error ||
      sessionsRes.error ||
      measurementsRes.error ||
      trainersRes.error ||
      clientsRes.error;
    if (error) throw error;

    const trainerMap = new Map<string, { id: string; name: string }>();
    for (const row of trainersRes.data ?? []) {
      if (!row) continue;
      const id = String(row.id);
      trainerMap.set(id, { id, name: cleanName(row) });
    }

    const clientMap = new Map<string, { id: string; name: string }>();
    for (const row of clientsRes.data ?? []) {
      if (!row) continue;
      const id = String(row.id);
      clientMap.set(id, { id, name: cleanName(row) });
    }

    const entries = (entriesRes.data ?? []).map((row) => {
      const userId = String(row.user_id);
      const amount = typeof row.amount === "number" ? row.amount : Number(row.amount ?? 0);
      if (!clientMap.has(userId)) {
        clientMap.set(userId, { id: userId, name: cleanName(row) });
      }
      return {
        id: String(row.id ?? `${userId}-${row.created_at ?? Math.random()}`),
        userId,
        userName: clientMap.get(userId)?.name ?? cleanName(row),
        date: row.created_at ?? null,
        amount,
        description: row.desc ?? null,
      };
    });

    const balances = (walletRes.data ?? []).map((row) => {
      const userId = String(row.user_id);
      if (!clientMap.has(userId)) {
        clientMap.set(userId, { id: userId, name: cleanName(row) });
      }
      return {
        userId,
        userName: clientMap.get(userId)?.name ?? cleanName(row),
        balance: typeof row.balance === "number" ? row.balance : Number(row.balance ?? 0),
        currency: row.currency ?? null,
      };
    });

    const sessions = (sessionsRes.data ?? []).map((row) => {
      const trainerId = row.trainer_id ? String(row.trainer_id) : null;
      const clientId = row.client_id ? String(row.client_id) : null;
      if (trainerId && !trainerMap.has(trainerId)) {
        trainerMap.set(trainerId, { id: trainerId, name: cleanName(row) });
      }
      if (clientId && !clientMap.has(clientId)) {
        clientMap.set(clientId, { id: clientId, name: cleanName(row) });
      }
      const startTime =
        row.starts_at ??
        (row as any)?.start_time ??
        (row as any)?.start ??
        row.created_at ??
        null;
      const endTime = row.ends_at ?? (row as any)?.end_time ?? (row as any)?.end ?? null;
      return {
        id: String(row.id ?? `${trainerId ?? "pt"}-${row.created_at ?? Math.random()}`),
        trainerId,
        trainerName: trainerId ? trainerMap.get(trainerId)?.name ?? cleanName(row) : null,
        clientId,
        clientName: clientId ? clientMap.get(clientId)?.name ?? cleanName(row) : null,
        status: row.status ?? null,
        startedAt: startTime,
        endedAt: endTime,
        durationMin: typeof row.duration_min === "number" ? row.duration_min : Number(row.duration_min ?? 0) || null,
      };
    });

    const measurements = (measurementsRes.data ?? []).map((row) => {
      const userId = String(row.user_id);
      if (!clientMap.has(userId)) {
        clientMap.set(userId, { id: userId, name: cleanName(row) });
      }
      return {
        id: String(row.id ?? `${userId}-${row.measured_at ?? Math.random()}`),
        userId,
        userName: clientMap.get(userId)?.name ?? cleanName(row),
        measuredAt: row.measured_at ?? new Date().toISOString(),
        weightKg: typeof row.weight_kg === "number" ? row.weight_kg : row.weight_kg == null ? null : Number(row.weight_kg),
        bodyFatPct:
          typeof row.body_fat_pct === "number"
            ? row.body_fat_pct
            : row.body_fat_pct == null
            ? null
            : Number(row.body_fat_pct),
      };
    });

    const currency = balances.find((item) => item.currency)?.currency ?? "EUR";

    const data: ReportsData = {
      financial: {
        entries,
        balances,
        currency,
      },
      trainerSessions: sessions,
      measurements,
      meta: {
        trainers: Array.from(trainerMap.values()).sort((a, b) => a.name.localeCompare(b.name, "pt-PT")),
        clients: Array.from(clientMap.values()).sort((a, b) => a.name.localeCompare(b.name, "pt-PT")),
        generatedAt: new Date().toISOString(),
      },
    };

    return { data, supabase: true };
  } catch (error) {
    console.warn("[reports] fallback to sample data", error);
    return { data: getSampleReportsData(), supabase: false };
  }
}

function normalizeRole(role: unknown): string {
  return typeof role === "string" ? role.toUpperCase() : "";
}

export default async function ReportsPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = normalizeRole((session.user as any)?.role ?? null);
  if (role && role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { data, supabase } = await loadReportsData();
  const viewerName = session.user?.name ?? session.user?.email ?? null;

  return <ReportsDashboardClient data={data} supabase={supabase} viewerName={viewerName} />;
}
