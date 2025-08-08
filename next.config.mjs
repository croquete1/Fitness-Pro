/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // (exemplos úteis – adapte conforme precisar)
  experimental: {
    // appDir: true, // App Router já é padrão quando usa /app
  },
  images: {
    remotePatterns: [
      // { protocol: 'https', hostname: '…' }
    ],
  },
};

export default nextConfig;
