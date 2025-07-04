import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase_config";
import { Link } from "react-router-dom";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("cliente");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    if (password !== confirm) return setError("As palavras-passe não coincidem");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        role,
        status: "pendente",
        createdAt: new Date().toISOString()
      });
      setSuccess("Registo enviado! Aguardando aprovação do administrador.");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow rounded space-y-4">
      <h2 className="text-xl font-bold">Registar Novo Utilizador</h2>
      <input className="w-full border p-2" placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} required />
      <input className="w-full border p-2" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input className="w-full border p-2" type="password" placeholder="Palavra-passe" value={password} onChange={e => setPassword(e.target.value)} required />
      <input className="w-full border p-2" type="password" placeholder="Confirmar palavra-passe" value={confirm} onChange={e => setConfirm(e.target.value)} required />
      <select className="w-full border p-2" value={role} onChange={e => setRole(e.target.value)}>
        <option value="cliente">Cliente</option>
        <option value="trainer">Personal Trainer</option>
      </select>
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Criar Conta</button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}
      <p className="text-sm text-center mt-2">
        Já tem conta?{" "}
        <Link to="/login" className="text-blue-600 underline">Entrar</Link>
      </p>
    </form>
  );
}
