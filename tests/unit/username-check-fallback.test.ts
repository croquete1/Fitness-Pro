import test from 'node:test';
import assert from 'node:assert/strict';

let originalOverride: unknown;
let route: typeof import('@/app/api/username/check/route');

test.before(async () => {
  originalOverride = (globalThis as any).__supabaseServerClientOverride;
  route = await import('@/app/api/username/check/route');
});

test.after(() => {
  (globalThis as any).__supabaseServerClientOverride = originalOverride;
});

test('fallback mode returns offline payload when Supabase client is unavailable', async () => {
  (globalThis as any).__supabaseServerClientOverride = () => {
    throw new Error('no supabase in test');
  };

  const res = await route.GET(new Request('http://localhost/api/username/check?u=joao'));
  assert.strictEqual(res.status, 200);

  const body = await res.json();
  assert.deepEqual(body, {
    ok: true,
    available: true,
    source: 'fallback',
    normalized: 'joao',
  });
});

test('fallback mode still rejects reserved usernames', async () => {
  (globalThis as any).__supabaseServerClientOverride = () => {
    throw new Error('no supabase in test');
  };

  const res = await route.GET(new Request('http://localhost/api/username/check?u=Admin'));
  assert.strictEqual(res.status, 200);

  const body = await res.json();
  assert.deepEqual(body, {
    ok: true,
    available: false,
    reason: 'INVALID_OR_RESERVED',
    source: 'supabase',
  });
});
