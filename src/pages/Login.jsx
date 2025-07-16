import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const submit = async e => {
    e.preventDefault();
    try {
      await login(email, pass);
      nav("/dashboard/cliente");
    } catch {
      setErr("Credenciais inválidas");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-navy-900">
      <form onSubmit={submit} className="p-8 bg-white dark:bg-navy-800 shadow-lg">
        <h1>Entrar</h1>
        {err && <p className="text-red-500">{err}</p>}
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Senha" value={pass} onChange={e => setPass(e.target.value)} />
        <button type="submit">Entrar</button>
        <p>Não tem conta? <Link to="/register">Registar</Link></p>
      </form>
    </div>
  );
}
