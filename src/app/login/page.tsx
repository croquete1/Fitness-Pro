import dynamic from "next/dynamic";

// Carrega o componente de cliente sem SSR para evitar
// serialização de event handlers (bulletproof).
const LoginClient = dynamic(() => import("./LoginClient"), { ssr: false });

export default function Page() {
  return <LoginClient />;
}
