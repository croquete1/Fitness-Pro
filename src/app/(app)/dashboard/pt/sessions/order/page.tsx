// src/app/(app)/dashboard/pt/sessions/order/page.tsx
import { createServerClient } from '@/lib/supabaseServer';
import SessionOrderPanel from '@/components/plan/SessionOrderPanel';
import type { OrderItem } from '@/components/plan/OrderListDnD';
import { Container } from '@mui/material';
import { withDashboardContentSx } from '@/styles/dashboardContentSx';

export const dynamic = 'force-dynamic';

export default async function PTSessionsOrderPage() {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();

  let items: OrderItem[] = [];
  if (user) {
    const { data } = await sb
      .from('sessions' as any)
      .select('id, title, label, start_at, order_index')
      .eq('trainer_id', user.id)
      .order('order_index', { ascending: true, nullsFirst: true })
      .order('start_at', { ascending: true });
    items = (data ?? []).map((s: any) => ({
      id: String(s.id),
      label: s.title ?? s.label ?? 'Sessão',
      secondary: s.start_at ? new Date(s.start_at).toLocaleString() : null,
    }));
  }

  return (
    <Container sx={withDashboardContentSx()}>
      <SessionOrderPanel
        items={items}
        onSave={async (ids) => {
          const res = await fetch('/api/pt/sessions/order', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ids }),
          });
          if (!res.ok) throw new Error(await res.text());
        }}
        title="Ordenar sessões do PT"
      />
    </Container>
  );
}
