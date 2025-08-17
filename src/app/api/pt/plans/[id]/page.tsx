export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import PlanViewBeacon from "@/components/PlanViewBeacon";

async function getPlan(id: string) {
  // chamada local ao endpoint que normaliza o plano
  const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/pt/plans/${id}`, {
    // em dev/local o baseUrl pode estar vazio; o Next trata
    cache: "no-store",
  }).catch(() => null);
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
      <h1>{plan.title}</h1>

      {/* regista visualização quando CLIENT abre */}
      <PlanViewBeacon planId={plan.id} />

      <div className="card" style={{ padding: 12, display: "grid", gap: 8 }}>
        <div style={{ display: "grid", gap: 6, gridTemplateColumns: "repeat(2, minmax(0,1fr))" }}>
          <div>
            <div className="text-muted" style={{ fontSize: 12 }}>Estado</div>
            <div><span className={`badge${plan.status === "ACTIVE" ? "-success" : plan.status === "SUSPENDED" ? "-danger" : ""}`}>{plan.status}</span></div>
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

        {/* espaço para conteúdos do plano (exercícios, séries, etc.) */}
        <div className="card" style={{ padding: 12 }}>
          <div className="text-muted">Conteúdo do plano</div>
          <div style={{ paddingTop: 6 }}>— (integração dos exercícios aqui)</div>
        </div>
      </div>
    </div>
  );
}
