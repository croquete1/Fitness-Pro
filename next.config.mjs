// next.config.mjs
// @ts-check

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
};

export default nextConfig;
