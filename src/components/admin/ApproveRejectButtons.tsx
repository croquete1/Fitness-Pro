'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import * as ReactDOM from 'react-dom';

function Toast({ msg, kind }: { msg: string; kind: 'ok' | 'err' }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'var(--card-bg)',
        color: 'var(--text)',
        boxShadow: '0 10px 25px rgba(0,0,0,.25)',
        minWidth: 200,
      }}
    >
      <strong style={{ marginRight: 6 }}>{kind === 'ok' ? '✓' : '⚠'}</strong>
      <span>{msg}</span>
    </div>
  );
}

function showToast(msg: string, kind: 'ok' | 'err' = 'ok') {
  if (typeof document === 'undefined') return;
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.zIndex = '10050';
  host.style.top = '16px';
  host.style.right = '16px';
  document.body.appendChild(host);
  ReactDOM.render(<Toast msg={msg} kind={kind} />, host);
  setTimeout(() => {
    ReactDOM.unmountComponentAtNode(host);
    host.remove();
  }, 2200);
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      style={{ marginRight: 6, animation: 'spin 1s linear infinite' }}
    >
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" opacity="0.2" />
      <path d="M22 12a10 10 0 0 0-10-10" fill="none" stroke="currentColor" />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </svg>
  );
}

export default function ApproveRejectButtons({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const run = (method: 'PATCH' | 'DELETE', label: 'approve' | 'reject') => {
    setAction(label);
    start(async () => {
      try {
        const res = await fetch(`/api/admin/approvals/${id}`, { method });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          showToast(j?.error || 'Ocorreu um erro', 'err');
        } else {
          showToast(label === 'approve' ? 'Aprovado com sucesso' : 'Rejeitado');
          router.refresh();
        }
      } catch {
        showToast('Ocorreu um erro', 'err');
      } finally {
        setAction(null);
      }
    });
  };

  return (
    <div className="table-actions">
      <button
        className="btn chip"
        disabled={pending}
        onClick={() => run('PATCH', 'approve')}
        aria-busy={pending && action === 'approve'}
      >
        {pending && action === 'approve' ? <Spinner /> : null}
        Aprovar
      </button>
      <button
        className="btn chip"
        disabled={pending}
        onClick={() => run('DELETE', 'reject')}
        aria-busy={pending && action === 'reject'}
      >
        {pending && action === 'reject' ? <Spinner /> : null}
        Rejeitar
      </button>
    </div>
  );
}
