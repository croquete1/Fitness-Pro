import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClienteLayout from "./layouts/ClienteLayout";
import TrainerLayout from "./layouts/TrainerLayout";
import AdminLayout from "./layouts/AdminLayout";

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard/cliente" /> : <Navigate to="/login" />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard/cliente" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard/cliente" /> : <Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/cliente/*" element={<ClienteLayout />} />
        <Route path="/dashboard/pt/*" element={<TrainerLayout />} />
        <Route path="/dashboard/admin/*" element={<AdminLayout />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
