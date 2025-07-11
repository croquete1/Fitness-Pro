export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 bg-white shadow">Topbar</div>
      <div className="flex">
        <aside className="w-60 bg-gray-800 text-white min-h-screen p-4">Sidebar</aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}