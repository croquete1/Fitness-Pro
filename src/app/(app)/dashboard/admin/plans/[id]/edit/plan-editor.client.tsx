'use client';

import * as React from 'react';
import { RefreshCcw, Save, ShieldCheck } from 'lucide-react';

import OrderListDnD, { type OrderItem } from '@/components/plan/OrderListDnD';

type Actor = { id: string; role: string };

type Item = {
  id: string;
  title: string;
  order_index: number;
};

type Props = {
  planId: string;
  planTitle: string;
  initialItems: Item[];
  actor: Actor;
};

type Toast = { message: string; tone: 'success' | 'danger' | 'info' } | null;

type ApiResponse = { ok?: boolean; error?: string };

function toOrderItems(items: Item[]): OrderItem[] {
  return [...items]
    .sort((a, b) => a.order_index - b.order_index)
    .map((item, index) => ({
      id: item.id,
      label: item.title.trim() || `Bloco ${index + 1}`,
      secondary: `Posição #${index + 1}`,
    }));
}

function useToast() {
  const [toast, setToast] = React.useState<Toast>(null);

  React.useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), toast.tone === 'success' ? 2400 : 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return React.useMemo(() => ({ toast, setToast }), [toast]);
}

export default function PlanBlocksEditor({ planId, planTitle, initialItems, actor }: Props) {
  const initialOrder = React.useMemo(() => toOrderItems(initialItems), [initialItems]);
  const [list, setList] = React.useState<OrderItem[]>(initialOrder);
  const [saving, setSaving] = React.useState(false);
  const { toast, setToast } = useToast();
  const initialRef = React.useRef<OrderItem[]>(initialOrder);

  React.useEffect(() => {
    initialRef.current = initialOrder;
    setList(initialOrder);
  }, [initialOrder]);

  const isDirty = React.useMemo(() => {
    const current = list.map((item) => item.id).join(',');
    const baseline = initialRef.current.map((item) => item.id).join(',');
    return current !== baseline;
  }, [list]);

  const handleReset = () => {
    setList(initialRef.current);
  };

  const handleReorder = (items: OrderItem[]) => {
    setList(items);
  };

  const handleSave = async () => {
    if (saving || !isDirty) return;
    setSaving(true);
    setToast(null);

    try {
      const payload = {
        order: list.map((item, index) => ({ id: item.id, order_index: index })),
      };
      const response = await fetch(`/api/admin/plans/${planId}/blocks/reorder`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        setToast({ tone: 'danger', message: 'Sessão expirada. Inicia sessão novamente como administrador.' });
        return;
      }
      if (response.status === 403) {
        setToast({ tone: 'danger', message: 'Sem permissões para reordenar blocos neste plano.' });
        return;
      }

      let body: ApiResponse = {};
      try {
        body = await response.json();
      } catch {
        body = {};
      }

      if (!response.ok || body.ok === false) {
        const message = body.error || 'Falha ao guardar a ordem dos blocos.';
        throw new Error(message);
      }

      initialRef.current = list;
      setToast({ tone: 'success', message: 'Ordem dos blocos guardada com sucesso.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao guardar a ordem dos blocos.';
      setToast({ tone: 'danger', message });
    } finally {
      setSaving(false);
    }
  };

  const actorLabel = React.useMemo(() => {
    if (!actor?.id) return 'Utilizador autenticado';
    const suffix = actor.id.length > 12 ? `${actor.id.slice(0, 8)}…` : actor.id;
    const role = actor.role === 'ADMIN' ? 'Administrador' : actor.role;
    return `${role} · ${suffix}`;
  }, [actor]);

  return (
    <section className="plan-blocks-editor neo-panel" aria-live="polite">
      <header className="plan-blocks-editor__header">
        <div className="plan-blocks-editor__heading">
          <p className="plan-blocks-editor__eyebrow">Gestão de planos</p>
          <h1 className="plan-blocks-editor__title">{planTitle} · ordenar blocos</h1>
          <p className="plan-blocks-editor__subtitle">
            Arrasta, usa as teclas de seta ou os botões laterais para definir a prioridade dos blocos deste plano.
          </p>
        </div>
        <div className="plan-blocks-editor__actions">
          <button
            type="button"
            className="neo-button"
            onClick={handleReset}
            disabled={!isDirty || saving}
          >
            <RefreshCcw size={16} aria-hidden /> Repor ordem
          </button>
          <button
            type="button"
            className="neo-button neo-button--primary"
            onClick={handleSave}
            disabled={!isDirty || saving}
          >
            <Save size={16} aria-hidden /> {saving ? 'A guardar…' : 'Guardar'}
          </button>
        </div>
      </header>

      {toast && (
        <div className="neo-alert" data-tone={toast.tone} role="status">
          <div className="neo-alert__content">
            <p className="neo-alert__message">{toast.message}</p>
          </div>
        </div>
      )}

      <OrderListDnD items={list} onReorder={handleReorder} dense />

      <footer className="plan-blocks-editor__footer">
        <div className="plan-blocks-editor__hint">
          <ShieldCheck size={16} aria-hidden />
          <span>Operação auditada como {actorLabel}. As alterações ficam disponíveis de imediato.</span>
        </div>
      </footer>
    </section>
  );
}
