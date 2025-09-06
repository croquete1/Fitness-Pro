// src/app/(app)/dashboard/notifications/page.tsx
export const dynamic = 'force-dynamic';

export default function NotificationsCenter() {
  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h1 style={{ margin: 0 }}>Notificações</h1>
      <div className="card" style={{ padding: 12 }}>
        <div className="text-muted small">Quando houver novidades, aparecem aqui.</div>
      </div>
    </div>
  );
}
