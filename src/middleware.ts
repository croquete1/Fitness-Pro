import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("tab", "overview");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = { matcher: ["/", "/dashboard/:path*", "/admin/:path*"] };
