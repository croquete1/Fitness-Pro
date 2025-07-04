import { Routes, Route } from "react-router-dom";
import LoginForm from "./pages/LoginForm";
import RegisterForm from "./pages/RegisterForm";
import { AdminDashboard, TrainerDashboard, ClienteDashboard } from "./pages/RoleBasedPages";
import { AuthRoleProvider } from "./contexts/authRoleContext";
import { AdminOnly, TrainerOnly, ClienteOnly } from "./pages/ProtectedRoutes";
import RedirectByRole from "./pages/RedirectByRole";
import AppRoutes from './router/routes'

<AppRoutes />


export default function App() {
  return (
    <AuthRoleProvider>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/" element={<RedirectByRole />} />
        <Route path="/admin" element={<AdminOnly><AdminDashboard /></AdminOnly>} />
        <Route path="/trainer" element={<TrainerOnly><TrainerDashboard /></TrainerOnly>} />
        <Route path="/cliente" element={<ClienteOnly><ClienteDashboard /></ClienteOnly>} />
      </Routes>
    </AuthRoleProvider>
  );
}
