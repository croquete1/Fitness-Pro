// src/app/page.tsx (Server Component)
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function Root() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  redirect("/dashboard"); // ajuste se o seu “home” autenticado for outro
}
