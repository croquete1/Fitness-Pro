import LoginClient from "./LoginClient";

export const metadata = {
  title: "Iniciar sessão • Fitness Pro",
};

export default function Page() {
  // Server Component simples: só renderiza o Client Component
  return <LoginClient />;
}
