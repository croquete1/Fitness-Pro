
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="drawer lg:drawer-open">
      <input id="sidebar" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <div className="w-full navbar bg-base-300 px-4">Navbar</div>
        <div className="p-4">
          <Outlet />
        </div>
      </div>
      <div className="drawer-side">
        <label htmlFor="sidebar" className="drawer-overlay" />
        <ul className="menu p-4 w-80 bg-base-200 text-base-content">
          <li><a href="/dashboard-cliente">Dashboard Cliente</a></li>
          <li><a href="/dashboard-trainer">Dashboard Trainer</a></li>
          <li><a href="/dashboard-admin">Dashboard Admin</a></li>
        </ul>
      </div>
    </div>
  );
}
