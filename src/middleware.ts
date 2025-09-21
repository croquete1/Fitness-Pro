// src/middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login' },
  callbacks: {
    // se a rota está no matcher, só deixa passar se houver token
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ['/dashboard/:path*'], // 🔒 só dashboard
};
