export default function ForgotPasswordPage() {
  return (
    <div className="auth-screen" data-auth-root>
      <div className="auth-wrap">
        <div className="auth-card auth-simple auth-simple--notice">
          <h1 className="auth-simple__title">Recuperar palavra-passe</h1>
          <p className="auth-simple__subtitle">
            Em breve poderás pedir a reposição da tua palavra-passe por email.
          </p>
          <p className="auth-simple__note">Até lá, contacta o teu PT/Admin para apoio imediato.</p>
        </div>
      </div>
    </div>
  );
}
