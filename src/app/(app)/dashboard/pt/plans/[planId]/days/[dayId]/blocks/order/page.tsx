'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import OrderListDnD, { type OrderItem } from '@/components/plan/OrderListDnD';

export default function OrderBlocksPage() {
  const { planId, dayId } = useParams<{ planId: string; dayId: string }>();
  const router = useRouter();

  const [items, setItems] = React.useState<OrderItem[]>([]);
  const [initial, setInitial] = React.useState<OrderItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<{ msg: string; sev: 'success' | 'error' | 'info' } | null>(null);

  const fetchBlocks = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pt/plans/${planId}/days/${dayId}/blocks`, { cache: 'no-store' });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as { items: { id: string; title?: string | null; order_index?: number | null }[] };
      const mapped: OrderItem[] = (json.items ?? [])
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((b) => ({ id: String(b.id), label: b.title ?? 'Bloco' }));
      setItems(mapped);
      setInitial(mapped);
    } catch (e: any) {
      setToast({ msg: e?.message ?? 'Falha ao carregar blocos', sev: 'error' });
      setItems([]); setInitial([]);
    } finally {
      setLoading(false);
    }
  }, [planId, dayId]);

  React.useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  const isDirty = React.useMemo(() => initial.map(i => i.id).join(',') !== items.map(i => i.id).join(','), [initial, items]);

  const handleReorder = (next: OrderItem[]) => setItems(next);
  const handleReset = () => setItems(initial);

  const handleSave = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    try {
      const pairs = items.map((it, idx) => ({ id: it.id, order_index: idx + 1 }));
      const res = await fetch(`/api/pt/plans/${planId}/days/${dayId}/blocks/reorder`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pairs }),
      });
      if (!res.ok) throw new Error(await res.text());
      setInitial(items);
      setToast({ msg: '✅ Ordem guardada', sev: 'success' });
      router.refresh();
    } catch (e: any) {
      setToast({ msg: e?.message ?? 'Falha ao guardar ordem', sev: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const toastTone = toast?.sev === 'success' ? 'success' : toast?.sev === 'error' ? 'danger' : 'neutral';

  return (
    <div className="trainer-plan-order">
      <PageHeader
        title="Ordenar blocos do dia"
        subtitle="Arrasta ou usa as setas do teclado para reorganizar a sequência."
        sticky={false}
      />

      <section className="neo-panel trainer-plan-order__panel">
        {toast && (
          <div className="neo-alert" data-tone={toastTone} role="status">
            <div className="neo-alert__content">
              <p className="neo-alert__message">{toast.msg}</p>
            </div>
            <button type="button" className="neo-alert__dismiss" onClick={() => setToast(null)} aria-label="Fechar alerta">
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="trainer-plan-order__loading" role="status" aria-live="polite">
            <span className="neo-spinner" aria-hidden /> A carregar blocos…
          </div>
        ) : (
          <OrderListDnD items={items} onReorder={handleReorder} dense />
        )}

        <div className="trainer-plan-order__actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={!isDirty || saving}
          >
            Repor
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            loading={saving}
            disabled={!isDirty || saving}
          >
            Guardar ordem
          </Button>
        </div>
      </section>
    </div>
  );
}
