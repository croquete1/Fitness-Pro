import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildRateLimitHeaders,
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
