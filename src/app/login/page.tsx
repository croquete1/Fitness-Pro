import LoginClient from "./LoginClient";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function Page({ searchParams }: PageProps) {
  const sp = searchParams ?? {};
  const registeredParam = Array.isArray(sp.registered) ? sp.registered[0] : sp.registered;
  const registered =
    registeredParam === "1" ||
    registeredParam === "true" ||
    registeredParam === "yes" ||
    registeredParam === "ok";

  return (
    <div className="auth-wrap" style={{ display: "grid", placeItems: "center", minHeight: "100dvh", padding: 16 }}>
      <form className="auth-card" aria-labelledby="auth-title" onSubmit={(e) => e.preventDefault()}>
        {registered && (
          <div className="auth-banner success" role="status" aria-live="polite">
            <span className="auth-banner__dot" aria-hidden="true" />
            Registo efetuado com sucesso. Podes iniciar sessão.
          </div>
        )}

        {/* O LoginClient contém o formulário real */}
        <LoginClient />
      </form>
    </div>
  );
}
