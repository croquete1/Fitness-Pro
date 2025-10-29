import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeNotificationsListResponse } from '@/lib/notifications/list';
import type { NotificationRow } from '@/lib/notifications/types';

test('normalizeNotificationsListResponse falls back to derived type summary when API omits types', () => {
  const items: NotificationRow[] = [
    {
      id: 'ntf-1',
      title: 'Primeira',
      body: null,
      href: null,
      read: false,
      type: 'billing',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'ntf-2',
      title: 'Segunda',
      body: null,
      href: null,
      read: true,
      type: 'alert',
      created_at: '2024-01-02T00:00:00Z',
    },
    {
      id: 'ntf-3',
      title: 'Terceira',
      body: null,
      href: null,
      read: true,
      type: 'billing',
      created_at: '2024-01-03T00:00:00Z',
    },
  ];

  const normalized = normalizeNotificationsListResponse({
    items,
    total: 3,
    counts: { all: 3, unread: 1, read: 2 },
    source: 'supabase',
    generatedAt: '2024-01-04T00:00:00Z',
    types: [],
  });

  assert.equal(normalized.types.length, 2);
  assert.deepEqual(
    normalized.types.map((entry) => ({ key: entry.key, count: entry.count })),
    [
      { key: 'billing', count: 2 },
      { key: 'alert', count: 1 },
    ],
  );
  assert.equal(normalized.source, 'supabase');
});

test('normalizeNotificationsListResponse cleans labels and orders ties consistently', () => {
  const normalized = normalizeNotificationsListResponse({
    items: [],
    total: 0,
    counts: { all: 0, unread: 0, read: 0 },
    source: 'supabase',
    generatedAt: null,
    types: [
      { key: 'alert', label: '  Alertas  ', count: 3 },
      { key: 'system', label: '', count: 3 },
      { key: 'billing', label: 'Faturação', count: 5 },
    ],
  });

  assert.equal(normalized.types.length, 3);
  assert.deepEqual(
    normalized.types.map((entry) => ({ key: entry.key, label: entry.label, count: entry.count })),
    [
      { key: 'billing', label: 'Faturação', count: 5 },
      { key: 'alert', label: 'Alertas', count: 3 },
      { key: 'system', label: 'Sistema', count: 3 },
    ],
  );
});
