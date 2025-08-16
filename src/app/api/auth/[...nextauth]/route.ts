import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs"; // evita Edge com bcryptjs

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
