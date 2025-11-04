import test from 'node:test';
import assert from 'node:assert/strict';

import { readCurrentUser } from '@/hooks/useMe';

test('readCurrentUser returns null for 401 responses without assigning ADMIN', async () => {
  const mockFetch: typeof fetch = async () =>
    new Response('unauthorised', { status: 401, statusText: 'Unauthorized' });

  const user = await readCurrentUser(mockFetch);

  assert.strictEqual(user, null);
});

test('readCurrentUser returns null when the request rejects', async () => {
  const mockFetch: typeof fetch = async () => {
    throw new Error('network down');
  };

  const user = await readCurrentUser(mockFetch);

  assert.strictEqual(user, null);
});

test('readCurrentUser requires user object even if role is present at root level', async () => {
  const payload = JSON.stringify({ role: 'ADMIN' });
  const mockFetch: typeof fetch = async () => new Response(payload, { status: 200 });

  const user = await readCurrentUser(mockFetch);

  assert.strictEqual(user, null);
});
