import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const submit = async e => {
    e.preventDefault();
    try {
      await signup(email, pass);
      nav("/login");
    } catch {
      setErr("Erro ao registar");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-navy-900">
      <form onSubmit={submit} className="p-8 bg-white dark:bg-navy-800 shadow-lg">
        <h1>Registar</h1>
        {err && <p className="text-red-500">{err}</p>}
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Senha" value={pass} onChange={e => setPass(e.target.value)} />
        <button type="submit">Registar</button>
        <p>Já tem conta? <Link to="/login">Entrar</Link></p>
      </form>
    </div>
  );
}
