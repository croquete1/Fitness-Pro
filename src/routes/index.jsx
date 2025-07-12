
import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import DashboardCliente from "@/pages/DashboardCliente";
import DashboardTrainer from "@/pages/DashboardTrainer";
import DashboardAdmin from "@/pages/DashboardAdmin";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/dashboard-cliente",
    element: <MainLayout><DashboardCliente /></MainLayout>,
  },
  {
    path: "/dashboard-trainer",
    element: <MainLayout><DashboardTrainer /></MainLayout>,
  },
  {
    path: "/dashboard-admin",
    element: <MainLayout><DashboardAdmin /></MainLayout>,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
]);

export default router;
