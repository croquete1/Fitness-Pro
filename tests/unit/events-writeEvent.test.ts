import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';

let moduleModule: any = null;
let originalLoad: any = null;

before(async () => {
  moduleModule = await import('node:module');
  originalLoad = moduleModule.default._load;
  moduleModule.default._load = function patchedModuleLoad(request: string, parent: any, isMain: boolean) {
    if (request === 'server-only' || request.includes('/server-only')) {
      return {};
    }
    return originalLoad.call(this, request, parent, isMain);
  };
});

after(() => {
  if (moduleModule && originalLoad) {
    moduleModule.default._load = originalLoad;
  }
});

test('writeEvent encapsula o payload de notificação em metadata', async (t) => {
  const insertCalls: Array<{ table: string; payload: any }> = [];

  const mockClient = {
    from(table: string) {
      return {
        insert(payload: unknown) {
          insertCalls.push({ table, payload });
          return Promise.resolve({ error: null });
        },
      };
    },
  } as const;

  const { writeEvent } = await import('@/lib/events');

  const globalAny = globalThis as { __sb_admin?: unknown; __sb_service?: unknown };
  const previousAdmin = globalAny.__sb_admin;
  const previousService = globalAny.__sb_service;

  globalAny.__sb_admin = mockClient;
  globalAny.__sb_service = mockClient;

  t.after(() => {
    if (previousAdmin === undefined) {
      delete globalAny.__sb_admin;
    } else {
      globalAny.__sb_admin = previousAdmin;
    }
    if (previousService === undefined) {
      delete globalAny.__sb_service;
    } else {
      globalAny.__sb_service = previousService;
    }
  });

  await writeEvent({
    type: 'PLAN_UPDATED',
    actorId: 'actor-1',
    userId: 'user-1',
    meta: { href: '/plans/alpha' },
  });

  const notificationInsert = insertCalls.find((call) => call.table === 'notifications');
  assert.ok(notificationInsert, 'esperávamos inserir em notifications');
  assert.equal('payload' in notificationInsert.payload, false);

  const metadata = notificationInsert.payload?.metadata as Record<string, unknown> | undefined;
  assert.ok(metadata, 'metadata deve existir');
  assert.equal(metadata?.href, '/plans/alpha');

  const event = (metadata?.event ?? null) as Record<string, unknown> | null;
  assert.ok(event, 'metadata.event deve existir');
  assert.equal(event?.type, 'PLAN_UPDATED');
  assert.equal((event?.meta as Record<string, unknown> | undefined)?.href, '/plans/alpha');
});
