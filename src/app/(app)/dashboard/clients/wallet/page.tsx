// src/app/(app)/dashboard/clients/wallet/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSessionUserSafe } from "@/lib/session-bridge";
import { createServerClient } from "@/lib/supabaseServer";

export default async function WalletPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect("/login");

  const supabase = createServerClient();
  const [balanceResult, transactionsResult] = await Promise.all([
    supabase.from("client_wallet").select("balance").eq("user_id", session.user.id).maybeSingle(),
    supabase
      .from("client_wallet_entries")
      .select("id,created_at,amount,desc")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const balance = Number(balanceResult.data?.balance ?? 0);
  const transactions = transactionsResult.data ?? [];

  return (
    <div className="space-y-6">
      <section className="neo-panel space-y-3" aria-labelledby="wallet-balance-heading">
        <div>
          <h1 id="wallet-balance-heading" className="neo-panel__title">
            Carteira
          </h1>
          <p className="neo-panel__subtitle">Saldo disponível para reservas e pacotes.</p>
        </div>
        <div className="neo-surface p-4 text-lg font-semibold text-fg" data-variant={balance >= 0 ? "success" : "danger"}>
          Saldo atual: {balance.toFixed(2)} €
        </div>
      </section>

      <section className="neo-panel space-y-4" aria-labelledby="wallet-history-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="wallet-history-heading" className="neo-panel__title">
              Movimentos recentes
            </h2>
            <p className="neo-panel__subtitle">Últimos 100 registos ordenados por data.</p>
          </div>
          <span className="text-sm text-muted">{transactions.length} movimento(s)</span>
        </div>

        <div className="neo-table-wrapper">
          <table className="neo-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th className="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((entry) => {
                const formattedDate = entry.created_at
                  ? new Date(entry.created_at).toLocaleString("pt-PT")
                  : "—";
                const amount = Number(entry.amount ?? 0);
                const formattedAmount = `${amount >= 0 ? "+" : ""}${amount.toFixed(2)} €`;
                return (
                  <tr key={entry.id}>
                    <td>{formattedDate}</td>
                    <td className="text-sm text-muted">{entry.desc ?? "—"}</td>
                    <td className="text-right font-semibold">{formattedAmount}</td>
                  </tr>
                );
              })}
              {!transactions.length && (
                <tr>
                  <td colSpan={3}>
                    <div className="neo-empty">
                      <span className="neo-empty__icon" aria-hidden>
                        💳
                      </span>
                      <p className="neo-empty__title">Sem movimentos</p>
                      <p className="neo-empty__description">
                        Quando o teu PT registar carregamentos ou débitos surgem aqui automaticamente.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
