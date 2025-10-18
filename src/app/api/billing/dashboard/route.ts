import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { buildBillingDashboard } from '@/lib/billing/dashboard';
import { getBillingDashboardFallback } from '@/lib/fallback/billing';
import type { BillingInvoiceRecord, BillingStatus, BillingMethod } from '@/lib/billing/types';

const VALID_STATUS: BillingStatus[] = ['paid', 'pending', 'refunded'];
const VALID_METHOD: BillingMethod[] = ['mbway', 'visa', 'transfer', 'multibanco', 'cash'];

type SuccessPayload = ReturnType<typeof buildBillingDashboard> & {
  ok: true;
  source: 'supabase' | 'fallback';
};

type ErrorPayload = {
  ok: false;
  message: string;
};

export async function GET(): Promise<NextResponse<SuccessPayload | ErrorPayload>> {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: 'Não autenticado.' }, { status: 401 });
  }

  const userMeta = (session.user as { user_metadata?: { full_name?: string | null; name?: string | null } }).user_metadata;
  const fallbackViewerName = userMeta?.full_name ?? userMeta?.name ?? session.user.email ?? null;

  const fallback = getBillingDashboardFallback(fallbackViewerName);

  const sb = tryCreateServerClient();
  if (!sb) {
    return NextResponse.json({ ok: true, source: 'fallback', ...fallback });
  }

  const { data, error } = await sb
    .from('billing_invoices')
    .select(
      'id,client_id,client_name,service_name,amount,status,method,issued_at,due_at,paid_at,refunded_at,reference,notes',
    )
    .order('issued_at', { ascending: false })
    .limit(720);

  if (error) {
    console.error('[billing-dashboard] falha ao carregar faturação', error);
    return NextResponse.json({ ok: true, source: 'fallback', ...fallback });
  }

  const records: BillingInvoiceRecord[] = (data ?? []).map((row: any) => {
    const status = VALID_STATUS.includes(row.status) ? row.status : 'paid';
    const method = VALID_METHOD.includes(row.method) ? row.method : 'mbway';
    const amount = typeof row.amount === 'number' ? row.amount : Number(row.amount ?? 0);

    return {
      id: String(row.id ?? crypto.randomUUID()),
      clientId: row.client_id ?? null,
      clientName: row.client_name ?? 'Cliente sem nome',
      serviceName: row.service_name ?? 'Serviço sem descrição',
      amount: Number.isFinite(amount) ? amount : 0,
      status,
      method,
      issuedAt: row.issued_at ?? new Date().toISOString(),
      dueAt: row.due_at ?? null,
      paidAt: row.paid_at ?? null,
      refundedAt: row.refunded_at ?? null,
      reference: row.reference ?? null,
      notes: row.notes ?? null,
    } satisfies BillingInvoiceRecord;
  });

  const dashboard = buildBillingDashboard(records, { now: new Date() });
  return NextResponse.json({ ok: true, source: 'supabase', ...dashboard });
}
