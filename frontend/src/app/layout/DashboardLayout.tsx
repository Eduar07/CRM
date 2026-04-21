import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  BarChart2,
  Users,
  CheckSquare,
  Calendar,
  BookOpen,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { logout } from "../../services/auth.service";
import { STORAGE_KEYS } from "../../utils/constants";
import { useTasksBadge } from "../../hooks/useTasksBadge";

// ─── Types ────────────────────────────────────────────────────────────────────
type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

// ─── Nav data ─────────────────────────────────────────────────────────────────
const PRINCIPAL_NAV: NavItem[] = [
  { to: "/",          label: "Dashboard", icon: LayoutDashboard },
  { to: "/companies", label: "Empresas",  icon: Building2 },
  { to: "/pipeline",  label: "Pipeline",  icon: BarChart2 },
  { to: "/contacts",  label: "Contactos", icon: Users },
];

// ─── Sidebar link ─────────────────────────────────────────────────────────────
// BUG #1 FIX: Hover y activo ahora son visualmente distintos.
// Activo = borde izquierdo indigo sólido + fondo indigo tenue
// Hover  = fondo gris claro + borde izquierdo gris (nunca tapa el activo)
function SidebarLink({ to, label, icon: Icon, badge }: NavItem) {
  const getLinkClass = ({ isActive }: NavLinkRenderProps) =>
    [
      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
      "border-l-[3px]",
      isActive
        ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold"
        : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200",
    ].join(" ");

  return (
    <NavLink to={to} end={to === "/"} className={getLinkClass}>
      {({ isActive }: NavLinkRenderProps) => (
        <>
          <Icon size={17} className={isActive ? "text-indigo-600" : "text-gray-500 group-hover:text-gray-700"} />
          <span className="flex-1">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

// ─── Nav section ──────────────────────────────────────────────────────────────
function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div>
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </div>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // BUG #7 FIX: badge muestra el número real de tareas pendientes; si es 0, se oculta
  const pendingTasksCount = useTasksBadge();

  const gestionNav: NavItem[] = [
    { to: "/tasks",    label: "Tareas",      icon: CheckSquare, badge: pendingTasksCount },
    { to: "/meetings", label: "Calendario",  icon: Calendar },
    { to: "/emails",   label: "Seguimiento", icon: BookOpen },
    { to: "/reports",  label: "Reportes",    icon: TrendingUp },
  ];

  const username = localStorage.getItem(STORAGE_KEYS.username) ?? "marcela_admin";
  const initials = username.split("_")[0].slice(0, 2).toUpperCase();

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-gray-200 bg-white transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="px-5 pb-5 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              C
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-gray-900">Campusland</p>
              <p className="text-[11px] text-gray-400">CRM v1.0</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          <NavSection title="Principal" items={PRINCIPAL_NAV} />
          <NavSection title="Gestión"   items={gestionNav} />
        </nav>

        {/* User footer */}
        <div className="space-y-2 border-t border-gray-100 p-4">
          <div className="flex items-start gap-3 rounded-xl bg-gray-50 px-3 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-gray-900">{username}</p>
              <p className="truncate text-[11px] text-gray-500">Ejecutiva de ventas</p>
              <span className="mt-1 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                Santander
              </span>
            </div>
          </div>
          <button
            onClick={doLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-500 transition-colors hover:bg-gray-100"
          >
            Cambiar usuario
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 hover:bg-gray-100"
            aria-label="Abrir menú"
          >
            <ChevronRight size={20} />
          </button>
          <span className="font-semibold text-gray-900">Campusland CRM</span>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
