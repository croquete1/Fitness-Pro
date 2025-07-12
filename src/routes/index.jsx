
import {
  createBrowserRouter,
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
    element: <MainLayout />,
    children: [
      {
        path: "/dashboard-cliente",
        element: <DashboardCliente />,
      },
      {
        path: "/dashboard-trainer",
        element: <DashboardTrainer />,
      },
      {
        path: "/dashboard-admin",
        element: <DashboardAdmin />,
      },
    ],
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
