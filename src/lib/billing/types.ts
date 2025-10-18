export type BillingStatus = 'paid' | 'pending' | 'refunded';
export type BillingMethod = 'mbway' | 'visa' | 'transfer' | 'multibanco' | 'cash';

export type BillingInvoiceRecord = {
  id: string;
  clientId: string | null;
  clientName: string;
  serviceName: string;
  amount: number;
  status: BillingStatus;
  method: BillingMethod;
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  reference: string | null;
  notes: string | null;
};

export type BillingLedgerRow = BillingInvoiceRecord & {
  statusLabel: string;
  methodLabel: string;
  amountLabel: string;
  issuedLabel: string;
  dueLabel: string;
};

export type BillingStatusSegment = {
  id: 'all' | BillingStatus;
  label: string;
  count: number;
};

export type BillingMethodBreakdown = {
  method: BillingMethod;
  label: string;
  count: number;
  volume: number;
  share: number;
};

export type BillingTimelinePoint = {
  date: string;
  totalVolume: number;
  paidVolume: number;
  pendingVolume: number;
  refundedVolume: number;
  invoiceCount: number;
};

export type BillingHighlight = {
  id: string;
  title: string;
  description: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
  value: string;
  meta?: string;
};

export type BillingDashboardData = {
  generatedAt: string;
  range: {
    start: string | null;
    end: string | null;
    label: string;
    invoiceCount: number;
    days: number;
  };
  totals: {
    volume: number;
    outstanding: number;
    refunded: number;
    average: number;
    paid: number;
    pending: number;
    refundedCount: number;
  };
  statuses: BillingStatusSegment[];
  methods: BillingMethodBreakdown[];
  highlights: BillingHighlight[];
  timeline: BillingTimelinePoint[];
  ledger: BillingLedgerRow[];
  nextDue: {
    id: string;
    dueAt: string;
    amount: number;
    serviceName: string;
    clientName: string;
  } | null;
};
