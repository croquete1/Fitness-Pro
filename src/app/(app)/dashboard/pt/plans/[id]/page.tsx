export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import PlanViewBeacon from "@/components/PlanViewBeacon";

async function getPlan(id: string) {
  const r = await fetch(`/api/pt/plans/${id}`, { cache: "no-store" }).catch(() => null);
  if (!r || !r.ok) return null;
  const j = await r.json();
  return j?.data ?? null;
}

export default async function Page({ params }: { params: { id: string } }) {
  const plan = await getPlan(params.id);

  if (!plan) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Plano</h1>
        <div className="card" style={{ padding: 12 }}>
          <div className="badge-danger">Plano não encontrado.</div>
        </div>
      </div>
    );
  }

  const created = plan.createdAt ? new Date(plan.createdAt).toLocaleString() : "—";
  const viewed  = plan.viewedAt  ? new Date(plan.viewedAt).toLocaleString()  : "—";

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <h1>{plan.title ?? `Plano #${plan.id}`}</h1>

      {/* Marca visualização quando CLIENT abre o plano */}
      <PlanViewBeacon planId={String(plan.id)} />

      <div className="card" style={{ padding: 12, display: "grid", gap: 8 }}>
        <div style={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(2, minmax(0,1fr))" }}>
          <div>
            <div className="text-muted" style={{ fontSize: 12 }}>Estado</div>
            <div>
              <span className={`badge${plan.status === "ACTIVE" ? " badge-success" : plan.status === "SUSPENDED" ? " badge-danger" : ""}`}>
                {plan.status ?? "—"}
              </span>
            </div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 12 }}>Treinador</div>
            <div>{plan.trainerId ?? "—"}</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 12 }}>Criado</div>
            <div>Plano de treino criado a {created}</div>
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 12 }}>Visualização</div>
            <div>{viewed === "—" ? "Ainda não visualizado pelo cliente" : `Visualizado pelo cliente a ${viewed}`}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted">Conteúdo do plano</div>
          <div style={{ paddingTop: 6 }}>— (integração dos exercícios aqui)</div>
        </div>
      </div>
    </div>
  );
}
