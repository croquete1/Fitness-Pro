// next.config.mjs
// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desliga o ESLint durante o build (opcional, mas elimina ruído no Vercel)
  eslint: { ignoreDuringBuilds: true },

  // Mantém o type-check do TS no build (podes pôr true para ignorar também)
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
