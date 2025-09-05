'use client';

import React from 'react';
import Card, { CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import UIButton from '@/components/ui/UIButton'; // <- fix import path

type Tx = {
  id: string;
  date: string; // ISO
  kind: 'credit' | 'debit';
  amount: number;
  description?: string;
};

function useWallet(range: string) {
  const [loading, setLoading] = React.useState(false);
  const [summary, setSummary] = React.useState({ balance: 0, income: 0, expense: 0 });
  const [txs, setTxs] = React.useState<Tx[]>([]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/pt/wallet?range=${range}`, { cache: 'no-store' });
        const data = await res.json();
        if (alive) {
          setSummary(data.summary ?? { balance: 0, income: 0, expense: 0 });
          setTxs(data.transactions ?? []);
        }
      } catch {
        if (alive) {
          setSummary({ balance: 0, income: 0, expense: 0 });
          setTxs([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [range]);

  return { loading, summary, txs };
}

function toCSV(rows: Tx[]) {
  const header = ['id', 'date', 'type', 'amount', 'description'];
  const lines = rows.map(r => [r.id, r.date, r.kind, String(r.amount), r.description ?? ''].join(','));
  return [header.join(','), ...lines].join('\n');
}

export default function PTWalletView({ meId, isAdmin }: { meId: string; isAdmin: boolean }) {
  const [range, setRange] = React.useState<'today' | '7d' | '30d' | 'all'>('30d');
  const { loading, summary, txs } = useWallet(range);

  const exportCSV = () => {
    const blob = new Blob([toCSV(txs)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().slice(0,10);
    a.download = `wallet_${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(['today','7d','30d','all'] as const).map(key => (
          <UIButton
            key={key}
            variant={range === key ? 'primary' : 'outline'}
            onClick={() => setRange(key)}
          >
            {key === 'today' ? 'Hoje' : key === '7d' ? '7 dias' : key === '30d' ? '30 dias' : 'Tudo'}
          </UIButton>
        ))}
        <div style={{ flex: 1 }} />
        <UIButton variant="outline" onClick={exportCSV}>Exportar CSV</UIButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))', gap: 12 }}>
        <Card><CardContent>
          <div style={{ opacity: 0.7, fontSize: 12 }}>Saldo</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{summary.balance.toFixed(2)} €</div>
        </CardContent></Card>
        <Card><CardContent>
          <div style={{ opacity: 0.7, fontSize: 12 }}>Entradas</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{summary.income.toFixed(2)} €</div>
        </CardContent></Card>
        <Card><CardContent>
          <div style={{ opacity: 0.7, fontSize: 12 }}>Saídas</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{summary.expense.toFixed(2)} €</div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div style={{ fontWeight: 700 }}>Movimentos</div>
          {loading && <div style={{ fontSize: 12, opacity: 0.7 }}>A carregar…</div>}
        </CardHeader>
        <CardContent>
          {txs.length === 0 ? (
            <div style={{ opacity: 0.7 }}>Sem movimentos neste período.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: 8 }}>Data</th>
                    <th style={{ padding: 8 }}>Tipo</th>
                    <th style={{ padding: 8 }}>Valor</th>
                    <th style={{ padding: 8 }}>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.map((t) => (
                    <tr key={t.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: 8 }}>{new Date(t.date).toLocaleString()}</td>
                      <td style={{ padding: 8 }}>{t.kind === 'credit' ? 'Crédito' : 'Débito'}</td>
                      <td style={{ padding: 8 }}>{t.amount.toFixed(2)} €</td>
                      <td style={{ padding: 8 }}>{t.description ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div style={{ opacity: 0.7, fontSize: 12 }}>
            Utilizador: {meId} {isAdmin ? '(admin)' : ''}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
