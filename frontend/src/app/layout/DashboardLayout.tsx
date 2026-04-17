import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { logout } from "../../services/auth.service";
import { Button } from "../../components/ui/Button";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 md:grid md:grid-cols-[260px_1fr]">
      <aside className={`border-r bg-white p-4 md:block ${open ? "block" : "hidden"} md:min-h-screen`}>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Campusland CRM</h1>
          <p className="text-sm text-slate-500">Prospección comercial</p>
        </div>

        <Sidebar />

        <Button
          onClick={doLogout}
          variant="secondary"
          className="mt-6 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm"
        >
          <LogOut size={18} /> Cerrar sesión
        </Button>
      </aside>

      <main className="min-w-0">
        <Topbar
          onToggleMenu={() => setOpen((value) => !value)}
          username={localStorage.getItem("username") ?? "Usuario"}
        />

        <section className="p-4 md:p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
