import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

// NextAuth v5 usa handlers GET e POST para API routes no app router
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
