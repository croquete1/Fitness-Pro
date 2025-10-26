'use client';

import * as React from 'react';
import { CheckCircle2, RefreshCcw, Save } from 'lucide-react';

import OrderListDnD, { type OrderItem } from './OrderListDnD';

type Props = {
  items: OrderItem[];
  onSave: (ids: string[]) => Promise<void>;
  title?: string;
};

type ToastState = { message: string; tone: 'success' | 'danger' | 'info' } | null;

export default function SessionOrderPanel({ items, onSave, title = 'Ordenar sessões' }: Props) {
  const [list, setList] = React.useState<OrderItem[]>(items);
  const [initial, setInitial] = React.useState<OrderItem[]>(items);
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(null);

  React.useEffect(() => {
    setList(items);
    setInitial(items);
  }, [items]);

  const isDirty = React.useMemo(() => {
    const a = initial.map((item) => item.id).join(',');
    const b = list.map((item) => item.id).join(',');
    return a !== b;
  }, [initial, list]);

  React.useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), toast.tone === 'success' ? 3200 : 4800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const handleReorder = (next: OrderItem[]) => setList(next);
  const handleReset = () => setList(initial);

  const handleSave = async () => {
    if (!isDirty || saving) return;
    setSaving(true);
    try {
      await onSave(list.map((item) => item.id));
      setInitial(list);
      setToast({ message: 'Ordem guardada com sucesso.', tone: 'success' });
    } catch (error: any) {
      setToast({ message: error?.message ?? 'Falha ao guardar ordem.', tone: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="neo-panel session-order-panel" aria-live="polite">
      <header className="session-order-panel__header">
        <div>
          <h1 className="session-order-panel__title">🗂️ {title}</h1>
          <p className="session-order-panel__subtitle">
            Arrasta, usa as setas ou o teclado para definir a ordem. Dados sincronizados com o servidor.
          </p>
        </div>
        <div className="session-order-panel__actions">
          <button
            type="button"
            className="neo-button"
            onClick={handleReset}
            disabled={!isDirty || saving}
          >
            <RefreshCcw size={16} aria-hidden /> Repor
          </button>
          <button
            type="button"
            className="neo-button neo-button--primary"
            onClick={handleSave}
            disabled={!isDirty || saving}
          >
            <Save size={16} aria-hidden /> Guardar ordem
          </button>
        </div>
      </header>

      <OrderListDnD items={list} onReorder={handleReorder} dense />

      <footer className="session-order-panel__footer">
        <div className="session-order-panel__hint">
          <CheckCircle2 size={16} aria-hidden />
          <span>
            A lista apresenta {list.length} sessões ordenadas por prioridade. O servidor atualiza a agenda imediatamente após
            guardares.
          </span>
        </div>
      </footer>

      {toast && (
        <div className="neo-alert" data-tone={toast.tone} role="status">
          <div className="neo-alert__content">
            <p className="neo-alert__message">{toast.message}</p>
          </div>
        </div>
      )}
    </section>
  );
}
