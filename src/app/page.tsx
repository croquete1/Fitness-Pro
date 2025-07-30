// src/app/page.tsx
import { redirect } from "next/navigation"

export default function Home() {
  // Redireciona para login
  redirect("/login")
}
