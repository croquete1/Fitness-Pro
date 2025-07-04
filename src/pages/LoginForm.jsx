import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase_config";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const ref = doc(db, "users", cred.user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      if (data.status !== "aprovado") {
        setError("Conta pendente de aprovação pelo administrador.");
        return;
      }
      setError("");
      navigate("/");
    } catch (err) {
      setError("Credenciais inválidas");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow rounded space-y-4">
      <h2 className="text-xl font-bold">Entrar</h2>
      <input className="w-full border p-2" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input className="w-full border p-2" type="password" placeholder="Palavra-passe" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Entrar</button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}
