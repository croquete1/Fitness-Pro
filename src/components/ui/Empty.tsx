'use client';

export default function Empty({ icon = '🔍', title, desc }: { icon?: string; title: string; desc?: string }) {
  return (
    <div style={{ padding: 20, border: '1px dashed var(--border)', borderRadius: 12, textAlign: 'center', color: 'var(--muted)' }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontWeight: 700, marginTop: 4, color: 'var(--text)' }}>{title}</div>
      {desc ? <div style={{ marginTop: 4 }}>{desc}</div> : null}
    </div>
  );
}
