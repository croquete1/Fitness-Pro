// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: true },
  // Não usar "export": precisamos de server para rotas /api
  // Se quiseres imagem menor para Docker/Node:
  output: 'standalone',
};

export default nextConfig;
