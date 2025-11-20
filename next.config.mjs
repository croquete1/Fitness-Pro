// next.config.mjs
// @ts-check

import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// When the app is deployed from a subdirectory (e.g. monorepo setups where the
// Next.js project lives under apps/web), Next's output file tracing needs to
// start from the workspace root so dependencies like `client-only` are copied
// into the serverless functions. Otherwise Vercel may fail with errors such as
// "invalid relative path: ../../node_modules/client-only/package.json" when it
// tries to package the traced files. We look two levels up for a shared
// node_modules folder and fall back to the current directory when running this
// repo standalone.
const monorepoRoot = path.resolve(__dirname, '..', '..');
const outputFileTracingRoot = fs.existsSync(path.join(monorepoRoot, 'node_modules'))
  ? monorepoRoot
  : __dirname;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mantém o type-check do TS no build (podes pôr true para ignorar também)
  typescript: { ignoreBuildErrors: false },
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
  },
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://ecatvxnefunhdrtqxeiz.supabase.co',
  },
  outputFileTracingRoot,
};

export default nextConfig;
