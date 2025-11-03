import test from 'node:test';
import assert from 'node:assert/strict';

const supabaseState: {
  impl: () => any;
  calls: Array<unknown[]>;
} = {
  impl: () => {
    throw new Error('supabase client impl not set');
  },
  calls: [],
};

let originalLoad: any;

test.before(async () => {
  const moduleModule = await import('node:module');
  const mod = moduleModule.default as unknown as { _load: any };
  originalLoad = mod._load;
  mod._load = function patchedModuleLoad(request: string, parent: any, isMain: boolean) {
    if (request.includes('next-auth/providers/credentials')) {
      return function Credentials(config: any) {
        return { id: 'credentials', type: 'credentials', name: 'Credentials', ...config };
      };
    }
    if (request.includes('next/headers')) {
      return {
        headers() {
          return new Map();
        },
        cookies() {
          return { getAll: () => [] };
        },
      };
    }
    if (request.includes('next-auth/jwt')) {
      return {
        getToken: async () => null,
      };
    }
    if (request === 'next-auth') {
      return {
        getServerSession: async () => null,
      };
    }
    if (request === '@/lib/authServer') {
      return {
        getCurrentUser: async () => ({ id: 'legacy-user', role: 'ADMIN' }),
      };
    }
    return originalLoad.call(this, request, parent, isMain);
  };
});

let notificationsRoute: typeof import('@/app/api/admin/notifications/route');
let notificationsIdRoute: typeof import('@/app/api/admin/notifications/[id]/route');

test.before(async () => {
  notificationsRoute = await import('@/app/api/admin/notifications/route');
  notificationsIdRoute = await import('@/app/api/admin/notifications/[id]/route');
});

test.after(async () => {
  const moduleModule = await import('node:module');
  const mod = moduleModule.default as unknown as { _load: any };
  mod._load = originalLoad;
  (globalThis as any).__sessionBridgeOverride = undefined;
  (globalThis as any).__supabaseServerClientOverride = undefined;
});

test.beforeEach(() => {
  supabaseState.calls = [];
  (globalThis as any).__sessionBridgeOverride = undefined;
  (globalThis as any).__supabaseServerClientOverride = () => {
    supabaseState.calls.push([]);
    return supabaseState.impl();
  };
});

function setSessionOverride(role: 'ADMIN' | 'PT' | 'CLIENT', id = `${role.toLowerCase()}-1`) {
  (globalThis as any).__sessionBridgeOverride = {
    session: null,
    user: { id, role },
    id,
    role,
  } as any;
}

test('GET returns 403 for non-admin roles', async () => {
  setSessionOverride('PT', 'pt-1');
  supabaseState.impl = () => ({ from() { throw new Error('should not be called'); } });

  const res = await notificationsRoute.GET(new Request('http://localhost/api/admin/notifications'));

  assert.strictEqual(res.status, 403);
  assert.strictEqual(supabaseState.calls.length, 0);
});

test('GET returns 200 for admin role', async () => {
  setSessionOverride('ADMIN', 'admin-1');
  supabaseState.impl = () => ({
    from() {
      const builder: any = {
        select: () => builder,
        or: () => builder,
        range: () => builder,
        order: () => builder,
        then(onFulfilled: (value: any) => any) {
          return Promise.resolve({ data: [{ id: 'n-1' }], count: 1 }).then(onFulfilled);
        },
        catch(onRejected: (reason: any) => any) {
          return Promise.resolve({ data: [{ id: 'n-1' }], count: 1 }).catch(onRejected);
        },
      };
      return builder;
    },
  });

  const res = await notificationsRoute.GET(new Request('http://localhost/api/admin/notifications'));

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body, { rows: [{ id: 'n-1' }], count: 1 });
});

test('PATCH returns 403 for non-admin roles', async () => {
  setSessionOverride('CLIENT', 'client-1');
  supabaseState.impl = () => ({ from() { throw new Error('should not be called'); } });

  const res = await notificationsIdRoute.PATCH(
    new Request('http://localhost/api/admin/notifications/1', { method: 'PATCH', body: '{}' }),
    { params: Promise.resolve({ id: '1' }) },
  );

  assert.strictEqual(res.status, 403);
  assert.strictEqual(supabaseState.calls.length, 0);
});

test('PATCH returns 200 for admin role and enriches metadata', async () => {
  setSessionOverride('ADMIN', 'admin-1');

  const metadataSelect = {
    eq: () => ({ maybeSingle: () => Promise.resolve({ data: { metadata: {} }, error: null }) }),
  };
  let capturedPayload: any;
  const updateChain = {
    eq: () => ({
      select: () => ({ maybeSingle: () => Promise.resolve({ data: { id: '1' }, error: null }) }),
    }),
  };

  supabaseState.impl = () => ({
    from(table: string) {
      if (table !== 'notifications') throw new Error(`unexpected table ${table}`);
      return {
        select: () => metadataSelect,
        update(payload: any) {
          capturedPayload = payload;
          return updateChain;
        },
      };
    },
  });

  const res = await notificationsIdRoute.PATCH(
    new Request('http://localhost/api/admin/notifications/1', {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
      headers: { 'content-type': 'application/json' },
    }),
    { params: Promise.resolve({ id: '1' }) },
  );

  assert.strictEqual(res.status, 200);
  assert.ok(capturedPayload);
  assert.strictEqual(capturedPayload.read, true);
  assert.deepEqual(capturedPayload.metadata, {
    _audit: { actor_id: 'admin-1', actor_role: 'ADMIN', last_action: 'PATCH' },
  });
});
