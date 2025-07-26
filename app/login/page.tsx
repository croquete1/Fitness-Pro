"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      const { error } = await res.json();
      setError(error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4">
      <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit">Entrar</Button>
    </form>
  );
}
