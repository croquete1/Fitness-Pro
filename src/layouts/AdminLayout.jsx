import { useAuth } from "../contexts/AuthContext";
export default function ClienteLayout() {
  const { logout } = useAuth();
  return (
    <div>
      <header>
        <button onClick={logout}>Logout</button>
      </header>
      <main>
        <h1>Dashboard Cliente</h1>
      </main>
    </div>
  );
}
