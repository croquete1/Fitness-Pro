import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildRateLimitHeaders,
  getRequestFingerprint,
  rateLimitIdentifier,
  resetRateLimitBuckets,
} from '@/lib/http/rateLimit';

test('rate limiter enforces the configured window per identifier', (t) => {
  resetRateLimitBuckets();
  t.after(() => {
    resetRateLimitBuckets();
  });

  const originalNow = Date.now;
  const base = Date.now();
  Date.now = () => base;
  t.after(() => {
    Date.now = originalNow;
  });

  const options = { limit: 2, windowMs: 1_000, prefix: 'unit-basic' };

  let info = rateLimitIdentifier('127.0.0.1', options);
  assert.equal(info.ok, true);
  assert.equal(info.remaining, 1);

  info = rateLimitIdentifier('127.0.0.1', options);
  assert.equal(info.ok, true);
  assert.equal(info.remaining, 0);

  info = rateLimitIdentifier('127.0.0.1', options);
  assert.equal(info.ok, false);
  assert.equal(info.remaining, 0);
});

test('rate limiter resets the bucket after the window expires', (t) => {
  resetRateLimitBuckets();
  t.after(() => {
    resetRateLimitBuckets();
  });

  const originalNow = Date.now;
  const base = Date.now();
  Date.now = () => base;
  t.after(() => {
    Date.now = originalNow;
  });

  const options = { limit: 1, windowMs: 500, prefix: 'unit-reset' };

  let info = rateLimitIdentifier('client-ip', options);
  assert.equal(info.ok, true);
  assert.equal(info.remaining, 0);

  info = rateLimitIdentifier('client-ip', options);
  assert.equal(info.ok, false);

  Date.now = () => base + 600;
  info = rateLimitIdentifier('client-ip', options);
  assert.equal(info.ok, true);
  assert.equal(info.remaining, 0);
});

test('rate limit headers expose metadata and retry instructions when blocked', (t) => {
  const originalNow = Date.now;
  const base = Date.now();
  Date.now = () => base;
  t.after(() => {
    Date.now = originalNow;
  });

  const info = {
    ok: false,
    limit: 3,
    remaining: 0,
    reset: base + 1_500,
  } as const;

  const headers = buildRateLimitHeaders(info);
  assert.equal(headers['x-ratelimit-limit'], '3');
  assert.equal(headers['x-ratelimit-remaining'], '0');
  assert.equal(headers['x-ratelimit-reset'], String(Math.ceil(info.reset / 1000)));
  assert.equal(headers['retry-after'], '2');
});

test('getRequestFingerprint prioriza cabeçalhos x-forwarded-for e ignora portas', () => {
  const request = new Request('https://example.com', {
    headers: {
      'x-forwarded-for': '203.0.113.43:8080, 198.51.100.17',
      forwarded: 'for=192.0.2.60;proto=https;by=203.0.113.1',
      'x-real-ip': '203.0.113.99',
    },
  });

  assert.equal(getRequestFingerprint(request), '203.0.113.43');
});

test('getRequestFingerprint suporta cabeçalho Forwarded com IPv6', () => {
  const request = new Request('https://example.com', {
    headers: {
      Forwarded: 'for="[2001:db8:cafe::17]:4711";proto=https;by=203.0.113.43',
    },
  });

  assert.equal(getRequestFingerprint(request), '2001:db8:cafe::17');
});

test('getRequestFingerprint recorre a request.ip ou ao identificador anónimo', () => {
  const withIp = new Request('https://example.com');
  (withIp as any).ip = '10.0.0.9';
  assert.equal(getRequestFingerprint(withIp), '10.0.0.9');

  const anonymous = new Request('https://example.com');
  assert.equal(getRequestFingerprint(anonymous), 'anonymous');
});
