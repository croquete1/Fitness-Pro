import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthRole } from "../contexts/authRoleContext";

export default function RedirectByRole() {
  const { role, loading } = useAuthRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (role === "admin") navigate("/admin", { replace: true });
    else if (role === "trainer") navigate("/trainer", { replace: true });
    else if (role === "cliente") navigate("/cliente", { replace: true });
    else navigate("/login", { replace: true });
  }, [role, loading, navigate]);

  return <div className="p-4">Redirecionando...</div>;
}
