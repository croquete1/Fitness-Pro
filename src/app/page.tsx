// src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // Envia sempre a partir de "/" para "/login".
  // O middleware já redireciona utilizadores autenticados de /login -> /dashboard.
  redirect("/login");
}
