// src/app/(app)/dashboard/clients/wallet/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSessionUserSafe } from "@/lib/session-bridge";
import { createServerClient } from "@/lib/supabaseServer";

const transactionDateFormatter = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatTransactionDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return transactionDateFormatter.format(date);
}

function formatAmount(amount: number | null | undefined) {
  const value = Number(amount ?? 0);
  if (Number.isNaN(value)) return "0.00 €";
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)} €`;
}

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
    <div className="client-wallet">
      <section className="neo-panel client-wallet__panel" aria-labelledby="wallet-balance-heading">
        <div className="neo-panel__meta">
          <h1 id="wallet-balance-heading" className="neo-panel__title">
            Carteira
          </h1>
          <p className="neo-panel__subtitle">Saldo disponível para reservas e pacotes.</p>
        </div>
        <div className="neo-surface client-wallet__balance" data-variant={balance >= 0 ? "success" : "danger"}>
          Saldo atual: {balance.toFixed(2)} €
        </div>
      </section>

      <section className="neo-panel client-wallet__panel" aria-labelledby="wallet-history-heading">
        <header className="neo-panel__header client-wallet__header">
          <div className="neo-panel__meta">
            <h2 id="wallet-history-heading" className="neo-panel__title">
              Movimentos recentes
            </h2>
            <p className="neo-panel__subtitle">Últimos 100 registos ordenados por data.</p>
          </div>
          <span className="client-wallet__count">{transactions.length} movimento(s)</span>
        </header>

        <div className="neo-table-wrapper">
          <table className="neo-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th className="client-wallet__amountHeading">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatTransactionDate(entry.created_at)}</td>
                  <td className="client-wallet__description">{entry.desc ?? "—"}</td>
                  <td className="client-wallet__amount">{formatAmount(entry.amount)}</td>
                </tr>
              ))}
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
