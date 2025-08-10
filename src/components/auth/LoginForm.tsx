// src/components/auth/LoginForm.tsx
"use client";

import { useState, useMemo, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  error?: string;
  callbackUrl?: string;
};

function mapErrorMessage(err?: string) {
  if (!err) return undefined;
  // Mapeamento simples para não mostrar erros internos/Prisma
  if (err === "CredentialsSignin") return "Credenciais inválidas.";
  if (err === "AccessDenied") return "Acesso negado.";
  if (/Invalid|not found|enum|column|database/i.test(err))
    return "Ocorreu um erro ao iniciar sessão.";
  try {
    const decoded = decodeURIComponent(err);
    if (decoded.length > 120) return "Não foi possível iniciar sessão.";
    return decoded;
  } catch {
    return "Não foi possível iniciar sessão.";
  }
}

export default function LoginForm({ error, callbackUrl = "/dashboard" }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const initialError = useMemo(() => mapErrorMessage(error), [error]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(undefined);
    setLoading(true);

    // redirect: false para tratar feedback sem recarregar
    const res = (await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    })) as unknown as { error?: string; url?: string | null };

    if (res?.error) {
      setFormError(mapErrorMessage(res.error));
      setLoading(false);
      return;
    }

    // sucesso → redireciona
    router.push(res?.url || callbackUrl);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {(initialError || formError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError || initialError}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-800">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-900"
          placeholder="o.teu@email.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-800">
          Palavra-passe
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPwd ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-10 text-sm outline-none ring-0 placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-900"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute inset-y-0 right-2 my-auto inline-flex h-8 items-center justify-center rounded-md px-2 text-xs text-slate-600 hover:bg-slate-100"
            aria-label={showPwd ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
          >
            {showPwd ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "A entrar..." : "Entrar"}
      </button>

      <div className="text-center">
        <a
          href="/forgot-password"
          className="text-xs text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-800"
        >
          Esqueceste-te da palavra-passe?
        </a>
      </div>
    </form>
  );
}
