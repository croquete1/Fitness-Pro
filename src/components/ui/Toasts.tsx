'use client';
import { createRoot } from 'react-dom/client';

export function toast(msg: string, kind: 'ok' | 'err' = 'ok', ms = 2200) {
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.zIndex = '10050';
  host.style.top = '16px';
  host.style.right = '16px';
  document.body.appendChild(host);

  const Root = () => (
    <div
      role="status"
      style={{
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'var(--card-bg)',
        color: 'var(--text)',
        boxShadow: '0 10px 25px rgba(0,0,0,.25)',
        minWidth: 220,
      }}
    >
      <strong style={{ marginRight: 6 }}>{kind === 'ok' ? '✓' : '⚠'}</strong>
      <span>{msg}</span>
    </div>
  );

  const root = createRoot(host);
  root.render(<Root />);
  setTimeout(() => {
    root.unmount();
    host.remove();
  }, ms);
}
