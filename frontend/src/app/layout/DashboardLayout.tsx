import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Menu, LogOut, LayoutDashboard, Building2, Users, KanbanSquare, CalendarDays, Mail } from "lucide-react";
import { logout } from "../../services/auth.service";

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
      isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 md:grid md:grid-cols-[260px_1fr]">
      <aside className={`border-r bg-white p-4 md:block ${open ? "block" : "hidden"} md:min-h-screen`}>
        <div className="mb-6">
          <h1 className="text-xl font-bold">Campusland CRM</h1>
          <p className="text-sm text-slate-500">Prospección comercial</p>
        </div>

        <nav className="space-y-2">
          <NavLink to="/" className={linkClass}><LayoutDashboard size={18} /> Dashboard</NavLink>
          <NavLink to="/companies" className={linkClass}><Building2 size={18} /> Empresas</NavLink>
          <NavLink to="/pipeline" className={linkClass}><KanbanSquare size={18} /> Pipeline</NavLink>
          <NavLink to="/contacts" className={linkClass}><Users size={18} /> Contactos</NavLink>
          <NavLink to="/meetings" className={linkClass}><CalendarDays size={18} /> Agenda</NavLink>
          <NavLink to="/emails" className={linkClass}><Mail size={18} /> Emails</NavLink>
        </nav>

        <button
          onClick={doLogout}
          className="mt-6 flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm hover:bg-slate-50"
        >
          <LogOut size={18} /> Cerrar sesión
        </button>
      </aside>

      <main className="min-w-0">
        <header className="flex items-center justify-between border-b bg-white px-4 py-3 md:px-6">
          <button className="rounded-xl border p-2 md:hidden" onClick={() => setOpen((v) => !v)}>
            <Menu size={20} />
          </button>
          <div>
            <h2 className="text-base font-semibold">CRM de prospección</h2>
            <p className="text-xs text-slate-500">Dashboard operativo</p>
          </div>
          <div className="text-sm text-slate-600">
            {localStorage.getItem("username") ?? "Usuario"}
          </div>
        </header>

        <section className="p-4 md:p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}